import { createClient } from '@supabase/supabase-js';

const GALLERY_FOLDER_ID = '1lx4_N3hdRg_MsgDr8AyuVzrE09hLL8hJ';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function isAdmin(request, env) {
  return request.headers.get('x-admin-secret') === env.ADMIN_SECRET;
}

async function handleGallery(env) {
  if (!env.GOOGLE_DRIVE_API_KEY) return json([]);

  const params = new URLSearchParams({
    q: `'${GALLERY_FOLDER_ID}' in parents and trashed = false and (mimeType contains 'image/' or mimeType contains 'video/')`,
    fields: 'files(id, name, mimeType)',
    pageSize: '100',
    key: env.GOOGLE_DRIVE_API_KEY
  });

  try {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`);
    const data = await response.json();
    if (!response.ok) return json([]);

    const files = (data.files || []).map(f => ({
      id: f.id,
      name: f.name,
      mimeType: f.mimeType,
      image: `https://drive.google.com/thumbnail?id=${f.id}&sz=w1600`
    }));
    return json(files);
  } catch {
    return json([]);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;
    const { method } = request;
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);

    // Convite personalizado: dados do convidado pelo token
    const conviteMatch = pathname.match(/^\/api\/convite\/([^/]+)$/);
    if (conviteMatch && method === 'GET') {
      const { data, error } = await supabase
        .from('guests')
        .select('name, custom_message, max_guests, attending, confirmed_guests')
        .eq('token', conviteMatch[1])
        .single();

      if (error || !data) return json({ error: 'Convite não encontrado' }, 404);
      return json(data);
    }

    // RSVP vinculado ao token do convite
    if (pathname === '/api/rsvp' && method === 'POST') {
      const { token, message, attending } = await readJson(request);
      if (!token) return json({ error: 'Convite inválido' }, 400);

      const { data, error } = await supabase
        .from('guests')
        .update({
          attending: attending !== false,
          confirmed_guests: 1,
          rsvp_message: message || '',
          confirmed_at: new Date().toISOString()
        })
        .eq('token', token)
        .select()
        .single();

      if (error || !data) return json({ error: 'Convite não encontrado' }, 404);
      return json({ success: true, message: 'Confirmação recebida com sucesso!' });
    }

    // Fotos compartilhadas na pasta publica do Drive, para o carrossel da galeria
    if (pathname === '/api/gallery' && method === 'GET') {
      return handleGallery(env);
    }

    // Admin: login (verifica a senha, sem criar sessao no servidor)
    if (pathname === '/api/admin/login' && method === 'POST') {
      const { secret } = await readJson(request);
      if (secret !== env.ADMIN_SECRET) return json({ error: 'Resposta incorreta' }, 401);
      return json({ success: true });
    }

    // Admin: lista todos os convites
    if (pathname === '/api/admin/guests' && method === 'GET') {
      if (!isAdmin(request, env)) return json({ error: 'Não autorizado' }, 401);

      const { data, error } = await supabase
        .from('guests')
        .select('id, token, name, custom_message, max_guests, attending, confirmed_guests, rsvp_message, created_at')
        .order('created_at', { ascending: false });

      if (error) return json({ error: error.message }, 500);
      return json(data);
    }

    // Admin: cria convite personalizado e retorna o link pronto para envio
    if (pathname === '/api/admin/guests' && method === 'POST') {
      if (!isAdmin(request, env)) return json({ error: 'Não autorizado' }, 401);

      const { name, custom_message } = await readJson(request);
      if (!name) return json({ error: 'Nome é obrigatório' }, 400);

      const { data, error } = await supabase
        .from('guests')
        .insert({ name, custom_message })
        .select('token, name')
        .single();

      if (error) return json({ error: error.message }, 500);
      return json({ ...data, link: `${url.origin}/convite/${data.token}` });
    }

    const adminGuestMatch = pathname.match(/^\/api\/admin\/guests\/([^/]+)$/);

    // Admin: edita um convite existente
    if (adminGuestMatch && method === 'PATCH') {
      if (!isAdmin(request, env)) return json({ error: 'Não autorizado' }, 401);

      const { name, custom_message } = await readJson(request);
      const { data, error } = await supabase
        .from('guests')
        .update({ name, custom_message })
        .eq('token', adminGuestMatch[1])
        .select()
        .single();

      if (error || !data) return json({ error: 'Convite não encontrado' }, 404);
      return json(data);
    }

    // Admin: apaga um convite pelo token
    if (adminGuestMatch && method === 'DELETE') {
      if (!isAdmin(request, env)) return json({ error: 'Não autorizado' }, 401);

      const { error } = await supabase.from('guests').delete().eq('token', adminGuestMatch[1]);
      if (error) return json({ error: error.message }, 500);
      return json({ success: true });
    }

    // Painel administrativo
    if (pathname === '/admin') {
      return env.ASSETS.fetch(new Request(new URL('/admin.html', url), request));
    }

    // SPA fallback para convites: serve o index.html (raiz) para qualquer /convite/:token
    // (pedir "/index.html" direto causa redirect canonico do Assets pra "/")
    if (pathname.startsWith('/convite/')) {
      return env.ASSETS.fetch(new Request(new URL('/', url), request));
    }

    // Estaticos (css, js, imagens, audio) e "/" -> index.html
    return env.ASSETS.fetch(request);
  }
};

require('dotenv').config();
const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_SECRET = process.env.ADMIN_SECRET;
if (!ADMIN_SECRET) {
  throw new Error('ADMIN_SECRET não configurado no .env');
}
const GALLERY_FOLDER_ID = '1lx4_N3hdRg_MsgDr8AyuVzrE09hLL8hJ';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

function requireAdmin(req, res, next) {
  if (req.headers['x-admin-secret'] !== ADMIN_SECRET) {
    return res.status(401).json({ error: 'Não autorizado' });
  }
  next();
}

// Convite personalizado: dados do convidado pelo token
app.get('/api/convite/:token', async (req, res) => {
  const { data, error } = await supabase
    .from('guests')
    .select('name, custom_message, max_guests, attending, confirmed_guests')
    .eq('token', req.params.token)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: 'Convite não encontrado' });
  }

  res.json(data);
});

// RSVP vinculado ao token do convite
app.post('/api/rsvp', async (req, res) => {
  const { token, guests, message, attending } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Convite inválido' });
  }

  const { data, error } = await supabase
    .from('guests')
    .update({
      attending: attending !== false,
      confirmed_guests: guests || 1,
      rsvp_message: message || '',
      confirmed_at: new Date().toISOString()
    })
    .eq('token', token)
    .select()
    .single();

  if (error || !data) {
    return res.status(404).json({ error: 'Convite não encontrado' });
  }

  console.log(`✨ RSVP: ${data.name} - ${data.attending ? 'Confirmado' : 'Não poderá ir'}`);
  res.json({ success: true, message: 'Confirmação recebida com sucesso!' });
});

// Fotos compartilhadas na pasta publica do Drive, para o carrossel da galeria
app.get('/api/gallery', async (req, res) => {
  if (!process.env.GOOGLE_DRIVE_API_KEY) {
    return res.status(200).json([]);
  }

  const params = new URLSearchParams({
    q: `'${GALLERY_FOLDER_ID}' in parents and trashed = false and (mimeType contains 'image/' or mimeType contains 'video/')`,
    fields: 'files(id, name, mimeType, thumbnailLink)',
    pageSize: '100',
    key: process.env.GOOGLE_DRIVE_API_KEY
  });

  try {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`);
    const data = await response.json();

    if (!response.ok) {
      console.error('Erro Drive API:', data.error?.message);
      return res.status(200).json([]);
    }

    const files = (data.files || []).map(f => ({
      id: f.id,
      name: f.name,
      mimeType: f.mimeType,
      // URL publica de thumbnail do Drive: funciona em <img> hotlink direto
      // (o thumbnailLink da API e assinado por sessao e falha fora dela)
      image: `https://drive.google.com/thumbnail?id=${f.id}&sz=w1600`
    }));

    res.json(files);
  } catch (err) {
    console.error('Erro ao buscar galeria:', err.message);
    res.status(200).json([]);
  }
});

// Admin: login (verifica a senha e retorna ok, sem criar sessao no servidor)
app.post('/api/admin/login', (req, res) => {
  if (req.body.secret !== ADMIN_SECRET) {
    return res.status(401).json({ error: 'Resposta incorreta' });
  }
  res.json({ success: true });
});

// Admin: lista todos os convites
app.get('/api/admin/guests', requireAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from('guests')
    .select('id, token, name, custom_message, max_guests, attending, confirmed_guests, rsvp_message, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

// Admin: cria convite personalizado e retorna o link pronto para envio
app.post('/api/admin/guests', requireAdmin, async (req, res) => {
  const { name, custom_message } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Nome é obrigatório' });
  }

  const { data, error } = await supabase
    .from('guests')
    .insert({ name, custom_message })
    .select('token, name')
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const baseUrl = `${req.protocol}://${req.get('host')}`;
  res.json({ ...data, link: `${baseUrl}/convite/${data.token}` });
});

// Admin: edita um convite existente
app.patch('/api/admin/guests/:token', requireAdmin, async (req, res) => {
  const { name, custom_message } = req.body;

  const { data, error } = await supabase
    .from('guests')
    .update({ name, custom_message })
    .eq('token', req.params.token)
    .select()
    .single();

  if (error || !data) {
    return res.status(404).json({ error: 'Convite não encontrado' });
  }

  res.json(data);
});

// Admin: apaga um convite pelo token
app.delete('/api/admin/guests/:token', requireAdmin, async (req, res) => {
  const { error } = await supabase
    .from('guests')
    .delete()
    .eq('token', req.params.token);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ success: true });
});

// Painel administrativo
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// SPA fallback (inclui /convite/:token)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n💒 Site do Casamento Matheus & Iris`);
  console.log(`🌐 Rodando em: http://localhost:${PORT}`);
  console.log(`📱 Acesse pelo celular na mesma rede!\n`);
});

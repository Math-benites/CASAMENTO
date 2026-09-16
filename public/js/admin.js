/* ============================================
   PAINEL ADMIN - Convites
   ============================================ */

const SECRET_KEY = 'wedding_admin_secret';
let guests = [];

document.addEventListener('DOMContentLoaded', () => {
  initLogin();
  initModal();
  initFab();

  const saved = sessionStorage.getItem(SECRET_KEY);
  if (saved) {
    tryEnter(saved);
  }
});

/* ---------- Login ---------- */
function initLogin() {
  const form = document.getElementById('login-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const secret = document.getElementById('login-secret').value;
    await tryEnter(secret);
  });
}

async function tryEnter(secret) {
  const errorEl = document.getElementById('login-error');
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret })
    });

    if (!res.ok) {
      errorEl?.classList.remove('hidden');
      sessionStorage.removeItem(SECRET_KEY);
      return;
    }

    sessionStorage.setItem(SECRET_KEY, secret);
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('panel').classList.remove('hidden');
    loadGuests();
  } catch (err) {
    errorEl?.classList.remove('hidden');
  }
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'x-admin-secret': sessionStorage.getItem(SECRET_KEY) || ''
  };
}

/* ---------- Carregar / Renderizar ---------- */
async function loadGuests() {
  const res = await fetch('/api/admin/guests', { headers: authHeaders() });
  if (res.status === 401) {
    sessionStorage.removeItem(SECRET_KEY);
    location.reload();
    return;
  }
  guests = await res.json();
  renderGuests();
  renderSummary();
}

function renderSummary() {
  const total = guests.length;
  const confirmed = guests.filter(g => g.attending === true).length;
  const declined = guests.filter(g => g.attending === false).length;
  const pending = total - confirmed - declined;

  document.getElementById('admin-summary').innerHTML = `
    <span><strong>${total}</strong> convites</span>
    <span><strong>${confirmed}</strong> confirmados</span>
    <span><strong>${declined}</strong> recusados</span>
    <span><strong>${pending}</strong> pendentes</span>
  `;
}

function statusInfo(guest) {
  if (guest.attending === true) return { label: 'Confirmado', cls: 'confirmed' };
  if (guest.attending === false) return { label: 'Não vai', cls: 'declined' };
  return { label: 'Pendente', cls: 'pending' };
}

function renderGuests() {
  const list = document.getElementById('guest-list');

  if (guests.length === 0) {
    list.innerHTML = '<p style="text-align:center; color: var(--text-muted); padding: 40px 0;">Nenhum convite ainda. Toque em + para criar o primeiro.</p>';
    return;
  }

  list.innerHTML = guests.map(g => {
    const status = statusInfo(g);
    const link = `${location.origin}/convite/${g.token}`;
    return `
      <div class="guest-card" data-token="${g.token}">
        <div class="guest-card-top">
          <span class="guest-name">${escapeHtml(g.name)}</span>
          <span class="guest-status ${status.cls}">${status.label}</span>
        </div>
        ${g.custom_message ? `<div class="guest-message">"${escapeHtml(g.custom_message)}"</div>` : ''}
        ${g.rsvp_message ? `<div class="guest-message">Recado: "${escapeHtml(g.rsvp_message)}"</div>` : ''}
        <div class="guest-actions">
          <button class="btn-copy" data-link="${link}">Copiar link</button>
          <button class="btn-edit" data-token="${g.token}">Editar</button>
          <button class="btn-delete danger" data-token="${g.token}">Excluir</button>
        </div>
      </div>
    `;
  }).join('');

  list.querySelectorAll('.btn-copy').forEach(btn => {
    btn.addEventListener('click', () => copyLink(btn.dataset.link));
  });
  list.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', () => openEditModal(btn.dataset.token));
  });
  list.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', () => confirmDelete(btn));
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

async function copyLink(link) {
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(link);
      return;
    } catch {
      // cai no fallback abaixo
    }
  }

  const textArea = document.createElement('textarea');
  textArea.value = link;
  // Fora da tela: evita que o foco role a pagina ate aqui
  textArea.style.position = 'fixed';
  textArea.style.top = '0';
  textArea.style.left = '-9999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    document.execCommand('copy');
  } catch {
    // silencioso: sem toast
  }
  document.body.removeChild(textArea);
}

function confirmDelete(btn) {
  if (btn.dataset.confirming) {
    deleteGuest(btn.dataset.token);
    return;
  }

  btn.dataset.confirming = 'true';
  const originalText = btn.textContent;
  btn.textContent = 'Confirmar?';

  const reset = () => {
    btn.dataset.confirming = '';
    btn.textContent = originalText;
  };

  setTimeout(reset, 3000);
  btn._resetConfirm = reset;
}

async function deleteGuest(token) {
  const res = await fetch(`/api/admin/guests/${token}`, {
    method: 'DELETE',
    headers: authHeaders()
  });

  if (res.ok) {
    showToast('Convite excluído');
    loadGuests();
  } else {
    showToast('Erro ao excluir');
  }
}

/* ---------- Modal criar/editar ---------- */
function initFab() {
  document.getElementById('fab-add').addEventListener('click', () => openCreateModal());
}

function initModal() {
  const modal = document.getElementById('guest-modal');
  const form = document.getElementById('guest-form');

  document.getElementById('modal-cancel').addEventListener('click', () => closeModal());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const token = document.getElementById('guest-token').value;
    const payload = {
      name: document.getElementById('guest-name').value.trim(),
      custom_message: document.getElementById('guest-message').value.trim()
    };

    const url = token ? `/api/admin/guests/${token}` : '/api/admin/guests';
    const method = token ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: authHeaders(),
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      showToast(token ? 'Convite atualizado' : 'Convite criado');
      closeModal();
      loadGuests();
    } else {
      showToast('Erro ao salvar');
    }
  });
}

function openCreateModal() {
  document.getElementById('modal-title').textContent = 'Novo convite';
  document.getElementById('guest-token').value = '';
  document.getElementById('guest-name').value = '';
  document.getElementById('guest-message').value = '';
  document.getElementById('guest-modal').classList.remove('hidden');
}

function openEditModal(token) {
  const guest = guests.find(g => g.token === token);
  if (!guest) return;

  document.getElementById('modal-title').textContent = 'Editar convite';
  document.getElementById('guest-token').value = guest.token;
  document.getElementById('guest-name').value = guest.name;
  document.getElementById('guest-message').value = guest.custom_message || '';
  document.getElementById('guest-modal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('guest-modal').classList.add('hidden');
}

/* ---------- Toast ---------- */
function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-message');

  toastMsg.textContent = message;
  toast.classList.remove('hidden');
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.classList.add('hidden'), 400);
  }, 3000);
}

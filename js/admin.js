/**
 * Admin CMS – password protected
 * Username: admin
 * Password: Adm1n1strator
 *
 * Note: This is client-side protection only.
 * For real security use server-side auth or hosting features (Netlify, Cloudflare Access, etc.).
 */

const ADMIN_USER = 'admin';
const ADMIN_PASS = 'Adm1n1strator';
const AUTH_KEY = '7ways_admin_auth';

// ---------- Auth ----------
function isLoggedIn() {
  return sessionStorage.getItem(AUTH_KEY) === '1';
}

function login(username, password) {
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    sessionStorage.setItem(AUTH_KEY, '1');
    return true;
  }
  return false;
}

function logout() {
  sessionStorage.removeItem(AUTH_KEY);
  showLogin();
}

function showLogin() {
  document.getElementById('login-section').classList.add('visible');
  document.getElementById('admin-panel').classList.remove('visible');
}

function showAdmin() {
  document.getElementById('login-section').classList.remove('visible');
  document.getElementById('admin-panel').classList.add('visible');
  renderPeopleList();
  loadTextEditors();
}

// ---------- People data (localStorage override) ----------
function getPeople() {
  const stored = localStorage.getItem('cms_people');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {}
  }
  // Fall back to original CMS_DATA and clone
  return JSON.parse(JSON.stringify(CMS_DATA.people || []));
}

function savePeople(people) {
  localStorage.setItem('cms_people', JSON.stringify(people));
}

// Make the public site also use localStorage people if present
// (we patch this into the main data when admin saves)
function syncPeopleToRuntime(people) {
  if (typeof CMS_DATA !== 'undefined') {
    CMS_DATA.people = people;
  }
}

// ---------- Roster UI ----------
function renderPeopleList() {
  const list = document.getElementById('people-list');
  const people = getPeople();
  list.innerHTML = '';

  if (people.length === 0) {
    list.innerHTML = '<p style="color:var(--text-muted)">No people yet. Add one below.</p>';
    return;
  }

  people.forEach((person, index) => {
    const row = document.createElement('div');
    row.className = 'person-row';
    row.innerHTML = `
      <img src="${person.photo}" alt="" onerror="this.src='https://via.placeholder.com/50x50/1a1a1a/e63946?text=?'">
      <input type="text" value="${escapeAttr(person.name)}" data-field="name" data-index="${index}" placeholder="Name">
      <input type="text" value="${escapeAttr(person.nationality)}" data-field="nationality" data-index="${index}" placeholder="Nationality">
      <input type="text" value="${escapeAttr(person.photo)}" data-field="photo" data-index="${index}" placeholder="Photo URL">
      <div style="display:flex;flex-direction:column;gap:0.4rem;">
        <div class="avail-checks">
          <label><input type="checkbox" data-field="today" data-index="${index}" ${(person.available||[]).includes('today') ? 'checked' : ''}> Today</label>
          <label><input type="checkbox" data-field="tomorrow" data-index="${index}" ${(person.available||[]).includes('tomorrow') ? 'checked' : ''}> Tomorrow</label>
        </div>
        <button class="btn btn-danger btn-sm" data-delete="${index}">Delete</button>
      </div>
      <div style="grid-column: 1 / -1;">
        <label style="font-size:0.8rem;color:var(--text-muted);">Description (profile page only)</label>
        <textarea data-field="description" data-index="${index}" rows="2" style="width:100%;background:#111;border:1px solid var(--border);color:var(--text);padding:0.5rem;border-radius:4px;margin-top:0.25rem;">${escapeAttr(person.description || '')}</textarea>
      </div>
    `;
    list.appendChild(row);
  });

  // Bind change events
  list.querySelectorAll('input[data-field], textarea[data-field]').forEach(input => {
    input.addEventListener('change', onPersonFieldChange);
  });
  list.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('Delete this person?')) {
        const people = getPeople();
        people.splice(parseInt(btn.dataset.delete, 10), 1);
        savePeople(people);
        syncPeopleToRuntime(people);
        renderPeopleList();
            }
    });
  });
}

function onPersonFieldChange(e) {
  const input = e.target;
  const index = parseInt(input.dataset.index, 10);
  const field = input.dataset.field;
  const people = getPeople();
  if (!people[index]) return;

  if (field === 'today' || field === 'tomorrow') {
    const avail = new Set(people[index].available || []);
    if (input.checked) avail.add(field);
    else avail.delete(field);
    people[index].available = Array.from(avail);
  } else {
    people[index][field] = input.value.trim();
  }
  savePeople(people);
  syncPeopleToRuntime(people);
}

function addPerson() {
  const name = document.getElementById('new-name').value.trim();
  const nationality = document.getElementById('new-nationality').value.trim();
  const photo = document.getElementById('new-photo').value.trim() || 'https://via.placeholder.com/400x500/1a1a1a/e63946?text=Photo';
  const description = (document.getElementById('new-description') || {}).value || '';
  const today = document.getElementById('new-today').checked;
  const tomorrow = document.getElementById('new-tomorrow').checked;

  if (!name) {
    alert('Name is required.');
    return;
  }

  const people = getPeople();
  const maxId = people.reduce((m, p) => Math.max(m, p.id || 0), 0);
  const available = [];
  if (today) available.push('today');
  if (tomorrow) available.push('tomorrow');

  people.push({
    id: maxId + 1,
    name,
    nationality: nationality || 'Unknown',
    photo,
    description: description.trim(),
    available
  });

  savePeople(people);
  syncPeopleToRuntime(people);
  renderPeopleList();

  document.getElementById('new-name').value = '';
  document.getElementById('new-nationality').value = '';
  document.getElementById('new-photo').value = '';
  if (document.getElementById('new-description')) document.getElementById('new-description').value = '';
  document.getElementById('new-today').checked = true;
  document.getElementById('new-tomorrow').checked = false;
}

function escapeAttr(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ---------- Text editors (Pricing / Contact) ----------
let pricingEditLang = 'en';
let contactEditLang = 'en';

function getTextForLang(key, lang) {
  const storageKey = 'cms_' + key + '_' + lang;
  const stored = localStorage.getItem(storageKey);
  if (stored !== null) return stored;
  const data = CMS_DATA[key];
  if (data && typeof data === 'object') return data[lang] || data.en || '';
  return data || '';
}

function saveTextForLang(key, lang, value) {
  localStorage.setItem('cms_' + key + '_' + lang, value);
}

function loadTextEditors() {
  document.getElementById('admin-pricing-edit').value = getTextForLang('pricingText', pricingEditLang);
  document.getElementById('admin-contact-edit').value = getTextForLang('contactText', contactEditLang);
}



// ---------- Tabs ----------
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    });
  });
}


// ---------- GitHub publish ----------
function loadGhSettings() {
  try {
    return JSON.parse(localStorage.getItem('7ways_gh_settings') || '{}');
  } catch (e) { return {}; }
}

function saveGhSettingsToStore() {
  const settings = {
    owner: document.getElementById('gh-owner').value.trim(),
    repo: document.getElementById('gh-repo').value.trim(),
    branch: document.getElementById('gh-branch').value.trim() || 'main',
    path: document.getElementById('gh-path').value.trim() || 'js/data.js',
    token: document.getElementById('gh-token').value.trim()
  };
  localStorage.setItem('7ways_gh_settings', JSON.stringify(settings));
  return settings;
}

function fillGhForm() {
  const s = loadGhSettings();
  if (document.getElementById('gh-owner')) document.getElementById('gh-owner').value = s.owner || '';
  if (document.getElementById('gh-repo')) document.getElementById('gh-repo').value = s.repo || '';
  if (document.getElementById('gh-branch')) document.getElementById('gh-branch').value = s.branch || 'main';
  if (document.getElementById('gh-path')) document.getElementById('gh-path').value = s.path || 'js/data.js';
  if (document.getElementById('gh-token')) document.getElementById('gh-token').value = s.token || '';
}

function buildDataJsContent() {
  const people = getPeople();
  const langs = ['en', 'ja', 'zh', 'ko'];
  const pricing = {};
  const contact = {};
  langs.forEach(l => {
    pricing[l] = getTextForLang('pricingText', l);
    contact[l] = getTextForLang('contactText', l);
  });

  // Build a valid data.js file string
  let out = `/**\n * CMS DATA - managed via admin\n */\n\nconst CMS_DATA = {\n  people: `;
  out += JSON.stringify(people, null, 2).replace(/^/gm, '  ').replace(/^  \[/, '[');
  // simpler:
  out = '/**\n * CMS DATA - managed via admin\n */\n\nconst CMS_DATA = ' + JSON.stringify({
    people: people,
    pricingText: pricing,
    contactText: contact
  }, null, 2) + ';\n';
  return out;
}

async function publishToGitHub() {
  const s = loadGhSettings();
  if (!s.token || !s.owner || !s.repo) {
    return { ok: false, message: 'GitHub not configured – changes saved in this browser only.' };
  }

  const path = s.path || 'js/data.js';
  const branch = s.branch || 'main';
  const content = buildDataJsContent();
  const apiBase = `https://api.github.com/repos/${s.owner}/${s.repo}/contents/${path}`;

  // Get current file SHA (required for update)
  let sha = null;
  try {
    const getRes = await fetch(`${apiBase}?ref=${encodeURIComponent(branch)}`, {
      headers: {
        'Authorization': `Bearer ${s.token}`,
        'Accept': 'application/vnd.github+json'
      }
    });
    if (getRes.ok) {
      const data = await getRes.json();
      sha = data.sha;
    } else if (getRes.status !== 404) {
      const err = await getRes.text();
      return { ok: false, message: 'GitHub read failed: ' + getRes.status + ' ' + err };
    }
  } catch (e) {
    return { ok: false, message: 'Network error reading GitHub: ' + e.message };
  }

  // Encode content as base64
  const base64 = btoa(unescape(encodeURIComponent(content)));

  const body = {
    message: 'Update CMS data via admin panel',
    content: base64,
    branch: branch
  };
  if (sha) body.sha = sha;

  try {
    const putRes = await fetch(apiBase, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${s.token}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    if (!putRes.ok) {
      const err = await putRes.text();
      return { ok: false, message: 'GitHub push failed: ' + putRes.status + ' ' + err };
    }
    return { ok: true, message: '✓ Saved locally and pushed live to GitHub.' };
  } catch (e) {
    return { ok: false, message: 'Network error pushing to GitHub: ' + e.message };
  }
}

// ---------- Init ----------
document.addEventListener('DOMContentLoaded', () => {
  // Login
  document.getElementById('login-btn').addEventListener('click', () => {
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value;
    if (login(user, pass)) {
      document.getElementById('login-error').style.display = 'none';
      showAdmin();
    } else {
      document.getElementById('login-error').style.display = 'block';
    }
  });

  // Enter key on password
  document.getElementById('password').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('login-btn').click();
  });

  document.getElementById('logout-btn').addEventListener('click', logout);

  // Add person
  document.getElementById('add-person-btn').addEventListener('click', addPerson);

  // Pricing save
  document.getElementById('save-admin-pricing').addEventListener('click', () => {
    const val = document.getElementById('admin-pricing-edit').value;
    saveTextForLang('pricingText', pricingEditLang, val);
    alert('Pricing text saved for ' + pricingEditLang.toUpperCase());
    });

  // Contact save
  document.getElementById('save-admin-contact').addEventListener('click', () => {
    const val = document.getElementById('admin-contact-edit').value;
    saveTextForLang('contactText', contactEditLang, val);
    alert('Contact text saved for ' + contactEditLang.toUpperCase());
    });

  // Language tabs for text editors
  document.querySelectorAll('#pricing-lang-tabs button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#pricing-lang-tabs button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      pricingEditLang = btn.dataset.lang;
      document.getElementById('admin-pricing-edit').value = getTextForLang('pricingText', pricingEditLang);
    });
  });
  document.querySelectorAll('#contact-lang-tabs button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#contact-lang-tabs button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      contactEditLang = btn.dataset.lang;
      document.getElementById('admin-contact-edit').value = getTextForLang('contactText', contactEditLang);
    });
  });

    initTabs();


  // Save GitHub settings button
  const ghSaveBtn = document.getElementById('save-gh-settings');
  if (ghSaveBtn) {
    ghSaveBtn.addEventListener('click', () => {
      saveGhSettingsToStore();
      alert('GitHub settings saved in this browser.');
    });
  }
  fillGhForm();

  // Save & Publish – local + optional GitHub push
  document.getElementById('save-publish-btn').addEventListener('click', async () => {
    const status = document.getElementById('save-status');
    status.textContent = 'Saving…';
    status.style.color = 'var(--text-muted)';

    const pricingVal = document.getElementById('admin-pricing-edit').value;
    saveTextForLang('pricingText', pricingEditLang, pricingVal);
    const contactVal = document.getElementById('admin-contact-edit').value;
    saveTextForLang('contactText', contactEditLang, contactVal);

    const people = getPeople();
    savePeople(people);
    syncPeopleToRuntime(people);

    const result = await publishToGitHub();
    status.textContent = result.message;
    status.style.color = result.ok ? '#2a9d8f' : '#e63946';
    setTimeout(() => { status.textContent = ''; }, 8000);
  });

  // Auto-login if already authenticated in this session
  if (isLoggedIn()) {
    showAdmin();
  } else {
    showLogin();
  }
});

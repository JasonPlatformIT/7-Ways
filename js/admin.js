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
  // Apply Sydney day rollover on live data first (same rules as public site)
  if (typeof applySydneyAvailabilityRollover === 'function') {
    applySydneyAvailabilityRollover();
  } else if (typeof CMS_DATA !== 'undefined') {
    // minimal fallback if script.js helpers not loaded on admin
  }
  const stored = localStorage.getItem('cms_people');
  if (stored) {
    try {
      const list = JSON.parse(stored);
      return list.map(p => {
        if (!p.slug) p.slug = slugifyAdmin(p.name);
        return p;
      });
    } catch (e) {}
  }
  const people = JSON.parse(JSON.stringify((CMS_DATA && CMS_DATA.people) || []));
  return people.map(p => {
    if (!p.slug) p.slug = slugifyAdmin(p.name);
    return p;
  });
}

function slugifyAdmin(name) {
  if (typeof slugifyName === 'function') return slugifyName(name);
  return String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'profile';
}

function findPersonBySlug(people, slug, exceptId) {
  return (people || []).find(p => {
    if (exceptId != null && p.id === exceptId) return false;
    return (p.slug || slugifyAdmin(p.name)) === slug;
  });
}

/** Reset admin draft from the live deployed data.js (use after others published) */
function reloadFromLiveSite() {
  localStorage.removeItem('cms_people');
  ['en','ja','zh','ko'].forEach(l => {
    localStorage.removeItem('cms_pricingText_' + l);
    localStorage.removeItem('cms_contactText_' + l);
  });
  if (typeof CMS_DATA !== 'undefined') {
    // editors will re-read CMS_DATA
  }
  renderPeopleList();
  loadTextEditors();
  alert('Reloaded from the live site data. Any unpublished local edits on this device were cleared.');
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
      <img src="${(normalizePhotos(person)[0] || '')}" alt="" onerror="this.src='https://via.placeholder.com/50x50/1a1a1a/d4af37?text=?'">
      <input type="text" value="${escapeAttr(person.name)}" data-field="name" data-index="${index}" placeholder="Name">
      <input type="text" value="${escapeAttr(person.nationality)}" data-field="nationality" data-index="${index}" placeholder="Nationality">
      <div style="font-size:0.8rem;color:var(--text-muted);">Photos: ${normalizePhotos(person).length}</div>
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
      <div style="grid-column: 1 / -1; margin-top:0.5rem;">
        <label style="font-size:0.8rem;color:var(--text-muted);">Photos (multiple – first is main on Home)</label>
        <div class="admin-photo-list" data-index="${index}" style="display:flex;flex-wrap:wrap;gap:0.5rem;margin:0.5rem 0;">
          ${normalizePhotos(person).map((src, pi) => `
            <div style="position:relative;width:72px;height:72px;">
              <img src="${src}" style="width:72px;height:72px;object-fit:cover;border-radius:6px;border:1px solid var(--border);">
              <button type="button" class="btn btn-danger btn-sm" data-remove-photo="${index}" data-photo-i="${pi}" style="position:absolute;top:2px;right:2px;padding:0 4px;font-size:0.7rem;">×</button>
            </div>`).join('')}
        </div>
        <input type="file" accept="image/*" multiple data-upload-index="${index}" class="person-upload">
        <span style="font-size:0.75rem;color:var(--text-muted);"> Select images → uploads to GitHub via Worker</span>
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

  list.querySelectorAll('[data-remove-photo]').forEach(btn => {
    btn.addEventListener('click', () => {
      const people = getPeople();
      const idx = parseInt(btn.dataset.removePhoto, 10);
      const pi = parseInt(btn.dataset.photoI, 10);
      if (!people[idx]) return;
      const photos = normalizePhotos(people[idx]);
      photos.splice(pi, 1);
      people[idx].photos = photos;
      people[idx].photo = photos[0] || '';
      savePeople(people);
      syncPeopleToRuntime(people);
      renderPeopleList();
    });
  });

  list.querySelectorAll('.person-upload').forEach(input => {
    input.addEventListener('change', async () => {
      const idx = parseInt(input.dataset.uploadIndex, 10);
      const files = Array.from(input.files || []);
      if (!files.length) return;
      const people = getPeople();
      if (!people[idx]) return;
      const status = document.getElementById('save-status');
      if (status) { status.textContent = 'Uploading images…'; status.style.color = 'var(--text-muted)'; }
      try {
        const photos = normalizePhotos(people[idx]);
        for (const file of files) {
          const path = await uploadImageToGitHub(people[idx].id, file);
          photos.push(path);
        }
        people[idx].photos = photos;
        people[idx].photo = photos[0] || '';
        savePeople(people);
        syncPeopleToRuntime(people);
        renderPeopleList();
        if (status) {
          status.textContent = '✓ Images uploaded. Click Save & Publish to update listings.';
          status.style.color = '#2a9d8f';
        }
      } catch (e) {
        alert('Image upload failed: ' + e.message);
        if (status) status.textContent = '';
      }
      input.value = '';
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
    if (field === 'name') {
      const newSlug = slugifyAdmin(people[index].name);
      const clash = findPersonBySlug(people, newSlug, people[index].id);
      if (clash) {
        const ok = confirm(
          'Another profile already uses this name URL ("' + clash.name + '").\n\n' +
          'If you publish, profile links for this name will show one of them (overwrite risk).\n\nKeep this name anyway?'
        );
        if (!ok) {
          input.value = people[index].name;
          renderPeopleList();
          return;
        }
      }
      people[index].slug = newSlug;
    }
  }
  savePeople(people);
  syncPeopleToRuntime(people);
}


/** Create /name.html and push data.js so the new profile link works on the live site */
async function createProfileLinkForPerson(person) {
  const s = loadPublishSettings();
  if (!s.workerUrl) {
    return {
      ok: false,
      message: 'Profile saved here. Set Worker URL and click Save & Publish to create the live /' +
        (person.slug || slugifyAdmin(person.name)) + '.html link.'
    };
  }
  const slug = person.slug || slugifyAdmin(person.name);
  try {
    await uploadTextFileToGitHub(
      slug + '.html',
      buildPersonPageHtml(person),
      'Create profile page for ' + person.name
    );
    // Push data.js so the page can load this person
    const content = buildDataJsContent();
    const res = await fetch(s.workerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': s.adminKey || ''
      },
      body: JSON.stringify({ type: 'data', content: content })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      return {
        ok: false,
        message: 'Page file created, but data.js update failed: ' + (data.message || res.status) +
          '. Click Save & Publish.'
      };
    }
    return {
      ok: true,
      message: '✓ Profile added and live link created: /' + slug + '.html (may take ~1 min on GitHub Pages)'
    };
  } catch (e) {
    return { ok: false, message: 'Could not create profile link: ' + e.message };
  }
}

async function addPerson() {
  const name = document.getElementById('new-name').value.trim();
  const nationality = document.getElementById('new-nationality').value.trim();
  const photoUrl = document.getElementById('new-photo') ? document.getElementById('new-photo').value.trim() : '';
  const description = (document.getElementById('new-description') || {}).value || '';
  const today = document.getElementById('new-today').checked;
  const tomorrow = document.getElementById('new-tomorrow').checked;
  const fileInput = document.getElementById('new-photos-files');
  const files = fileInput ? Array.from(fileInput.files || []) : [];

  if (!name) {
    alert('Name is required.');
    return;
  }

  const people = getPeople();
  const slug = slugifyAdmin(name);
  const existing = findPersonBySlug(people, slug);
  if (existing) {
    const ok = confirm(
      'A profile with this name (or same URL name) already exists:\n\n' +
      '"' + existing.name + '"\n\n' +
      'Publishing will OVERWRITE that profile.\n\nContinue and replace the original?'
    );
    if (!ok) return;
    // Overwrite existing: keep id, replace fields later
    const idx = people.findIndex(p => p.id === existing.id);
    const today = document.getElementById('new-today').checked;
    const tomorrow = document.getElementById('new-tomorrow').checked;
    const available = [];
    if (today) available.push('today');
    if (tomorrow) available.push('tomorrow');
    const photoUrl = document.getElementById('new-photo') ? document.getElementById('new-photo').value.trim() : '';
    const description = (document.getElementById('new-description') || {}).value || '';
    const fileInput = document.getElementById('new-photos-files');
    const files = fileInput ? Array.from(fileInput.files || []) : [];
    let photos = normalizePhotos(existing);
    if (photoUrl) photos = [photoUrl].concat(photos);
    if (files.length) {
      const status = document.getElementById('save-status');
      if (status) { status.textContent = 'Uploading images…'; status.style.color = 'var(--text-muted)'; }
      try {
        for (const file of files) {
          const path = await uploadImageToGitHub(existing.id, file);
          photos.push(path);
        }
      } catch (e) {
        alert('Image upload failed: ' + e.message);
        return;
      }
    }
    people[idx] = Object.assign({}, existing, {
      name,
      slug,
      nationality: nationality || existing.nationality,
      description: (description || existing.description || '').trim(),
      available,
      photos: photos.length ? photos : (existing.photos || [existing.photo].filter(Boolean)),
      photo: (photos[0] || existing.photo || '')
    });
    people[idx].photo = people[idx].photos[0] || people[idx].photo;
    savePeople(people);
    syncPeopleToRuntime(people);
    renderPeopleList();
    const statusEl = document.getElementById('save-status');
    if (statusEl) { statusEl.textContent = 'Creating profile link…'; statusEl.style.color = 'var(--text-muted)'; }
    const linkResult = await createProfileLinkForPerson(people[idx]);
    if (statusEl) {
      statusEl.textContent = linkResult.message;
      statusEl.style.color = linkResult.ok ? '#2a9d8f' : '#d4af37';
    }
    alert(linkResult.message);
    return;
  }

  const maxId = people.reduce((m, p) => Math.max(m, p.id || 0), 0);
  const id = maxId + 1;
  const available = [];
  if (today) available.push('today');
  if (tomorrow) available.push('tomorrow');

  const photos = [];
  if (photoUrl) photos.push(photoUrl);

  const status = document.getElementById('save-status');
  if (files.length) {
    if (status) { status.textContent = 'Uploading images…'; status.style.color = 'var(--text-muted)'; }
    try {
      for (const file of files) {
        const path = await uploadImageToGitHub(id, file);
        photos.push(path);
      }
    } catch (e) {
      alert('Image upload failed: ' + e.message);
      if (status) status.textContent = '';
      return;
    }
  }

  if (!photos.length) {
    photos.push('https://via.placeholder.com/400x500/1a1a1a/d4af37?text=Photo');
  }

  const newPerson = {
    id,
    name,
    slug: slugifyAdmin(name),
    nationality: nationality || 'Unknown',
    photo: photos[0],
    photos,
    description: (description || '').trim(),
    available
  };
  people.push(newPerson);

  savePeople(people);
  syncPeopleToRuntime(people);
  renderPeopleList();

  document.getElementById('new-name').value = '';
  document.getElementById('new-nationality').value = '';
  if (document.getElementById('new-photo')) document.getElementById('new-photo').value = '';
  if (document.getElementById('new-description')) document.getElementById('new-description').value = '';
  if (fileInput) fileInput.value = '';
  document.getElementById('new-today').checked = true;
  document.getElementById('new-tomorrow').checked = false;

  if (status) { status.textContent = 'Creating profile link…'; status.style.color = 'var(--text-muted)'; }
  const linkResult = await createProfileLinkForPerson(newPerson);
  if (status) {
    status.textContent = linkResult.message;
    status.style.color = linkResult.ok ? '#2a9d8f' : '#d4af37';
  }
  if (!linkResult.ok) alert(linkResult.message);
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


// ---------- Option C: Cloudflare Worker publish ----------
function loadPublishSettings() {
  try {
    return JSON.parse(localStorage.getItem('7ways_publish_settings') || '{}');
  } catch (e) {
    return {};
  }
}

function savePublishSettingsToStore() {
  const settings = {
    workerUrl: (document.getElementById('worker-url') || {}).value || '',
    adminKey: (document.getElementById('admin-key') || {}).value || ''
  };
  settings.workerUrl = settings.workerUrl.trim().replace(/\/$/, '');
  settings.adminKey = settings.adminKey.trim();
  localStorage.setItem('7ways_publish_settings', JSON.stringify(settings));
  return settings;
}

function fillPublishForm() {
  const s = loadPublishSettings();
  const urlEl = document.getElementById('worker-url');
  const keyEl = document.getElementById('admin-key');
  if (urlEl) urlEl.value = s.workerUrl || '';
  if (keyEl) keyEl.value = s.adminKey || '';
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
  const sydneyToday = (typeof getSydneyDateString === 'function')
    ? getSydneyDateString()
    : new Date().toISOString().slice(0, 10);

  return '/**\n * CMS DATA - managed via admin\n */\n\nconst CMS_DATA = ' + JSON.stringify({
    scheduleDate: sydneyToday,
    people: people,
    pricingText: pricing,
    contactText: contact
  }, null, 2) + ';\n';
}


function normalizePhotos(person) {
  if (person.photos && person.photos.length) return person.photos.slice();
  if (person.photo) return [person.photo];
  return [];
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result || '';
      const base64 = String(result).split(',')[1] || '';
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function safeFileName(name) {
  return String(name || 'photo.jpg')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80) || 'photo.jpg';
}

async function uploadImageToGitHub(personId, file) {
  const s = loadPublishSettings();
  if (!s.workerUrl) {
    throw new Error('Set Cloudflare Worker URL first');
  }
  const base64 = await fileToBase64(file);
  const fname = Date.now() + '-' + safeFileName(file.name);
  const path = 'images/people/' + personId + '/' + fname;
  const res = await fetch(s.workerUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Key': s.adminKey || ''
    },
    body: JSON.stringify({
      type: 'image',
      path: path,
      contentBase64: base64,
      message: 'CMS photo upload for person ' + personId
    })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) {
    throw new Error(data.message || ('Upload failed HTTP ' + res.status));
  }
  // Prefer relative path so it works on the live site
  return path;
}


function buildPersonPageHtml(person) {
  const slug = person.slug || slugifyAdmin(person.name);
  const title = (person.name || 'Profile') + ' | Black Garter 7 ways';
  // Same shell as profile.html – script resolves person from the filename slug
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${String(person.name || '').replace(/"/g, '&quot;')} – Black Garter 7 ways">
  <meta name="robots" content="index,follow">
  <title>${title.replace(/</g, '')}</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body data-page="profile">
  <header>
    <nav>
      <a href="index.html" class="logo">
        <div class="logo-text">Black Garter<br><span>7 ways</span></div>
      </a>
      <ul class="nav-links">
        <li><a href="index.html">Home</a></li>
        <li><a href="roster.html">Roster</a></li>
        <li><a href="pricing.html">Pricing</a></li>
        <li><a href="employment.html">Employment</a></li>
        <li><a href="contact.html">Contact Us</a></li>
      </ul>
    </nav>
  </header>
  <div class="lang-bar">
    <div class="lang-switcher">
      <button class="lang-btn active" data-lang="en" title="English"><img src="images/flag-en.png" alt="English"></button>
      <button class="lang-btn" data-lang="ja" title="日本語"><img src="images/flag-ja.png" alt="日本語"></button>
      <button class="lang-btn" data-lang="zh" title="中文"><img src="images/flag-zh.png" alt="中文"></button>
      <button class="lang-btn" data-lang="ko" title="한국어"><img src="images/flag-ko.png" alt="한국어"></button>
    </div>
  </div>
  <main>
    <div id="profile-content"><div class="empty-state">Loading profile…</div></div>
  </main>
  <footer>
    <p>&copy; 2026 Black Garter 7 ways. All rights reserved.</p>
  </footer>
  <script src="js/data.js"></script>
  <script src="js/i18n.js"></script>
  <script src="js/script.js"></script>
</body>
</html>`;
}

async function uploadTextFileToGitHub(path, text, message) {
  const s = loadPublishSettings();
  if (!s.workerUrl) throw new Error('Set Cloudflare Worker URL first');
  const contentBase64 = btoa(unescape(encodeURIComponent(text)));
  const res = await fetch(s.workerUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Key': s.adminKey || ''
    },
    body: JSON.stringify({
      type: 'file',
      path: path,
      contentBase64: contentBase64,
      message: message || ('Update ' + path)
    })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) {
    throw new Error(data.message || ('Upload failed HTTP ' + res.status));
  }
  return data;
}

async function publishViaWorker() {
  const s = loadPublishSettings();
  if (!s.workerUrl) {
    return {
      ok: false,
      message: 'Set Cloudflare Worker URL in Publish Settings first (Option C).'
    };
  }

  const content = buildDataJsContent();
  try {
    const res = await fetch(s.workerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': s.adminKey || ''
      },
      body: JSON.stringify({ type: 'data', content: content })
    });
    let data = {};
    try {
      data = await res.json();
    } catch (e) {
      return { ok: false, message: 'Worker returned non-JSON (HTTP ' + res.status + ')' };
    }
    if (!res.ok || !data.ok) {
      return { ok: false, message: data.message || ('Publish failed (HTTP ' + res.status + ')') };
    }

    // Create clean profile pages: /sophia-laurent.html
    const people = getPeople();
    let pagesOk = 0;
    for (const person of people) {
      const slug = person.slug || slugifyAdmin(person.name);
      if (!slug) continue;
      try {
        await uploadTextFileToGitHub(
          slug + '.html',
          buildPersonPageHtml(person),
          'Profile page for ' + person.name
        );
        pagesOk++;
      } catch (err) {
        return {
          ok: false,
          message: 'Data saved, but profile page failed for ' + person.name + ': ' + err.message
        };
      }
    }

    return {
      ok: true,
      message: '✓ Live update sent. ' + pagesOk + ' profile page(s) published (e.g. /name.html). Live in ~1 minute.'
    };
  } catch (e) {
    return { ok: false, message: 'Network error calling Worker: ' + e.message };
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
      savePublishSettingsToStore();
      alert('Publish settings saved on this device.');
    });
  }
  fillPublishForm();

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
    // Detect duplicate name slugs before publish
    const slugMap = {};
    const dupes = [];
    people.forEach(p => {
      const s = p.slug || slugifyAdmin(p.name);
      p.slug = s;
      if (slugMap[s]) dupes.push(p.name + ' / ' + slugMap[s]);
      else slugMap[s] = p.name;
    });
    if (dupes.length) {
      const ok = confirm(
        'Warning: more than one profile shares the same name URL:\n\n' +
        dupes.join('\n') +
        '\n\nThe last one with that name will win on the public profile link.\n\nPublish anyway?'
      );
      if (!ok) {
        status.textContent = 'Publish cancelled.';
        return;
      }
    }
    savePeople(people);
    syncPeopleToRuntime(people);

    const result = await publishViaWorker();
    status.textContent = result.message;
    status.style.color = result.ok ? '#2a9d8f' : '#d4af37';
    setTimeout(() => { status.textContent = ''; }, 8000);
  });


  const reloadBtn = document.getElementById('reload-live-btn');
  if (reloadBtn) {
    reloadBtn.addEventListener('click', () => {
      if (confirm('Reload from the live site? Unpublished edits on this device will be lost.')) {
        reloadFromLiveSite();
      }
    });
  }

  // Auto-login if already authenticated in this session
  if (isLoggedIn()) {
    showAdmin();
  } else {
    showLogin();
  }
});

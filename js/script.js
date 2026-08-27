
function getSiteFormat() {
  const defaults = {
    bodyColor: '#f1f1f1',
    bodySize: '16px',
    headerColor: '#d4af37',
    headerSize: '2.2rem'
  };
  const f = (typeof CMS_DATA !== 'undefined' && CMS_DATA.format) ? CMS_DATA.format : {};
  return Object.assign({}, defaults, f);
}


function pinSiteTop() {
  const top = document.querySelector('.site-top');
  if (!top) return;
  const h = top.offsetHeight || 0;
  document.body.style.paddingTop = h + 'px';
}

function applySiteFormat(fmt) {
  const format = fmt || getSiteFormat();
  const root = document.documentElement;
  if (format.bodyColor) root.style.setProperty('--text', format.bodyColor);
  if (format.bodySize) root.style.setProperty('--body-size', format.bodySize);
  if (format.headerColor) {
    root.style.setProperty('--header-color', format.headerColor);
    root.style.setProperty('--red', format.headerColor);
  }
  if (format.headerSize) root.style.setProperty('--header-size', format.headerSize);
}

/**
 * Main site logic
 */

/** Sydney calendar date YYYY-MM-DD */
function getSydneyDateString(d) {
  const dt = d ? new Date(d) : new Date();
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Australia/Sydney',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(dt);
}

function parseYMD(s) {
  const [y, m, day] = String(s).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, day));
}

function addDaysYMD(ymd, days) {
  const dt = parseYMD(ymd);
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

/** Roll availability: tomorrow → today; plain today → cleared. One day per step. */
function rollAvailabilityOneDay(people) {
  return (people || []).map(p => {
    const avail = p.available || [];
    const hadTomorrow = avail.includes('tomorrow');
    const next = [];
    if (hadTomorrow) next.push('today');
    return Object.assign({}, p, { available: next });
  });
}

/**
 * Apply Sydney midnight rollovers so "today"/"tomorrow" match the current Sydney date.
 * Uses CMS_DATA.scheduleDate as the day those labels were last set for.
 * Mutates CMS_DATA in memory for display (persist via admin Save & Publish).
 */
function applySydneyAvailabilityRollover() {
  if (typeof CMS_DATA === 'undefined') return;
  const sydneyToday = getSydneyDateString();
  let schedule = CMS_DATA.scheduleDate || sydneyToday;
  if (schedule > sydneyToday) {
    // Clock skew / future date – trust schedule
    return;
  }
  let people = (CMS_DATA.people || []).map(p => Object.assign({}, p));
  let guard = 0;
  while (schedule < sydneyToday && guard < 400) {
    people = rollAvailabilityOneDay(people);
    schedule = addDaysYMD(schedule, 1);
    guard++;
  }
  CMS_DATA.people = people;
  CMS_DATA.scheduleDate = sydneyToday;
}

function slugifyName(name) {
  return String(name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'profile';
}

function profileUrl(person) {
  const slug = person.slug || slugifyName(person.name);
  // Clean URL: /sophia-laurent.html (no profile.html?name=)
  return slug + '.html';
}

/** Slug from current page path, e.g. /sophia-laurent.html → sophia-laurent */
function slugFromPathname() {
  const path = window.location.pathname || '';
  const file = path.split('/').pop() || '';
  if (!file || file === 'profile.html' || file === 'index.html') return '';
  if (file.endsWith('.html')) return file.slice(0, -5).toLowerCase();
  return '';
}



// Load text content for CURRENT language from deployed CMS_DATA (GitHub = source of truth)
// key = 'pricingText' or 'contactText'
function getTextContent(key, lang) {
  const useLang = lang || (typeof currentLang !== 'undefined' ? currentLang : 'en');
  const data = CMS_DATA[key];
  if (data && typeof data === 'object') {
    return data[useLang] || data.en || '';
  }
  return data || '';
}

// Kept for admin compatibility (admin writes via its own helpers)
function saveTextContent(key, value, lang) {
  const useLang = lang || (typeof currentLang !== 'undefined' ? currentLang : 'en');
  localStorage.setItem('cms_' + key + '_' + useLang, value);
}

// Render a person card (links to individual profile page)
function createPersonCard(person) {
  const card = document.createElement('div');
  card.className = 'person-card';
  card.innerHTML = `
    <a href="${profileUrl(person)}" class="card-link">
      <img src="${getPrimaryPhoto(person)}" alt="${person.name}" loading="lazy"
           onerror="this.src='https://via.placeholder.com/400x500/1a1a1a/d4af37?text=No+Photo'">
      <div class="person-info">
        <h3>${person.name}</h3>
        <div class="nationality">${person.nationality}</div>
      </div>
    </a>
  `;
  return card;
}


/** Primary photo for cards – supports photos[] or legacy photo */
function getPrimaryPhoto(person) {
  if (person.photos && person.photos.length) return person.photos[0];
  return person.photo || 'https://via.placeholder.com/400x500/1a1a1a/d4af37?text=No+Photo';
}

// Public site always uses deployed CMS_DATA (updated when GitHub Pages rebuilds)
function getLivePeople() {
  applySydneyAvailabilityRollover();
  return (typeof CMS_DATA !== 'undefined' && CMS_DATA.people) ? CMS_DATA.people : [];
}

// Render people filtered by availability
function renderRoster(containerId, filter) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';

  let people = getLivePeople();
  if (filter && filter !== 'all') {
    people = people.filter(p => p.available && p.available.includes(filter));
  }

  if (people.length === 0) {
    let emptyMsg;
    if (filter === 'tomorrow') {
      emptyMsg = (typeof t === 'function')
        ? t('tomorrow_pending')
        : 'The roster for tomorrow will be updated tonight by 9pm';
    } else {
      emptyMsg = (typeof t === 'function') ? t('empty_day') : 'No one scheduled for this day yet.';
    }
    container.innerHTML = `<div class="empty-state">${emptyMsg}</div>`;
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'roster-grid';
  people.forEach(person => grid.appendChild(createPersonCard(person)));
  container.appendChild(grid);
}

// Home page: Today / Tomorrow buttons
function initHomePage() {
  const todayBtn = document.getElementById('btn-today');
  const tomorrowBtn = document.getElementById('btn-tomorrow');
  const rosterArea = document.getElementById('roster-display');

  if (!todayBtn || !tomorrowBtn || !rosterArea) return;

  function showDay(day) {
    todayBtn.classList.toggle('active', day === 'today');
    tomorrowBtn.classList.toggle('active', day === 'tomorrow');
    renderRoster('roster-display', day);
  }

  todayBtn.addEventListener('click', () => showDay('today'));
  tomorrowBtn.addEventListener('click', () => showDay('tomorrow'));

  // Default to today
  showDay('today');
}

// Roster page: show all or filtered
function initRosterPage() {
  const allBtn = document.getElementById('btn-all');
  const todayBtn = document.getElementById('btn-today');
  const tomorrowBtn = document.getElementById('btn-tomorrow');
  const rosterArea = document.getElementById('roster-display');

  if (!rosterArea) return;

  function showFilter(filter) {
    [allBtn, todayBtn, tomorrowBtn].forEach(btn => {
      if (btn) btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    renderRoster('roster-display', filter);
  }

  if (allBtn) allBtn.addEventListener('click', () => showFilter('all'));
  if (todayBtn) todayBtn.addEventListener('click', () => showFilter('today'));
  if (tomorrowBtn) tomorrowBtn.addEventListener('click', () => showFilter('tomorrow'));

  // Default to all
  showFilter('all');
}

// Editable text sections (Pricing & Contact) – language aware
function initEditableSection(sectionKey, displayId, editId, saveBtnId) {
  const displayEl = document.getElementById(displayId);
  const editEl = document.getElementById(editId);
  const saveBtn = document.getElementById(saveBtnId);

  if (!displayEl) return;

  function loadCurrent() {
    const content = getTextContent(sectionKey);
    displayEl.textContent = content;
    if (editEl) editEl.value = content;
  }

  loadCurrent();

  // Expose so language switch can refresh
  window['refresh_' + sectionKey] = loadCurrent;

  if (editEl && saveBtn) {
    // Avoid duplicate listeners
    if (!saveBtn.dataset.bound) {
      saveBtn.dataset.bound = '1';
      saveBtn.addEventListener('click', () => {
        const newValue = editEl.value.trim();
        // Save for the CURRENT language
        saveTextContent(sectionKey, newValue);
        displayEl.textContent = newValue;
        const msg = (typeof t === 'function') ? t('saved') : 'Saved! Content updated (stored in your browser).';
        alert(msg);
      });
    }
  }
}

// Fill every pricing/contact CMS text block on the page (home, pricing, contact)
function fillCmsTextElements() {
  const pricing = getTextContent('pricingText');
  const contact = getTextContent('contactText');

  document.querySelectorAll('[data-cms-text="pricingText"], #pricing-preview, #pricing-display').forEach(el => {
    el.textContent = pricing;
  });
  document.querySelectorAll('[data-cms-text="contactText"], #contact-preview, #contact-display').forEach(el => {
    el.textContent = contact;
  });
}

// Refresh when language changes
function refreshCustomTexts() {
  if (typeof window.refresh_pricingText === 'function') window.refresh_pricingText();
  if (typeof window.refresh_contactText === 'function') window.refresh_contactText();
  fillCmsTextElements();
}

// Individual profile page (profile.html?id=1)
function initProfilePage() {
  const params = new URLSearchParams(window.location.search);
  const idParam = params.get('id');
  const nameParam = params.get('name');
  const pathSlug = slugFromPathname();
  const container = document.getElementById('profile-content');

  if (!container) return;

  const people = getLivePeople();
  let person = null;
  // Prefer clean URL: /sophia-laurent.html
  if (pathSlug) {
    person = people.find(p => (p.slug || slugifyName(p.name)) === pathSlug);
  }
  if (!person && nameParam) {
    const slug = decodeURIComponent(nameParam).toLowerCase();
    person = people.find(p => (p.slug || slugifyName(p.name)) === slug);
  }
  if (!person && idParam) {
    const id = parseInt(idParam, 10);
    person = people.find(p => p.id === id);
  }

  if (!person) {
    const notFound = (typeof t === 'function') ? t('person_not_found') : 'Person not found';
    const notExist = (typeof t === 'function') ? t('profile_not_exist') : 'This profile does not exist.';
    const back = (typeof t === 'function') ? t('back_to_roster') : 'Back to Roster';
    container.innerHTML = `
      <div class="empty-state">
        <h2>${notFound}</h2>
        <p>${notExist}</p>
        <p style="margin-top:1.5rem;"><a href="roster.html" class="btn">${back}</a></p>
      </div>
    `;
    return;
  }

  document.title = `${person.name} | 7 Ways`;

  const availableText = person.available
    .map(d => d.charAt(0).toUpperCase() + d.slice(1))
    .join(' & ');

  const natLabel = (typeof t === 'function') ? t('nationality') : 'Nationality';
  const availLabel = (typeof t === 'function') ? t('available') : 'Available';
  const backTxt = (typeof t === 'function') ? t('back_to_roster') : '← Back to Roster';
  const contactTxt = (typeof t === 'function') ? t('contact_us') : 'Contact Us';

  container.innerHTML = `
    <div class="profile-layout">
      <div class="profile-photo">
        <img id="profile-main-img" src="${getPrimaryPhoto(person)}" alt="${person.name}"
             onerror="this.src='https://via.placeholder.com/400x500/1a1a1a/d4af37?text=No+Photo'">
        ${ (person.photos && person.photos.length > 1)
            ? `<div class="profile-thumbs">${person.photos.map((src,i) =>
                `<button type="button" class="profile-thumb${i===0?' active':''}" data-src="${src}"><img src="${src}" alt=""></button>`
              ).join('')}</div>`
            : '' }
      </div>
      <div class="profile-details">
        <h1>${person.name}</h1>
        <div class="profile-meta">
          <div class="meta-item">
            <span class="meta-label">${natLabel}</span>
            <span class="meta-value">${person.nationality}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">${availLabel}</span>
            <span class="meta-value">${availableText}</span>
          </div>
        </div>
        ${person.description ? `<div class="profile-description" style="margin-top:1.5rem; color:var(--text-muted); line-height:1.7;">${person.description}</div>` : ''}
        <p style="margin-top: 2rem;">
          <a href="roster.html" class="btn btn-outline">${backTxt}</a>
          <a href="contact.html" class="btn" style="margin-left: 0.75rem;">${contactTxt}</a>
        </p>
      </div>
    </div>
  `;

  container.querySelectorAll('.profile-thumb').forEach(btn => {
    btn.addEventListener('click', () => {
      const main = document.getElementById('profile-main-img');
      if (main) main.src = btn.dataset.src;
      container.querySelectorAll('.profile-thumb').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

// Employment application form – emails via Cloudflare Worker → Resend
function getWorkerUrl() {
  if (typeof CMS_DATA !== 'undefined' && CMS_DATA.workerUrl) {
    return String(CMS_DATA.workerUrl).trim().replace(/\/$/, '');
  }
  try {
    const s = JSON.parse(localStorage.getItem('7ways_publish_settings') || '{}');
    if (s.workerUrl) return String(s.workerUrl).trim().replace(/\/$/, '');
  } catch (e) {}
  return '';
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const base64 = result.split(',')[1] || '';
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function initEmploymentForm() {
  const form = document.getElementById('employment-form');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const name = document.getElementById('emp-name').value.trim();
    const nationality = document.getElementById('emp-nationality').value.trim();
    const age = document.getElementById('emp-age').value.trim();
    const contact = document.getElementById('emp-contact').value.trim();
    const photoInput = document.getElementById('emp-photos');
    const files = photoInput ? Array.from(photoInput.files || []) : [];

    if (!name || !nationality || !age || !contact) {
      alert('Please fill in all required fields.');
      return;
    }

    const maxBytes = 3 * 1024 * 1024;
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        alert('Please attach image files only.');
        return;
      }
      if (file.size > maxBytes) {
        alert('Each photo must be under 3 MB. Please resize and try again.');
        return;
      }
    }
    if (files.length > 5) {
      alert('Please attach up to 5 photos only.');
      return;
    }

    const workerUrl = getWorkerUrl();
    if (!workerUrl) {
      alert('Form is not connected yet. Please contact the site administrator.');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
    }

    try {
      const photos = [];
      for (const file of files) {
        const content = await readFileAsBase64(file);
        photos.push({
          filename: file.name || 'photo.jpg',
          contentType: file.type || 'image/jpeg',
          content: content
        });
      }

      const res = await fetch(workerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'employment',
          name,
          nationality,
          age,
          contact,
          photos
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        throw new Error(data.message || ('Send failed (' + res.status + ')'));
      }
      const msg = (typeof t === 'function' ? t('form_success') : 'Application received! Thank you.');
      alert(msg);
      form.reset();
    } catch (err) {
      alert('Could not send application: ' + err.message);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = (typeof t === 'function' ? t('submit_application') : 'Submit Application');
      }
    }
  });
}

// Set active nav link
function setActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

// Initialize based on page
document.addEventListener('DOMContentLoaded', () => {
  applySiteFormat();
  applySydneyAvailabilityRollover();
  setActiveNav();

  // Language system
  if (typeof applyTranslations === 'function') {
    applyTranslations();
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === (typeof currentLang !== 'undefined' ? currentLang : 'en'));
      btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
    });
  }

  const page = document.body.dataset.page;

  if (page === 'home') {
    initHomePage();
  }

  if (page === 'roster') {
    initRosterPage();
  }

  // Home previews + Pricing + Contact pages all use the same CMS text
  fillCmsTextElements();

  if (page === 'profile') {
    initProfilePage();
  }

  if (page === 'employment') {
    initEmploymentForm();
  }
});
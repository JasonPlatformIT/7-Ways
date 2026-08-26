# Black Garter 7 ways — Website

Static multi-page site (HTML / CSS / JS) with a password-protected admin CMS, multi-language UI, and optional live publish to GitHub via a Cloudflare Worker.

**Brand:** Black Garter 7 ways  
**Theme:** Black & gold  
**Domain (example):** 7waysrockdale.com  

---

## Pages

| Page | File | Description |
|------|------|-------------|
| Home | `index.html` | Today / Tomorrow roster, pricing & contact previews, phone & WeChat strip |
| Roster | `roster.html` | Full roster with All / Today / Tomorrow filters |
| Pricing | `pricing.html` | Multi-language pricing text (editable) |
| Employment | `employment.html` | Application form (name, nationality, age, contact) |
| Contact | `contact.html` | Contact text, phone, WeChat, contact form |
| Profile | `profile.html` or **`{name}.html`** | Individual profile (photos, description, availability) |
| Admin | `admin.html` | CMS (not linked in public nav) |
| 404 | `404.html` | Custom not-found page with site links |

Profile URLs use the person’s name, e.g.:

- `https://yoursite.com/sophia-laurent.html`
- `https://yoursite.com/mia-chen.html`

---

## Features

### Roster / CMS people
- Fields: name, slug, photos (multiple), nationality, description, available (`today` / `tomorrow`)
- **Description** shows only on the profile page
- **Multiple photos** per person; first photo is the Home/Roster card image; profile has a gallery
- Clicking a card opens `/{slug}.html`

### Sydney midnight rotation
- At midnight **Australia/Sydney**, people marked **Tomorrow** move to **Today**
- People who were only **Today** are cleared for that day
- Driven by `scheduleDate` in `js/data.js` (updated on Save & Publish)

### Languages
- Flags under the header: English, Japanese, Chinese, Korean
- UI strings + Pricing/Contact text are per language

### Contact
- Phone: **0450 351 919** (`tel:+61450351919`) on Home strip and Contact page
- WeChat: **BG-7ways**

### Admin (`admin.html`)
- Login: `admin` / `Adm1n1strator` (client-side only — see Security)
- Manage roster (add / edit / delete, multi-image upload)
- Edit pricing & contact text per language
- **Save & Publish** pushes `js/data.js` and profile HTML pages via Cloudflare Worker
- Adding a person also creates their `/{slug}.html` page when the Worker is configured
- **Deleting** a person also **deletes** their `/{slug}.html` page from GitHub (via Worker) and updates `js/data.js`
- Duplicate name/slug shows a warning before overwrite

---

## Local use

1. Download / extract the site folder  
2. Open `index.html` in a browser  
3. For admin: open `admin.html` directly  

Photo uploads and live GitHub publish need the Cloudflare Worker (below).

---

## GitHub Pages hosting

1. Upload **all files** in this folder to your repo (repo root if the custom domain points at the site root)  
2. Enable **GitHub Pages** (Settings → Pages)  
3. Set custom domain if needed (e.g. `7waysrockdale.com`)  
4. Ensure these exist in the repo after each publish:
   - `js/data.js`
   - Every profile file such as `sophia-laurent.html`
   - `404.html` (GitHub Pages serves this for missing URLs)

### DNS (GoDaddy → GitHub)

**A records** for apex (`@`):

- `185.199.108.153`
- `185.199.109.153`
- `185.199.110.153`
- `185.199.111.153`

**CNAME** for `www` → `YourGitHubUsername.github.io`

Then in repo **Settings → Pages → Custom domain**, enter your domain and enable **Enforce HTTPS**.

---

## Option C — Cloudflare Worker (live CMS publish)

The browser never holds the GitHub token. Admin calls your Worker; the Worker pushes to GitHub.

### 1. Deploy the Worker

Use the code in **`cloudflare-worker.js`**.

### 2. Worker secrets / variables

| Name | Purpose |
|------|---------|
| `GITHUB_TOKEN` | Personal access token (`repo` scope) — **Secret** |
| `GH_OWNER` | e.g. `JasonPlatformIT` |
| `GH_REPO` | Repository name |
| `GH_BRANCH` | Usually `main` |
| `GH_PATH` | `js/data.js` |
| `ADMIN_KEY` | Shared publish password — **Secret** |

### 3. Admin publish settings

In `admin.html` after login:

- **Cloudflare Worker URL** — e.g. `https://7ways-cms-publish.xxx.workers.dev`
- **Admin Key** — same as `ADMIN_KEY`

Save once per device, then use **Save & Publish Changes**.

### Worker request types

- `{ type: "data", content: "<full data.js text>" }` — update CMS data  
- `{ type: "image", path: "images/people/...", contentBase64: "..." }` — photo upload  
- `{ type: "file", path: "name.html", contentBase64: "..." }` — profile HTML pages  

Uploaded photos are stored under `images/people/{id}/`.

---

## Why profile links returned 404 (and the fix)

Links go to **`/{slug}.html`** (not `profile.html?name=...`).

Those files must **exist in the GitHub repo**. They are:

1. Included in this package for the sample people, and  
2. Created/updated when you **add a person** or **Save & Publish** (via the Worker)

If you only uploaded an older build without the `*.html` profile files, GitHub returned 404.  
**Re-upload this full package** (or run Save & Publish so the Worker creates every profile page).

`profile.html` still works as a fallback with `?name=slug` or `?id=`.

---

## Security notes

| Layer | Strength |
|--------|----------|
| Admin not in main nav | Hides URL from casual users only |
| Admin login in the page | **Weak** — password is in client-side JS |
| Cloudflare Access on `/admin.html` | **Strong** — blocks the page before it loads |
| GitHub token in Worker secret only | Correct for Option C |

For real protection, put **Cloudflare Access** (Zero Trust) on path `/admin.html` after proxying the domain through Cloudflare.

---

## File map

```text
website/
  index.html, roster.html, pricing.html, employment.html, contact.html
  profile.html          ← generic profile loader
  404.html              ← custom not-found
  admin.html            ← CMS
  {slug}.html           ← one file per person (e.g. sophia-laurent.html)
  cloudflare-worker.js  ← deploy to Cloudflare
  css/style.css
  js/data.js            ← CMS source of truth (people, texts, scheduleDate)
  js/script.js          ← public site logic
  js/admin.js           ← admin CMS logic
  js/i18n.js            ← translations
  images/               ← flags, uploads path people/…
  README.md
```

---

## Admin login (default)

- **Username:** `admin`  
- **Password:** `Adm1n1strator`  

Change these in `js/admin.js` if needed (and treat them as public unless Access is enabled).

---

## Support checklist after deploy

1. Site opens on custom domain with HTTPS  
2. Home Today/Tomorrow shows people  
3. Clicking a person opens `/{slug}.html` (no 404)  
4. Bad URL shows custom `404.html` with links  
5. Admin opens only via direct URL (+ Access if configured)  
6. Worker + Admin Key set; Save & Publish updates GitHub  
7. New person gets a new `/{slug}.html` after add/publish  


## Employment form emails

Applications are sent by the Cloudflare Worker to:

- jason@platformit.com.au
- tyler@platformit.com.au

### Extra Worker secrets (Resend)

Cloudflare Workers cannot send email by themselves. Use [Resend](https://resend.com) (free tier is enough):

1. Create a Resend account and API key  
2. In the Worker → **Settings → Variables**:

| Name | Value |
|------|--------|
| `RESEND_API_KEY` | your Resend API key (Secret) |
| `EMAIL_FROM` | e.g. `Black Garter <onboarding@resend.dev>` for tests, or a verified domain address |
| `EMAIL_TO` | `jason@platformit.com.au,tyler@platformit.com.au` (optional; this is the default) |

3. Put the **same Worker URL** in admin Publish Settings and **Save & Publish** once so `workerUrl` is stored in `js/data.js` for the public form.

Redeploy the Worker with the latest `cloudflare-worker.js` after updating code.

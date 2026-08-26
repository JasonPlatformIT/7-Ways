# Black Garter 7 ways — Website

Static multi-page site (HTML / CSS / JS) with an admin CMS, multi-language UI, and live publish to GitHub via a Cloudflare Worker.

**Brand:** Black Garter 7 ways  
**Theme:** Black & gold  
**Domain (example):** 7waysrockdale.com  
**Address:** 19 The Seven Ways, Rockdale NSW 2216  

---

## Pages

| Page | File | Description |
|------|------|-------------|
| Home | `index.html` | Today/Tomorrow roster, CMS pricing & contact previews, map, contact strip |
| Roster | `roster.html` | Full roster (All / Today / Tomorrow) + contact strip |
| Pricing | `pricing.html` | CMS pricing text only (no public editing) + contact strip |
| Employment | `employment.html` | Application form (name, nationality, age, contact, **photos**) + contact strip |
| Contact | `contact.html` | Phone, WeChat, address, map, CMS contact text (**no** contact form) + contact strip |
| Profile | `profile.html` or **`{slug}.html`** | Individual profile (gallery, description, availability) |
| Admin | `admin.html` | CMS only (not linked in public nav) |
| 404 | `404.html` | Not-found page with links to main pages and profiles |

Profile URLs use the person’s name slug, e.g.:

- `https://yoursite.com/sophia-laurent.html`
- `https://yoursite.com/mia-chen.html`

---

## Features

### Sticky banner
- Logo + navigation tabs + language flags stay **visible while scrolling** (`.site-top`).

### Contact strip (all main pages)
Shown on **Home, Roster, Pricing, Employment, Contact Us**:

| Item | Value | Behaviour |
|------|--------|-----------|
| Phone | 0450 351 919 | `tel:+61450351919` opens the phone app |
| WeChat | BG-7ways | Display only |
| Address | 19 The Seven Ways, Rockdale 2216 | Opens maps with **directions** from the user’s location |

### Google Maps
- Embedded map on **Home** (bottom) and **Contact Us**
- Location: 19 The Seven Ways, Rockdale NSW 2216

### Roster / CMS people
- Fields: name, slug, **photos** (multiple), nationality, **description**, available (`today` / `tomorrow`)
- Description shows **only** on the profile page
- First photo = Home/Roster card; profile page has a thumbnail gallery
- Card links to `/{slug}.html`


### Roster display order
- In **admin → Roster / People**, use **↑** / **↓** next to each person to change order
- **Order #** shows position in the list
- After **Save & Publish**, **Home** and **Roster** show people in that same order
- Today / Tomorrow filters keep the relative order of whoever is available that day

### Sydney midnight rotation
- At midnight **Australia/Sydney**, **Tomorrow** → **Today**
- People who were only **Today** are cleared
- Stored via `scheduleDate` in `js/data.js`
- When **Tomorrow** is empty after rollover, Home/Roster show:  
  **“The roster for tomorrow will be updated tonight by 9pm”** (translated per language)

### Languages
- Flags: English, Japanese, Chinese, Korean
- UI strings + **Pricing** and **Contact** CMS text are per language

### Pricing & contact content (single source)
- Edited **only in admin CMS** (not on public pages)
- Same text appears on:
  - Home (Pricing / Contact sections)
  - Pricing page
  - Contact page
- After **Save & Publish**, all three update together (via `js/data.js`)

### Employment form
- Fields: name, nationality, age, contact number, optional **photos** (up to 5, ~3 MB each)
- Submissions email **jason@platformit.com.au** and **tyler@platformit.com.au** via Cloudflare Worker + Resend
- Photos are attached to the email

### Admin (`admin.html`)
- Login: `admin` / `Adm1n1strator` (client-side only — see Security)
- Roster CRUD, **reorder** (↑/↓ — same order on Home & Roster), multi-image upload, description
- Pricing & contact text per language
- **Save & Publish** → updates `js/data.js`, profile HTML pages, stores `workerUrl` for the public form
- **Add person** → creates `/{slug}.html` on GitHub (when Worker is set)
- **Delete person** → removes `/{slug}.html` from GitHub and updates data
- Duplicate name/slug → warning before overwrite

### Mobile
- Layout constrained to device width (no horizontal overflow)
- Images and long text wrap within the screen

---

## Local use

1. Extract the site folder  
2. Open `index.html` in a browser  
3. Admin: open `admin.html` directly  

Photo upload, live publish, and employment email need the Cloudflare Worker.

---

## GitHub Pages hosting

1. Upload **all** files to the repo root (if the custom domain points at the site root)  
2. Enable **Pages** in repo Settings  
3. Custom domain example: `7waysrockdale.com` + **Enforce HTTPS**  
4. Keep in the repo:
   - `js/data.js`
   - Every `/{slug}.html` profile file
   - `404.html`

### DNS (GoDaddy → GitHub)

**A records** (`@`):

- `185.199.108.153`
- `185.199.109.153`
- `185.199.110.153`
- `185.199.111.153`

**CNAME** `www` → `YourGitHubUsername.github.io`

---

## Cloudflare Worker (Option C)

File: **`cloudflare-worker.js`** — deploy and update this whenever the project ships a new Worker.

### Secrets / variables

| Name | Purpose |
|------|---------|
| `GITHUB_TOKEN` | PAT with `repo` scope (**Secret**) |
| `GH_OWNER` | e.g. `JasonPlatformIT` |
| `GH_REPO` | Repository name |
| `GH_BRANCH` | Usually `main` |
| `GH_PATH` | `js/data.js` |
| `ADMIN_KEY` | Shared publish password (**Secret**) |
| `RESEND_API_KEY` | Resend API key for employment email (**Secret**) |
| `EMAIL_FROM` | e.g. `Black Garter <onboarding@resend.dev>` or verified domain |
| `EMAIL_TO` | Optional; default `jason@platformit.com.au,tyler@platformit.com.au` |

### Admin publish settings (once per device)

- **Worker URL** — e.g. `https://your-worker.workers.dev`  
- **Admin Key** — same as `ADMIN_KEY`  
- **Save Publish Settings**, then **Save & Publish** (writes `workerUrl` into `js/data.js` for the employment form)

### Worker POST types

| Type | Auth | Purpose |
|------|------|---------|
| `data` | Admin key | Update `js/data.js` |
| `image` | Admin key | Upload under `images/people/...` |
| `file` | Admin key | Create/update profile `.html` pages |
| `delete` | Admin key | Delete profile `.html` (not core pages) |
| `employment` | **Public** | Email application (+ photo attachments) via Resend |

---

## Employment email (Resend)

1. Create account at [resend.com](https://resend.com) and an API key  
2. Set `RESEND_API_KEY` and `EMAIL_FROM` on the Worker  
3. Ensure `workerUrl` is in `js/data.js` (via admin Save & Publish)  
4. Redeploy Worker after code changes  

---

## Security

| Layer | Notes |
|--------|--------|
| Admin not in main nav | Hides URL only |
| Admin login in the page | **Weak** — password is in client-side JS |
| Cloudflare Access on `/admin.html` | **Strong** — recommended |
| GitHub token only on Worker | Correct for Option C |
| Employment form is public | No admin key (by design) |

---

## File map

```text
website/
  index.html, roster.html, pricing.html, employment.html, contact.html
  profile.html, 404.html, admin.html
  {slug}.html              ← per person (e.g. sophia-laurent.html)
  cloudflare-worker.js
  css/style.css
  js/data.js               ← CMS source of truth (people, texts, scheduleDate, workerUrl)
  js/script.js, js/admin.js, js/i18n.js
  images/
  README.md
```

---

## Admin login (default)

- **Username:** `admin`  
- **Password:** `Adm1n1strator`  

Treat as public unless Cloudflare Access (or similar) protects `admin.html`.

---

## Deploy checklist

1. [ ] Custom domain + HTTPS  
2. [ ] Roster order matches admin after Save & Publish (Home + Roster)
2. [ ] Contact strip on Home / Roster / Pricing / Employment / Contact  
3. [ ] Address opens directions in maps app  
4. [ ] Map visible on Home and Contact  
5. [ ] Profile cards open `/{slug}.html` (no 404)  
6. [ ] Home pricing & contact match CMS after publish  
7. [ ] Tomorrow empty message after daily rollover  
8. [ ] Worker redeployed; Admin Key + Worker URL set  
9. [ ] Resend configured; test employment form (with photo)  
10. [ ] Delete profile removes GitHub `.html` page  
11. [ ] Sticky nav stays visible while scrolling  
12. [ ] Mobile: no horizontal scroll; images fit screen  

---

## Changelog (recent)

- Roster reorder in CMS (↑/↓); same order on Home and Roster
- Sticky nav + language bar  
- Contact strip on all main pages; address opens **directions**  
- Google Maps on Home and Contact; no public contact form  
- No public pricing/contact editors (admin CMS only); Home shows same CMS text  
- Mobile overflow fixes  
- Tomorrow empty state: “updated tonight by 9pm”  
- Employment photos + email via Worker/Resend  
- Profile create/delete syncs GitHub HTML pages  
- Name-based profile URLs; custom 404  

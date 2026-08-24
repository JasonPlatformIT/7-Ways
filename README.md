# Black & Red Theme Website

A simple multi-page static website with a black and red color scheme.

## Pages
- **Home** – Today / Tomorrow buttons that display people from the CMS
- **Roster** – Full roster with filters (All / Today / Tomorrow)
- **Pricing** – Editable text (saved in browser)
- **Employment** – Static employment info
- **Contact Us** – Editable contact text + simple form

## How the "CMS" works

### Managing the roster (people)
Edit the file `js/data.js`.

Each person looks like this:

```js
{
  id: 1,
  name: "Sophia Laurent",
  photo: "https://picsum.photos/id/64/400/500",  // or "images/myphoto.jpg"
  nationality: "French",
  available: ["today", "tomorrow"]   // or just ["today"] or ["tomorrow"]
}
```

- Add a new object to the `people` array to add someone.
- Change `available` to control which day(s) they appear on.
- For local photos, put images in the `images/` folder and use a relative path.

### Managing Pricing & Contact text
1. Go to the **Pricing** or **Contact Us** page.
2. Edit the text in the textarea.
3. Click **Save**.
4. The text is stored in your browser (localStorage) and also shown on the Home page.

To reset to the defaults, clear your browser’s localStorage for this site.

## Running the site

Just open `index.html` in a browser, or serve the folder with any static server:

```bash
# Python
python -m http.server 8000

# Node (if you have npx)
npx serve .
```

Then visit http://localhost:8000

## Theme
- Background: near-black
- Accents: red (#e63946)
- Cards: dark gray with red hover borders

## Notes
- Photos currently use placeholder images from picsum.photos. Replace them with real URLs or local files.
- The contact form is front-end only (shows an alert). Wire it to a form service or backend if needed.
- No build step required – pure HTML, CSS, and JavaScript.
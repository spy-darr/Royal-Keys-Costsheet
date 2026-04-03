# Royal Keys — Cost Sheet Portal

A password-protected, interactive cost sheet web app for the Royal Keys project.
Built as a static site — **no server required**. Deploy via GitHub Pages in minutes.

---

## Folder Structure

```
royal-keys-costsheet/
├── index.html          ← Main page (login + app)
├── style.css           ← All styles
├── app.js              ← Application logic + PDF generation
├── assets/
│   ├── data.js         ← All unit data (residential + commercial)
│   ├── logo-top.jpg    ← Royal Keys logo (header)
│   ├── logo-bottom.jpg ← Aurelia Developers logo (footer)
│   └── bw_logo.png     ← BeyondWalls logo (footer)
└── README.md
```

---

## Deploy on GitHub Pages

1. Create a new GitHub repository (e.g. `royal-keys-costsheet`)
2. Upload all files maintaining the folder structure above
3. Go to **Settings → Pages**
4. Under *Source*, select **Deploy from a branch → main → / (root)**
5. Click **Save** — your site will be live at:
   `https://<your-username>.github.io/royal-keys-costsheet/`

---

## Changing the Password

Open `app.js` and change line 5:

```js
const PASSWORD = 'RoyalKeys@2026';
```

---

## Features

- **Single password login** — one shared access code
- **Residential & Commercial** unit selector with Wing / Floor / Config / Status filters
- **Live cost recalculation** — change APR → all values update instantly
- **Reverse calculation** — edit the total package → APR auto-updates
- **Stamp Duty toggle** — Male (7%) / Female (6%) / Both (6%)
- **Customer name required** — PDF download blocked until name is entered
- **Download PDF** — 2-page (Customer's Copy + Sales Copy) cost sheet
- **Fully static** — works on GitHub Pages, Netlify, Vercel, or any web host

---

## Notes

- Password is stored in plain text in `app.js` — intentional for a simple client-side site.
- Logos must remain in the `assets/` folder relative to `index.html`.
- Unit data is in `assets/data.js` — regenerated from the DSR Excel/CSV.

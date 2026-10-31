# DopamineFeenFr1

Personal site for [@DopamineFeenFr1](https://x.com/DopamineFeenFr1). Static, no build step.

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8080
```

- `index.html` — markup
- `css/style.css` — styles (Archivo variable + IBM Plex Mono, self-hosted in `assets/fonts`)
- `js/main.js` — reveal / parallax (transform + opacity only, disabled under `prefers-reduced-motion`)
- `assets/img` — avatar, second-account avatar and X header, taken from the original asset pack

## Deploy (Vercel)

Import the repo in Vercel (Framework preset: **Other**, no build command, output = root) or run `npx vercel --prod` in this folder. `vercel.json` adds clean URLs, cache headers and a strict CSP; `404.html` is served for unknown paths.

Once the domain is known, change `og:image` in `index.html` to an absolute URL (e.g. `https://your-domain/assets/img/banner.jpg`) so link previews on X pick it up.

Profile figures are from the public X profile as of 31 Oct 2026.

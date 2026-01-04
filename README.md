# Nemesia (front-end prototype)

Static, front-end-only prototype intended for GitHub Pages deployment.

## Structure

- `index.html` — **Homepage** (the only page with content)
- `catalogue.html`, `visualise.html`, `forum.html`, `login.html`, `app-download.html` — accessible but intentionally empty
- `assets/css/styles.css` — site styling (includes `@font-face` declarations)
- `assets/js/main.js` — basic nav highlighting
- `assets/images/` — image assets

## Fonts

This prototype is wired to load:
- `./assets/Web-Fonts/magnoliamedium-webfont.woff` (MagnoliaMedium)
- `./assets/Fonts/avenir-next-ultra-light.ttf` (AvenirNextUltraLight)

If those files are not present, the site will fall back to system fonts.

## GitHub Pages

1. Push the folder contents to a GitHub repository.
2. In the repo settings, enable GitHub Pages for the branch/folder that contains `index.html`.

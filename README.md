# Countdown

[![Netlify Status](https://api.netlify.com/api/v1/badges/bb562a89-7b29-4576-92aa-41fbc58cccba/deploy-status)](https://app.netlify.com/projects/countdownzen/deploys)

Copied, modified, and adapted from [hoangvu12/beat].

---

## Tech Stack

- **React** + **TypeScript** + **Vite**
- **UI Library:** shadcn/ui

This is a template for a Vite project with React, TypeScript, and shadcn/ui.

---

## Attribution

Some visual assets in this project are based on images generated using [Craiyon](https://www.craiyon.com) and have been
edited or modified.

---

## Deployment Notes — Netlify + Vite + TanStack Router

### Issue

- Refreshing or directly opening dynamic routes (e.g., `/:timerId`) caused 404 errors.

### Cause

- TanStack Router handles routing **client-side only**.
- Netlify tries to serve a file for each URL; unknown paths return 404.

### Solution / Setup

1. **SPA Redirect**
    - Create `public/_redirects` with:
      ```
      /*    /index.html 200
      ```
    - Ensures all unknown paths serve `index.html`.

2. **Netlify Config** (`netlify.toml` at project root)
    - Specifies build command and publish folder.
    - Defines redirect rule (as above) for safety.

3. **Netlify UI Settings**
    - Production branch: `main`
    - Base directory: empty
    - Publish directory: `dist`

### Result

- Refreshing or opening dynamic routes directly works.
- Router requires no changes.
- No 404 errors for SPA routes.

### Tips

- Netlify UI settings override `netlify.toml`.
- `_redirects` must exist in deployed output (Vite copies from `public/`).
- Keep `dist/` out of version control; let Netlify build from source.

---

<!-- Links -->

[hoangvu12/beat]: https://github.com/hoangvu12/beat

# Lokesh & Haripriya — Wedding Invitation

A static wedding invitation with an automatic South Indian temple entrance, a 16-piece photo puzzle, converging footprints, kolam backgrounds, and an unrolling invitation scroll.

Phones use a dedicated tall temple illustration, centered at the top and fitted to the screen width. After the image loads, the camera automatically pans down, zooms into the door, and opens into the puzzle. Skip entrance and reduced-motion support remain available. Interwoven kolam variants decorate the page and scroll edges. Background bansuri and interaction sounds start after the browser permits audio on the first tap or keypress.

## Files

- `invite.html`: invitation and puzzle layout (`puzzle.html` redirects here).
- `temple-scene.js`: temple pan, doorway zoom, and door animation.
- `invite.js`: names, dates, venue, calendar links, and shared artwork.
- `puzzle-images/`: photos randomly selected for each new page visit; `assets/puzzle-image.webp` is a fallback.
- `base.css` and `tied-scroll.css`: shared styling.

## Preview locally

Run `python -m http.server 8123` in this folder, then open http://localhost:8123/.

After adding photos to `puzzle-images/`, run `node scripts/build-site.cjs` to update the image list for local preview. Netlify updates the list automatically during its build. PNG, JPG, WebP, and AVIF files are supported. Images are kept in proportion without cropping.

The site uses WebP renditions for smaller downloads. Original PNG files, including the saved couple illustrations, remain in the source folders for future editing and are excluded from deployment when a WebP rendition exists. Run `python scripts/convert-images.py` (requires Pillow), then rebuild after adding or changing images. SVG ornaments stay in their compact vector format.

## Deploy on Netlify

1. Sign in at https://app.netlify.com/ and choose **Add new project → Import an existing project**.
2. Connect GitHub and grant Netlify access to `loky96/weddinginvitation`.
3. Select the `main` branch. Leave the base directory empty: the site lives at the repository root.
4. Netlify reads `netlify.toml`: build command `node scripts/build-site.cjs`, publish directory `dist`.
5. Deploy the project. If it is private by default, change the Netlify project visibility to public before sharing its URL.

The GitHub repository stays private. Only the files copied into `dist` are published. Future pushes to `main` update the linked Netlify site.

For a manual upload, run `node scripts/build-site.cjs` and upload the generated `dist` folder to Netlify Drop.

## Checks

Run `node --test tests/*.test.cjs` and `node scripts/build-site.cjs` before publishing.

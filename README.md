# Lokesh & Haripriya — Wedding Invitation

A static wedding invitation with a scroll-controlled South Indian temple entrance, a 16-piece photo puzzle, diya progress lights, kolam backgrounds, and an unrolling invitation scroll.

## Files

- `puzzle.html`: invitation and puzzle layout.
- `temple-scene.js`: temple pan, doorway zoom, and door animation.
- `invite.js`: names, dates, venue, calendar links, and shared artwork.
- `assets/puzzle-image.png`: artwork cut into the puzzle pieces.
- `base.css` and `tied-scroll.css`: shared styling.

## Preview locally

Run `python -m http.server 8123` in this folder, then open http://localhost:8123/.

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

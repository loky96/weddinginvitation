# Lokesh & Haripriya — Digital Wedding Invitation

Static site, no build step. Three versions share one data/renderer file:

| File | Version | Interactions |
|---|---|---|
| `doors.html` | Temple Doors (recommended) | Tap/Enter opens carved doors, petal burst, temple bell (sound toggle), brass lamps light as each section arrives |
| `garland.html` | Garland Reveal | Drag garland down (or tap button) to reveal names, tap-to-reveal event cards, gopuram tile reveals QR, flower pops |
| `scroll.html` | Wedding Scroll | Kolam draws itself, diya on/off, parchment panels unroll on scroll, temple tile reveals QR |
| `hanging-scroll.html` | Silk & Sakura Scroll (Japanese × South Indian) | Swaying kakejiku in Kanjivaram silk; untie the mizuhiki cord, sakura + jasmine petals fall and the scroll unrolls down; hanko 寿 seal stamps, ink-brush kolam draws per section |
| `puzzle.html` | Jigsaw Puzzle | 4×4 puzzle of the cover art: phone screens place all pieces below the board; larger screens scatter them around it. Pieces tilt as you drag and snap onto faint dotted outlines. Solving reveals the art, then the tied parchment scroll unrolls the invitation. Enter places a focused piece |
| `index.html` | Main entry | Opens the jigsaw invitation directly; scrolling pans from the temple tower down to its entrance, zooms into the doorway, opens the doors, and fades into the puzzle |

All content lives in `invite.js` (`INVITE` object). Shared styles: `base.css`. The tied, unrolling scroll (`tied-scroll.css` + `INVITE.unroll()`) is shared by the hanging-scroll and puzzle versions.

Every version: calendar (21/22 tap focuses event), Google Calendar + .ics, venue QR (generated from the maps URL), Google Maps, native share / copy link / WhatsApp, "Send your blessings" via WhatsApp, reduced-motion support.

## Preview locally

    python3 -m http.server 8123

Open http://localhost:8123/

## Publish (free)

- Netlify Drop: drag this folder onto https://app.netlify.com/drop
- GitHub Pages: push to a repo, Settings → Pages → deploy from branch

Share the link to the version you want, e.g. `https://<site>/doors.html`.

## Before sending

- Scan the QR on Android + iPhone; confirm the pin is Banyan Palace - Mukunda Hall.
- Reception calendar entry uses a 2-hour placeholder end time (the invitation says "7.00 pm onwards").
- WhatsApp link previews need an `og:image` (1200×630 JPG) — add `<meta property="og:image" content="https://<site>/preview.jpg">` to each page once you have the artwork.

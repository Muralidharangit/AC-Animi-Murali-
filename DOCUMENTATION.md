# Comfort Aircon: Scroll Animation Banner

Technical documentation for the developers who maintain this banner or add it to the Comfort Aircon website.

## 1. What this is

A full-screen, scroll-driven hero banner. The visitor scrolls and the story plays; scrolling up reverses it.

1. Brand logos (Carrier, Toshiba, Midea) rotate in the centre with matching copy.
2. The logo moves up and hides, and the air conditioner rises into view.
3. The unit turns to a three-quarter view inside cyan corner brackets.
4. The flap opens and glowing air and snow pour out.
5. The casing turns to glass, then the parts separate with labels while they run live.
6. The unit reassembles and moves right, and the content and buttons appear on the left.

There is no build framework. It runs by opening `index.html` directly or from any static host.

## 2. Technology used

| Layer | Technology | Used for |
|---|---|---|
| Markup | HTML5 | Page, header, schema.org data |
| Styling | CSS3 (custom properties, `clamp()`, `svh`, media queries, `@supports`) | Layout, responsive rules |
| Scripting | Vanilla JavaScript (ES2020), no framework | All logic, in `js/script.js` |
| Animation | GSAP 3.12.5 (`gsap.min.js`) | Timelines, tweens, ticker, `matchMedia`, `quickTo` |
| Scroll | GSAP ScrollTrigger 3.12.5 | Pinning and scrubbing the story |
| Drawing | Canvas 2D | Frame sequence, snow, live parts |
| GPU effect | Raw WebGL 1 fragment shader, no library | Airflow light streams |
| Fonts | Google Fonts: Plus Jakarta Sans 700, DM Sans 400–700 | Headings and body |
| Minifying (dev only) | terser, clean-css-cli | `*.min.js`, `*.min.css` |

GSAP and the fonts load from CDNs, so the page needs internet access for them. React, Vue, Three.js and jQuery are not used.

## 3. Folder structure

```
acc/
├── index.html                 Page; loads the minified CSS and JS
├── DOCUMENTATION.md           This file
├── css/
│   ├── style.css              Source: edit this
│   └── style.min.css          Generated: do not edit
├── js/
│   ├── script.js              Source: edit this
│   └── script.min.js          Generated: do not edit
├── img/
│   ├── ac3d/                  300 desktop frames, 000–299.webp
│   ├── ac3d-mobile/           300 phone frames, 000–299.webp
│   ├── ac-hero.webp           HD front view, static fallback
│   ├── ac-hero-small.webp     Smaller version of the same
│   ├── carrier-logo.webp      Intro logo
│   └── comfort-aircon-logo.webp  Header logo, favicon
├── docs/3d-render-source/     Files that generated the frames
└── backup/                    Earlier versions, not used by the site
```

The files in `backup/` are kept for reference only. Their images have since been removed, so they will not display correctly.

## 4. Images

| Asset | Size | Details |
|---|---|---|
| `img/ac3d/` | 21 MB | 300 WebP frames, 2200×1146, transparent |
| `img/ac3d-mobile/` | 7.9 MB | 300 WebP frames, 1100×573, transparent |
| Logos and hero | About 125 KB | Four WebP files |

Phones (760px wide or less) load every second frame, so 150 images. The old `img/3d` and `img/3d-transparent` folders and the source PNG were removed because nothing uses them.

## 5. The scroll story

`buildStory()` in `js/script.js` creates one GSAP timeline, pinned with ScrollTrigger and scrubbed by the scroll position. It runs from 0 to 100. Pin length is 8 viewport heights, or 7 in portrait.

| Position | Label | Frames | What happens |
|---|---|---|---|
| 0–9 | `hero` | | Copy fades, logo moves up and hides |
| 6–23 | `hero` | 0–46 | Unit rises; caption "Meet comfort" |
| 23–36 | `reveal` | 46–100 | Three-quarter turn; brackets; caption "Form meets function" |
| 36–48 | `cooling` | 100–150 | Flap opens; airflow and snow; caption "Comfort that moves with you" |
| 48–57 | `technology` | 150–182 | Casing turns to glass; live parts start at 52 |
| 57–66 | `technology` | 182–222 | Parts separate; labels appear at 60 |
| 66–78 | `reassembly` | 222–268 | Parts rejoin; live parts stop by 72 |
| 76–86 | `showcase` | | Unit moves into the right column |
| 78–91 | `showcase` | 268–299 | Unit turns; flap opens |
| 82–88 | `showcase` | | Finale content appears |
| 87–100 | `showcase` | | Airflow returns; the last scene holds |

`gsap.matchMedia()` rebuilds the timeline when the layout flips between portrait and landscape, such as when a phone is rotated.

## 6. Animation systems

| System | Function | How it works |
|---|---|---|
| Frame sequence | `drawFrame()` | Draws the frame matching `state.frame` to `.frames`. If a frame has not loaded, the nearest loaded one is used |
| Brand rotation | `cycleBrands()` | Every 4 seconds the logo flips in 3D and its copy cross-fades. Pauses once the story starts |
| Airflow | `createAirflow()` | WebGL shader. Maps each pixel to vent coordinates, fans the streams out and animates noise along them. Colours are sampled from the reference: `#077de7`, `#33bafe`, `#7edffe` |
| Snow | `drawSnow()` | Particles on `.air` in three depth layers. Leaves the vent on the moving air, then slows and drifts down |
| Mist | `drawMist()` | Used only as the airflow fallback when WebGL is missing |
| Live parts | `drawLive()` | Canvas 2D overlay on `.live`. Time-based, so it keeps running when scrolling stops |
| Pointer tilt | `bindPointer()` | Mouse only. Held flat during the live parts so the overlay stays aligned |

Live parts are authored in 3D model coordinates. `makeCamera()` projects them using the same camera as the render, from the `CAMERA` table, so they stay locked to the parts in every frame.

| Part | Live effect |
|---|---|
| Blower | 30 blades turning, with motion trails |
| Motor | Tie bars and shaft turning, with a pulsing copper glow |
| Evaporator coil | Light running along the tubes, a sweeping band of cold, blinking frost points |
| Control board | Blinking LEDs, pulses along circuit traces |
| Cable | Power pulses from the board to the motor |

The tables `VENT`, `PARTS` and `CAMERA` at the top of `js/script.js` hold 3D positions exported from the render. If the frames are re-rendered with a different camera, they must be exported again.

## 7. How the frames were made

The frames are not photographs. They were rendered from a custom 3D model:

- The sample HD image of the AC is mapped onto the front of the model.
- The model is written as a GLSL ray-marching shader. It covers the body, flap, vanes, blower, motor, coil, control board and chassis.
- `render.html` holds the camera and animation keyframes. `drive.js` runs it on the GPU in headless Chrome. `encode.py` writes the WebP files.

To re-render, put `shader.glsl`, `render.html`, `drive.js` and `encode.py` in one folder, copy `img/ac-hero.webp` there as `tex.webp`, and create empty `out` and `batch` folders. Then run:

```bash
node drive.js "$PWD" 2200 0,1,2,3 batch   # frames to render
python3 encode.py batch /path/to/acc
node drive.js "$PWD" 2200 0 out "&anchors=1"   # writes out/anchors.rgba, the position tables as JSON
```

The side, flap and internal parts are designed, not measured from a real unit, so they are not an exact Carrier model.

## 8. Responsive behaviour

| Screen | Behaviour |
|---|---|
| 1121px and up | Full header navigation |
| 1120px and below | Header navigation becomes a hamburger menu |
| 760px and below | Smaller header; "Enquire Now" hidden; phone frames load |
| 420px and below | WhatsApp button shows only its icon |
| Aspect ratio 11:10 or narrower | Portrait layout: content on top, unit below |
| Portrait, 700px tall or less | Finale drops the list and description |
| Landscape, 680px tall or less | Finale drops the list |
| Landscape, 560px tall or less | One button; secondary text hidden |
| 420px tall or less | Smaller logo; scroll cue hidden |

## 9. SEO

- Descriptive `<title>`, meta description and `robots`, with `lang="en-IN"`.
- Open Graph and Twitter tags.
- schema.org `HVACBusiness` JSON-LD with service areas and brands.
- One `<h1>`, with `<h2>` for each scene.
- `alt` text on images and an `aria-label` on the frame canvas.
- All copy is in the HTML, so crawlers can read it without running the animation.

Before launch, add the real domain: `og:image` must be an absolute URL, and a canonical link, phone number and address should be added.

## 10. Performance

| Measure | Effect |
|---|---|
| Minified CSS and JS | JS 44 KB to 24 KB (under 10 KB gzipped); CSS 18 KB to 14 KB (about 4 KB gzipped) |
| Frames load after the page | Keyframes first, then the rest; the intro appears immediately |
| Phones load half the frames | Less data and memory |
| Data Saver | Keyframes only |
| Off-screen pause | `IntersectionObserver` stops all drawing when the banner is out of view |
| Effects only when needed | Airflow and live parts draw only in their own scenes |
| Reduced resolution | Airflow and snow canvases render below full resolution |
| Transform writes | The product transform changes only when the camera moves |

Measured at 60 FPS on a GTX 1650 at 1920×1080, with the phone viewport also at 60 FPS. That is a desktop GPU; real phones will differ.

## 11. Browser support and fallbacks

| Situation | Result |
|---|---|
| Current Chrome, Edge, Firefox, Safari | Full experience, designed for |
| No `svh` support | `@supports` falls back to `vh` |
| No WebGL | Soft canvas mist replaces the airflow; snow stays |
| GSAP cannot load | Static page with logo, copy, HD image and buttons |
| JavaScript disabled | The same static page |
| `prefers-reduced-motion` | The same static page |
| A frame fails to load | Nearest frame is shown |

## 12. Building after changes

Edit `css/style.css` or `js/script.js`, then rebuild from the project root:

```bash
npx terser js/script.js -c -m --comments false -o js/script.min.js
npx clean-css-cli -O1 -o css/style.min.css css/style.css
```

Then raise the `?v=` number on both links in `index.html` so browsers fetch the new files. `index.html` itself is kept readable so the markup is easy to copy into the site.

## 13. Adding it to the live site

1. Copy `css/`, `js/`, `img/` and the `<section class="banner">` markup.
2. Add the GSAP and ScrollTrigger scripts, the font link, the `document.documentElement.classList.add("js")` line, and the JSON-LD.
3. Keep your existing header, or use the one here. It must stay fixed to the top with the class `site-header`.
4. If your header height differs, set `--header` in `css/style.css`.
5. Remove the header markup here if it is not used, and also the menu code at the top of `js/script.js`, which expects `.menu-toggle` and `.site-nav`.

## 14. Common edits

| Change | Where |
|---|---|
| Page background | `.banner` in `css/style.css` |
| Brand colours | `:root` in `css/style.css` |
| Copy, captions, finale | `index.html` |
| Link targets | `href` values in `index.html` |
| Official Toshiba or Midea logo | Replace the `<span class="brand-logo ...">` with `<img class="brand-logo" src="..." alt="...">` |
| Brand rotation speed | The two `delayedCall` values in `cycleBrands()` |
| Amount of snow | `portrait ? 90 : 190` in `createAir()` |
| Scroll length | `end` in `buildStory()` |

## 15. Testing

Tested in Chrome with an automated script:

- 21 viewports from 320×568 to 3440×1440, including landscape phones.
- Scrolling forward and back, the skip button, the logo link and the mobile menu.
- Rotating a phone in the middle of the story.
- Real scrollbars, reduced motion, GSAP blocked, WebGL disabled, and opening from `file://`.

Not tested: real phones and tablets, Safari and Firefox. Firefox could not be automated in the test environment, so check both by hand before launch.

## 16. To finish before launch

| Item | Status |
|---|---|
| Header and button links | Placeholders such as `#services` and `#whatsapp` |
| WhatsApp number | Needed |
| Toshiba and Midea logos | Text stand-ins; official files needed |
| Toshiba and Midea copy | Draft; needs approval |
| "Since 1902" and Willis Carrier copy | Draft; needs approval |
| Midea partnership | The site names Carrier and Toshiba only; confirm before showing Midea |
| Brand logo permissions | Confirm with each brand |
| Domain details for SEO | See section 9 |

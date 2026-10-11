# AGENTS.md

## Project

Static personal portfolio website (no build step, no framework, three runtime dependencies: one Google Fonts stylesheet, the Tailwind Play CDN (token-mapped, preflight off), and Open Props (bare custom properties, referenced by nothing). Site content is in Indonesian (`lang="id"`).
Deployed to GitHub Pages from `main` branch root → https://ayries18.github.io/Portofolio/

- `index.html` — all page content (single page architecture, seven tab sections in one file)
- `case-study-read-assist.html` — standalone Read-Assist case study page (not a tab section)
- `css/style.css` — design tokens, every component, and both themes
- `javascript/script.js` — navigation tabs, mobile menu, theme toggle, section focus handoff, and the footer year
- `favicon.ico` — site icon, a **real** multi-size ICO (16/24/32/48/64/128/256, 32-bit). Do not "fix" it by regenerating; check the `00 00 01 00` magic before assuming anything.
- `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png` — explicit raster icons alongside the ICO
- `og-image.png` — 1200×630 social preview card, referenced by `og:image` / `twitter:image` on both pages. Regenerate it as an image; it is not an HTML page.
- `robots.txt` — **deleted by the owner** (it was allow-all with no sitemap pointer, so crawler behaviour is unchanged). Do not re-add robots.txt unasked.
- `404.html` — branded error page GitHub Pages serves for unknown paths. Static by design (no `script.js`): content, theme pre-paint, and buttons work with and without JS. Relative asset paths cover single-level typos; nested missing URLs resolve them wrongly — accepted, documented in the file.
- `logo.webp` — the mark actually painted in the navbar, 336×196 RGBA, and the source for every icon in the repository
- `profile/profile.webp` — 800×1200 upright portrait, used in the hero and by the README avatar
- `profile/read-assist-preview.webp`, `profile/portofolio-preview.webp` — the two project screenshots

**Every asset a page paints is tracked, and nothing else should be.** Do not
add an unreferenced asset as a spare. The last orphans (`logo.png` and the
`lokapreneur-*` / `portalberita-*` previews, 253,242 B) were pruned after a
reference scan proved zero page paints; `profile/profile.jpg` and
`portofolio-preview.png` went earlier for the same reason. If an asset loses
its last reference, prune it the same way instead of keeping it as a spare.

## Sections

1. **home** — hero: eyebrow, two-line `h1` with Character Assembly, lede, stack line, two CTAs, portrait with caption (no availability line; that claim lives in About/Contact only)
2. **about** — terminal transcript (9 commands, one-time typing, parked caret) plus a status-board aside (status, current work, core stack, location)
3. **education** — UIN Ar-Raniry plus a "Proyek Akademik" list (Portal Berita, LokaPreneur). **No nav link**; reached from the note inside Projects, with a `← Kembali ke Proyek` back link at the top.
4. **skills** — continuous ticker of the 8 solo-built stacks (HTML → SQLite) with coloured brand icons; seamless `-50%` loop, hover/focus pause, no buttons
5. **projects** — **only solo work**: Read-Assist (featured), Portofolio Personal; one-time figure/index reveal, hover zoom, arrow-nudge GitHub links
6. **artikel** — one verified journal paper (first of three authors, ZONAsi Vol. 8 No. 3, 2026) with an outbound journal link; no abstract or full text is mirrored, only venue facts
7. **contact** — three rows (Email, GitHub, LinkedIn) with label / value / arrow, brand-coloured GitHub/LinkedIn icons, one-time staggered reveal

## Design System

Editorial minimalism. Three rules govern everything: one radius, hairline rules instead of shadows, and purple spent in exactly six places.

- **Colour** — every value is a token in `:root` / `[data-theme='dark']`. Never hardcode one. Light: `--bg #ffffff`, `--ink #18181b`, `--brand #7c3aed`, `--brand-ink #6d28d9` (7.10:1). Dark: `--bg #0b0b0f`, `--ink #f4f4f5`, `--brand-ink #c084fc` (7.44:1). There is no separate manual dark override block; dark values live only in `[data-theme='dark']`.
- **`--brand-ink` is the only purple allowed on text.** `--brand` (#7c3aed) reaches just 3.45:1 on the dark background and fails AA for small text. Use `--brand-ink` for any coloured text, and `--brand` only as a fill behind white text.
- **The six purple uses** — the name in the navbar, the active nav underline, the single solid hero CTA, inline links and the focus ring, the project index number, and one accent rule per section head. Do not add a seventh. Third-party brand marks (ticker icons, contact GitHub/LinkedIn icons) carry their official colours instead: they are decorative identity, always paired with an adjacent word, and exempt from the text-contrast budget for that reason.
- **Type** — Inter `400/500/600` plus a system monospace stack (`--mono`) for metadata; no second web font. Nine named sizes: `--t-display`, `--t-lede`, `--t-h2`, `--t-project-lg`, `--t-project`, `--t-h3`/`--t-body`, `--t-sm`, `--t-meta`, `--t-mono`. **Never write a raw `font-size` in a component.** An earlier revision had `1.25rem`/`1.5rem`/`0.9em` inline, which produced off-scale 13.5px and 15.3px text; that is why `--t-project`/`--t-project-lg` exist.
- **Space** — `--s-1`…`--s-7` (4/8/16/24/40/64/96px). `--measure: 1040px` is the outer container, `--col: 62ch` the prose measure.
- **Shape** — `--radius: 4px` and nothing else. A `border-radius >= 100px` on a visible element means a pill crept back in. `--rule`/`--rule-2` hairlines replace every former shadow, gradient, and glow.
- **Motion** — one-shots plus one loop. Hero entrance (600ms `--t-enter`, staggered, once), terminal typing (34ms/char, once, parked caret), project/contact/board reveals (once, shared observer, staggered), and the skills ticker (26s linear loop, hover/focus pause, no buttons). Micro-feedback (arrows, rules, wash) stays at `--t` (180ms). Typing and the ticker keep their own durations — do not homogenise them. `prefers-reduced-motion` forces every staged state visible, kills loops, and turns tab-scroll `auto`; the `*` floor zeroes durations.

## Non-obvious Architecture & Gotchas

- **Tab-based section display**: `.js section:not(.hero) { display: none }` plus `.js section:not(.hero).active` shows exactly one at a time. The hero is excluded from that pair and driven by its own `.js .hero` / `.js .hero.active { display: grid }` — it **must** be excluded, because `.js section.active` weighs 0-2-1 and would outrank a plain `.hero.active` at 0-2-0, flattening the two-column hero to a block on the first tab switch.
- **The `.js` class is the no-JS switch, and it is load-bearing**: `<html>` ships `class="no-js"`, and the first inline `<head>` script removes it and adds `js` before first paint. Every rule that hides content is scoped to `.js`. Before that scoping existed, a blocked or failed `script.js` meant `section { display: none }` with no `.active` to reveal it — a blank page. Under `.no-js` every section stacks, `#about`-style nav hashes degrade to ordinary in-page anchors, and `.no-js .theme-toggle` / `.no-js .nav-toggle` / `.no-js .nav-links` make the drawer permanently visible and hide the two buttons that would do nothing. Never write an unscoped `section { display: none }` back.
- **`.section` is load-bearing for spacing, not just for hiding**: it carries `padding-block` and `scroll-margin-top`. The hero overrides the padding with its own and declares `scroll-margin-top` separately, so it must **not** also carry `.section`. An earlier revision dropped `class="section"` from every tab; nothing looked broken, but all five sections silently lost their vertical padding. JS matches sections with `element.matches('section')`, never with a class check, for exactly this reason.
- **Navigation state lives in one function**: `setActiveNav(href)` in `javascript/script.js` is the only place that writes both the `.active` class on `.nav-links a` and `aria-current="page"`. Every call site routes through it — `switchSection`, the deep-link bootstrap, and the no-hash default. The class alone tells assistive technology nothing, and the two signals drifting apart is the failure mode this prevents. `#education` has no nav item, so `setActiveNav` clears `aria-current` from every link for that hash. Do not reintroduce hand-rolled `classList.remove('active')` loops.
- **In-page anchors activate their tab, cross-page links navigate**: the generic `a[href^="#"]` handler calls `switchSection` only when the target is a `<section>`; anything else falls through to the browser. That is why the case study's `index.html#projects` links work — `script.js` never hijacks an href that does not start with `#`.
- **Tailwind generates utilities for any class in the DOM**: the Play CDN saw `main.container` and applied its own `container` width (1280px at xl), silently beating `--measure`. That is why `container: false` sits next to `preflight: false` in the config. Before adding any Tailwind plugin or utility class, grep the markup for name collisions first — `container` already bit once.
- **The case study page must use `<div>`, never `<section>`**: `.js section:not(.hero) { display: none }` plus the "first section is active" bootstrap would blank every block.
- **Section focus handoff**: `switchSection` sets `tabindex="-1"` on the target and focuses it, so keyboard and screen-reader users actually follow a tab change instead of staying on the nav link. `[tabindex='-1']:focus { outline: none }` suppresses the ring on that programmatic focus only. Escape in the mobile drawer returns focus to `.nav-toggle`.
- **The drawer is global; the bar shows its twin**: `.nav-links` is a fixed left panel at every width (closed = translated away, `visibility`-hidden, and `inert`, so hidden links leave the tab order and the tree — verify by tabbing). `.nav-inline` duplicates the same five hrefs as a visible desktop row and hides on mobile; `display:none` does its own hiding there. `setActiveNav` writes class + `aria-current` to both twins, and `inert` is only ever set from JS, never in markup, so no-JS keeps every link. `aria-expanded` on `.nav-toggle` is the only open-state signal.
- **The drawer's active marker is a border, not a box-shadow**: `.nav-links a` reserves `border-left: 2px solid transparent` at rest so marking the active tab cannot shift its own label sideways. It used to be `box-shadow: inset 2px 0 0` — the last shadow on the site, and against the flat direction.
- **`.container` and `.footer-inner` carry separate gutters** and each needs its own mobile step: `.footer-inner`'s `padding-inline: var(--s-3)` must live in the `≤768px` block alongside `.container`, or footer text sits 8px right of every section from 561–768px. The footer stacks centered at every width (copyright above, links below). Verify with content-box edges at 1440/1280/1024/768/390/360px — border-box left edges lie by exactly the gutter and make correct layouts look broken.
- **`img` needs `height: auto`**: the global reset sets `max-width: 100%; height: auto`. Omitting it lets `max-width` shrink the width while the height stays pinned, silently defeating `aspect-ratio`.
- **Project screenshots are letterboxed, not cropped**: `.project-figure` is a fixed `aspect-ratio: 16 / 9` frame with `object-fit: contain` on `--bg-sunken`. `read-assist-preview.webp` is 1440×810 (exactly 16:9, fills the frame); `portofolio-preview.webp` is 1200×590 (2.03:1, genuinely letterboxed). The "shown uncropped" caption therefore belongs to Portofolio Personal only — do not move it without re-measuring.
- **Project layout is editorial rows, not cards**: the compact row is `4ch minmax(0,1fr) 320px` (index / text / figure) with `align-items: start`; a shorter figure column next to taller text is correct for `align-items: start`, not dead space. The featured entry breaks the row on purpose: `.project--featured` stacks a full-width media block (figure + dimension caption) above its copy with a larger title (`--t-project-lg`), so the flagship never reads as a second identical row.
- **Long contact URLs wrap, never clip**: `.contact-value` is `--t-sm` with `overflow-wrap: anywhere`, so the full LinkedIn URL stays readable and retypeable on narrow screens instead of ellipsising.
- **Icons are inline SVG only** (no icon library); colours come from tokens, never hardcoded per icon.
- **One mark, three sizes, and it inverts between themes**: `logo.webp` (336×196, 4.1 KB) is the mark painted in the navbar at 26×15px and is the source for every icon in the repository. It carries three colours — purple, a light-grey fill, and black outlines — so **purple is the only part legible on both backgrounds**: measured loss is ~16–18% of pixels on a white nav and ~3–6% on `#0b0b0f`. Its `alt` is empty on purpose (`.nav-name` already names the person). Never recolour it and never give it a container to "fix" the inversion — that is the one thing that would reintroduce a chip. 26px is measured-optimal: it is where the purple share peaks (43.8%) and it makes the mark exactly the same height as the 15px `.nav-name`, so the mark can never out-weigh the name. `favicon-16x16.png` / `favicon-32x32.png` are extracted from the verified `favicon.ico` frames so the PNGs and the ICO cannot disagree; `apple-touch-icon.png` is the one icon that must be opaque, so it sits on `#0b0b0f` (the dark token) with an 8% inset, because iOS masks the tile and full-bleed would clip the outer glyphs.
- **`og-image.png` is generated artwork, not a page**: 1200×630 PNG (the `summary_large_image` ratio), Inter baked in at generation time, one purple 40×4 rule, hairline footer. Regenerate it as an *image*; there is no markup to edit and it is never painted on the site. It was built because the old `og:image` was the raw logo, which every scraper cropped badly. Both pages must point at it, and `og:image:width`/`height` should stay truthful.
- **The profile photo is sideways data, not CSS**: `profile/profile.webp` is 800×1200 upright. The original was a landscape JPEG with the scene rotated 90° and **no EXIF Orientation tag**, so no browser auto-corrected it and no CSS `transform` fixes it. If it is ever replaced, re-check orientation from the pixels, never by eyeballing the URL. `--portrait-focus: 50% 50%` centres it; a top-bias only made sense while it was sideways.
- **Theme**: `data-theme` is set on `<html>` **and** `<body>` by an inline `<head>` script (prevents flash) and by `applyTheme`. Light is encoded as the **absence** of the attribute and persisted as the string `"light"`, so an explicit light choice survives reload on a dark-OS browser; `prefers-color-scheme` is only consulted when nothing is stored. `body` transitions `background`/`color` over 200ms, so reading `getComputedStyle` in the same tick as a toggle returns the pre-transition colour — wait before asserting.
- **`favicon.ico` is a real multi-size ICO** (closed item): `00 00 01 00` magic, seven 32-bit entries at 16/24/32/48/64/128/256, alongside explicit `favicon-16x16.png`, `favicon-32x32.png`, and `apple-touch-icon.png`. An earlier note here claimed the file was a mis-named PNG; it was not, and re-deriving the artwork to "fix" it would only regress it.
- **Featured project**: Read-Assist is featured and its full write-up lives in the standalone `case-study-read-assist.html`. There is no `.project-details` block in `index.html`.
- **Education has no nav link**: reached from the link in the Projects note, with a `← Kembali ke Proyek` back link (`.cs-back` reused) at the top. Do not add a nav entry without being asked.
- **Hero assembly contract**: the `h1` carries `aria-label="Muhammad Almuwarisin"` while both `.hero-line`s are `aria-hidden` — no live region, so screen readers hear the name once. JS cycles glyphs per line and must restore the exact strings (a 3s watchdog enforces it); `releaseHero` is idempotent with a 400ms `setTimeout` backstop because a starved rAF must never trap content staged.
- **Ticker contract**: six identical `.ticker-group` sets, first exposed, rest `aria-hidden`; brand marks defined once as `<symbol>` and reused via `<use>`. The `-50%` loop is seamless only while every set stays identical — verify equal widths, not the animation name. Motion is `.js`-gated; `.no-js` and reduced-motion fall back to a wrapped static row of the exposed set.
- **Claim discipline is a content invariant**: the site only states capabilities traceable to source. Portal Berita and LokaPreneur are in Education precisely because their application code was written by other authors and this account holds documentation commits only. Never re-add a tech badge, capability, or metric that no repo or file supports — that is how the MySQL chip and the Figma badge got there in the first place.
- **Accessibility**: skip link, a single global `:focus-visible` rule (2px purple ring), `prefers-reduced-motion`, and ARIA labels. Verify new interactive elements by **tabbing** to them — calling `.focus()` from JS does not trigger `:focus-visible`. The skip link is 1×1 and off-screen at rest by design and must expand past 24px when focused.

## Projects

The "Built by me" column is the load-bearing one. Only the two solo projects may ever be presented as this author's own work.

| Project | Repo | Built by me | Status |
|---------|------|-------------|--------|
| Read-Assist | https://github.com/Ayries18/Read-Assist | Yes (solo, 1 contributor) | Featured |
| Portofolio Personal | https://github.com/Ayries18/Portofolio | Yes (solo) | Active |
| LokaPreneur | https://github.com/Ayries18/LokaPreneur | No — documentation commits only | Academic |
| Portal Berita | https://github.com/Ayries18/Portal-Berita | No — documentation commits only | Academic |

## Local Preview

- Serve with Python: `python -m http.server` and open `http://localhost:8000`
- Or open `index.html` directly in any browser.

## Verifying Changes

Assert rendered geometry, never the stylesheet. `.focus()` does not trigger `:focus-visible`, and reading CSS will not reveal a missing class.

```bash
python -m http.server 8123          # from the repo root
```

Playwright checks that must pass before calling a change done:

- No horizontal overflow at **1440/1280/1024/900/768/430/390/360px**, in both themes
- Navbar ≤60px; the hamburger takes the content edge (it sits first in the bar), with `.brand`, `main`, and the footer on the same edge behind it
- Exactly one `h1`; every leaf text node ≥4.5:1 (≥3:1 for ≥24px)
- No visible `border-radius >= 100px`, no `box-shadow`, no gradient background
- All seven tabs activate, take focus, and leave exactly one `aria-current` (`#education` has no nav item: deep-linking it must clear every link instead)
- Drawer opens with Enter, closes with Escape, and returns focus (valid at every width; the desktop twin row is the same links inline)
- Theme survives reload, and light-on-dark-OS survives reload
- No console errors, page errors, or failed requests on either page

## Conventions

- Keep it lightweight and dependency-free: vanilla HTML5, CSS3, and JavaScript (ES6+).
- Responsive breakpoints are 1024px, 900px, 768px, and 560px.
- Maintain Indonesian language tone and text content.
- Use inline SVGs for icons, not external icon libraries.
- All external links need `target="_blank" rel="noopener noreferrer"`.
- Focus states use `:focus-visible`.
- Hover transitions name explicit properties at `--t` (180ms); never `transition: all`.
- Write UTF-8 **without a BOM**. PowerShell 5.1's `Set-Content -Encoding UTF8` adds one.
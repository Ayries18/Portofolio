# AGENTS.md

## Project

Static personal portfolio website (no build step, no framework, no npm dependencies for runtime). Site content is in Indonesian (`lang="id"`).
Deployed to GitHub Pages from `main` branch root → https://ayries18.github.io/Portofolio/

- `index.html` — all page content (single page architecture, all sections in one file)
- `css/style.css` — all styles, design tokens, and theme rules
- `javascript/script.js` — navigation tabs, mobile menu, theme toggle, and the footer year
- `favicon.ico` — site icon (previously misnamed `fahicon.ico`, which 404'd)
- `logo.png` — used for Open Graph / Twitter Card `og:image`
- `profile/profile.jpg` — profile image asset (nav avatar, hero). About deliberately has **no** photo.
- `profile/*-preview.webp` — project thumbnails referenced by the project cards. The original `.png` files are still in the repo but no longer referenced.

## Sections

1. **home** - Hero section with name, title, description
2. **about** - About section: bio, auto-scrolling Tech Stack marquee, focus areas, relevant projects. Single column, no photo.
3. **education** - Education (UIN Ar-Raniry only)
4. **skills** - Technical skills (Frontend, Backend, Tools)
5. **projects** - Projects (Read-Assist featured, LokaPreneur, Portofolio Personal, Portal Berita)
6. **contact** - Contact links (Email, GitHub, LinkedIn)

## Non-obvious Architecture & Gotchas

- **Tab-based Section Display**: Sections are hidden by default via `section { display: none }` (`css/style.css`). Only `section.active` is displayed (`css/style.css`). `.hero` is also a section. Navigation items (`.nav-links a`) switch active sections based on `href="#sectionId"` without page reload. Adding or renaming sections requires updating both HTML IDs and `.nav-links a` anchors. Because only one section is visible at a time, sections use `margin-top: 0` plus `scroll-margin-top: 96px` instead of vertical gaps between sections.
- **Theme & Dark Mode**: Dark mode is controlled via `[data-theme='dark']` on `<html>` and `<body>`, initialized by an inline `<script>` in `<head>` to prevent flash and persisted in `localStorage.getItem('theme')`. The default follows `prefers-color-scheme`. There is **no separate manual dark-mode override block** any more — every dark value lives in the `[data-theme='dark']` token block, so new components should be styled with tokens only.
- **Brand Palette (black + purple)**: All colour comes from CSS custom properties in `:root` / `[data-theme='dark']`. Light: `--primary: #7C3AED`, `--primary-hover: #6D28D9`, `--accent: #A855F7`. Dark: `--background: #0B0B0F`, `--surface: #15151C`. Never hardcode a colour, and never reintroduce the old blue palette.
- **Accessible brand ink**: `--primary` (#7C3AED) only reaches 3.45:1 on the dark background, and the soft brand tints dilute it further. For coloured **text**, use the dedicated tokens instead of `--primary`/`--accent`: `--primary-ink` (ink on the plain page background) and `--tint-ink` (ink on top of `--primary-soft` / `--accent-soft`). Both are re-declared per theme and are what keep small text at WCAG AA (4.5:1).
- **`img` needs `height: auto`**: The global `img` reset sets `max-width: 100%; height: auto`. Omitting `height: auto` makes `max-width` shrink only the width while the height stays pinned to the intrinsic height, which silently defeats `aspect-ratio` and renders the hero photo 420×800 instead of 420×280.
- **Project thumbnails are not cropped**: `.project-thumb` is a fixed `aspect-ratio: 16 / 9` frame, so `.project-thumb img` uses `object-fit: contain` on a `--surface-hover` background. Two screenshots are wider than 16:9 (LokaPreneur 2.12:1, Portofolio 2.03:1) and are deliberately letterboxed rather than cropped. Hover applies a `scale(1.03)` that is safely clipped by the frame's `overflow: hidden`.
- **Long contact URLs need `minmax(0, 1fr)`**: `.contact-value` uses `white-space: nowrap` with an ellipsis, but a `1fr` grid track has an automatic `min-content` minimum. Without `minmax(0, 1fr)` on `.contact-links`, the long LinkedIn URL forces the whole row to ~430px and causes horizontal page scroll on 320–414px screens.
- **Visuals & Icons**: Icons use inline SVGs only (no Font Awesome). Project cards use inline SVG illustrations rather than external image files.
- **Two logo files, two jobs**: `logo.png` (1008×1055, 191 KB) is the **full-resolution source** and is only referenced by `og:image` / `twitter:image`, which are never painted on the page. The visible nav mark is `logo.webp` (160×167, 1.4 KB) inside `.brand`. Do not point the nav at `logo.png` — a 191 KB asset for a 34 px chip is indefensible. The nav logo is a **light** artwork (cream `#F1F1EC` ground, muted-purple accent) on a near-black nav, so it needs the `1px solid var(--primary-border)` outline to read as an intentional chip rather than a white blob; never drop that border. Its `alt` is empty on purpose: the adjacent `.nav-name` already names the person, so a text `alt` would be announced twice.
- **The profile photo is sideways data, not CSS**: `profile/profile.webp` and `profile/profile.jpg` are both 800×1200 **upright**. The original was a 1200×800 landscape JPEG with the scene rotated 90° and **no EXIF Orientation tag at all**, so no browser ever auto-corrected it and no CSS `transform` can fix it — a `rotate()` would only mask it. If the photo is ever replaced, re-check orientation from the pixels (vertical-dominant edge energy, i.e. `|d/dx| > |d/dy|`, and a face centroid in the upper half), never by eyeballing the URL. `--portrait-focus: 50% 50%` was set to centre once the file was upright; the old `50% 34%` top-bias only made sense while it was sideways.
- **Navbar name is two spans, not one gradient**: `.nav-name` holds `.nav-first` (body ink) + `.nav-last` (purple gradient). The gradient stops **must** stay `--primary-ink` → `--tint-ink`; swapping in raw `--accent` (#A855F7) drops it to 3.0:1 on the light nav and fails WCAG AA for 16px bold. The literal space between the spans is deliberate — it is what makes the accessible name read "Muhammad Almuwarisin" instead of "MuhammadAlmuwarisin". Menu underlines animate with `transform: scaleX()` + `transform-origin: center` (grows from the middle); reverting to `width` makes them sweep in from the left edge.
- **`.reveal` outranks bare-class hover rules**: `.reveal.active { transform: translateY(0) }` sits near the end of the stylesheet at specificity (0,2,0) — identical to a bare `.skill-card:hover` — so it wins on source order and the hover lift silently never renders. Project and contact cards only escaped this because their rules are element-qualified (`article.project-card:hover`, `a.contact-item:hover` = 0,2,1). Any hover `transform` on an element that JS adds `.reveal` to must be qualified by a parent class, or the `transform` is dead. Verified by measuring the computed matrix on hover, not by reading the CSS.
- **The hero typewriter runs on timers, not CSS**: Typed.js types with `setTimeout`, so the `prefers-reduced-motion` block in the stylesheet cannot suppress it. `script.js` branches on `matchMedia('(prefers-reduced-motion: reduce)')` and writes the final string directly instead. It is also configured `loop: false` with a single string on purpose — the old two-string loop deleted the headline one character at a time, so the h2 spent most of its life mid-backspace and read as the truncated "Web Develop". Never re-add `loop: true` here.
- **A cold-start layout shift in the hero is font swap, not typing**: the paragraph below the h2 moves ~14px on first paint because Inter arrives after first render. It reproduces identically with the typewriter disabled, so do not chase it as a typing/CLS bug. `min-height: 1.4em` on `.hero h2` reserves the line box so the typewriter itself adds no shift.
- **About is single column and owns the only marquee**: `.about` is a `flex-direction: column` stack inside the shared `main.container` (1000px, so 960px of content). `text-wrap: balance` is scoped to `.about h2/h3/h4` on purpose — the shared `.section h2` rule also styles Projects, Skills and Contact, so adding balance there would silently rebalance every other tab. The profile photo lives in the hero and the nav avatar only; do not re-add it here.
- **The Tech Stack marquee loops by duplicating one group, and the math is load-bearing**: `.stack-track` is `width: max-content` holding two identical `.stack-group`s, animated `translateX(0) → translateX(-50%)` over 28s linear infinite. That only seams up because each group carries its own `padding-right` equal to its `gap` instead of the track using a `gap` — a track gap would be counted in the 50% and shift the seam. Verified: track 2816.09px = 2 × 1408.05px group. Adding a chip to one group and not the other, or switching the padding to a track `gap`, breaks the loop.
- **Stack logos are a `<use>` sprite, so the path data exists once**: the 11 official Simple Icons paths (CC0) live in a hidden `svg.stack-sprite` as `<symbol id="ic-*">` and each chip is a 20px `<svg><use href="#ic-*"/></svg>`. Inlining all 22 chips instead would duplicate ~11KB of path data for the second copy. The sprite is hidden with `position:absolute; width:0; height:0; overflow:hidden` rather than `display:none`. Every symbol must use a **filled** `<path>`: a `fill="none"` stroked path reports `getBBox()` of `0x0` and is easy to mistake for a broken reference. `fill: currentColor` on `.stack-logo` is what colours the referenced symbol, so the brand colour is set with `color`, not `fill`.
- **Blade has no official brand mark**: Laravel never published a standalone Blade logo and Simple Icons has no `blade` entry (verified: 404, and no blade/template entry in the index). The chip uses a neutral filled double-chevron glyph and borrows `var(--accent)` as its `--brand`. Do not invent an "official" Blade logo or reuse the Laravel mark — that reads as a duplicate Laravel chip.
- **Stack brand colours are literal on purpose**: `--brand` per `.stack-logo--*` holds third-party identity colours, which is the one sanctioned exception to "never hardcode a colour". Four official values (PHP #777BB4, GitHub #181717, MySQL #4479A1, SQLite #003B57) are too dark to read once desaturated on `--surface`, so `[data-theme='dark']` re-declares exactly those four with lifted values. The rest must stay as the official hex. The grayscale-to-colour effect is `filter: grayscale(1) opacity(0.5)` at rest with the real brand colour underneath, so hover only has to drop the filter.
- **The marquee only pauses on `:hover` / `:focus-within`**: chips are non-interactive `<span>`s, so `:focus-within` never fires in practice and the global `prefers-reduced-motion` block (`animation-duration: 0.01ms; iteration-count: 1`) is the only thing that stops it for reduced-motion visitors — the track then rests at `-50%`, which still shows one complete set. This leaves a **WCAG 2.2.2 gap** (auto-starting moving content needs a keyboard-reachable pause control); a visible pause button is still outstanding. The edge fade uses `mask-image` with **pixel** stops (64px desktop / 28px mobile), not percentages, so the fade keeps the same visual width across a 960px and a 320px track.
- **`.about-block` dividers are a gradient pseudo-element, not a border**: `border-top` cannot carry a glow, so the line is a `::before` running `transparent → --primary-border → --accent-border → transparent`. Anything replacing it with a plain border loses the effect.
- **`.about-focus li:first-child` is the primary badge**: "Web Development" carries the brand fill and weight 600; the rest are transparent with a plain border at weight 500. The hover glow reuses a dedicated `--chip-glow` token, not `--logo-glow`, so the two can diverge.
- **`favicon.ico` is not a real ICO** (open item): the file is a **PNG** (`89 50 4e 47` magic) named `.ico`, measuring 437×334 and largely transparent, so browser tab icons render near-empty. Regenerating a proper multi-size square ICO from the existing artwork is still outstanding; the artwork itself must not be redesigned.
- **Featured Project**: Read-Assist is the featured project with problem/solution details in `.project-details` section.
- **Education has no nav link and no `h2`**: the `education` section is reachable only programmatically and renders its card without a heading. Do not add a nav entry or heading without being asked.
- **Accessibility**: Includes skip-link, focus-visible states, prefers-reduced-motion support, and proper ARIA labels. A single global `:focus-visible` rule supplies the 2px purple ring; verify new interactive elements show it by tabbing to them (calling `.focus()` from JS does **not** trigger `:focus-visible`).

## Projects

| Project | Repo | Status |
|---------|------|--------|
| Read-Assist | https://github.com/Ayries18/Read-Assist | Featured |
| LokaPreneur | https://github.com/Ayries18/LokaPreneur | Active |
| Portofolio Personal | https://github.com/Ayries18/Portofolio | Active |
| Portal Berita | https://github.com/Ayries18/Portal-Berita | Active |

## Local Preview

- Serve with Python: `python -m http.server` and open `http://localhost:8000`
- Or open `index.html` directly in any browser.

## Conventions

- Keep code lightweight, dependency-free vanilla HTML5, CSS3, and JavaScript (ES6+).
- Preserve existing responsive breakpoints (~768px).
- Maintain Indonesian language tone and text content.
- Use inline SVGs for icons, not external icon libraries.
- All external links must have `target="_blank" rel="noopener noreferrer"`.
- Focus states use `:focus-visible` for keyboard accessibility.
- Keep hover transitions on explicitly named properties at 200–300 ms; never `transition: all`.

# AGENTS.md

## Project

Static personal portfolio website (no build step, no framework, no npm dependencies for runtime). Site content is in Indonesian (`lang="id"`).
Deployed to GitHub Pages from `main` branch root → https://ayries18.github.io/Portofolio/

- `index.html` — all page content (single page architecture, all sections in one file)
- `css/style.css` — all styles, design tokens, and theme rules
- `javascript/script.js` — navigation tabs, mobile menu, theme toggle, and footer timestamps
- `favicon.ico` — site icon (previously misnamed `fahicon.ico`, which 404'd)
- `logo.png` — used for Open Graph / Twitter Card `og:image`
- `profile/profile.jpg` — profile image asset (nav avatar, hero, about)
- `profile/*-preview.webp` — project thumbnails referenced by the project cards. The original `.png` files are still in the repo but no longer referenced.

## Sections

1. **home** - Hero section with name, title, description
2. **about** - About section with photo and bio
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

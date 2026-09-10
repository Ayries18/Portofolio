# AGENTS.md

## Project

Static personal portfolio website (no build step, no framework, no npm dependencies for runtime). Site content is in Indonesian (`lang="id"`).
Deployed to GitHub Pages from `main` branch root → https://ayries18.github.io/Portofolio/

- `index.html` — all page content (single page architecture, all sections in one file)
- `css/style.css` — all styles, design tokens, and theme rules
- `javascript/script.js` — navigation tabs, mobile menu, and theme toggle behavior
- `profile/profile.jpg` — profile image asset

## Sections

1. **home** - Hero section with name, title, description
2. **about** - About section with photo and bio
3. **education** - Education (UIN Ar-Raniry only)
4. **skills** - Technical skills (Frontend, Backend, Tools)
5. **projects** - Projects (Read-Assist featured, LokaPreneur, Portofolio Personal, Portal Berita)
6. **contact** - Contact links (Email, GitHub, LinkedIn)

## Non-obvious Architecture & Gotchas

- **Tab-based Section Display**: Sections are hidden by default via `section { display: none }` (`css/style.css`). Only `section.active` is displayed (`css/style.css`). `.hero` is also a section. Navigation items (`.nav-links a`) switch active sections based on `href="#sectionId"` without page reload. Adding or renaming sections requires updating both HTML IDs and `.nav-links a` anchors.
- **Theme & Dark Mode**: Dark mode is controlled via `[data-theme='dark']` on `<html>` and `<body>`, initialized by an inline `<script>` in `<head>` to prevent flash and persisted in `localStorage.getItem('theme')`. Styles use both CSS variables and explicit overrides in `/* MANUAL DARK MODE */` block. Any new UI component must have matching dark mode styles or use CSS custom properties.
- **Visuals & Icons**: Icons use inline SVGs only (no Font Awesome). Project cards use inline SVG illustrations rather than external image files.
- **Featured Project**: Read-Assist is the featured project with problem/solution details in `.project-details` section.
- **Accessibility**: Includes skip-link, focus-visible states, prefers-reduced-motion support, and proper ARIA labels.

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

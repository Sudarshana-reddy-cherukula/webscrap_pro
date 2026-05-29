# MASTER PROMPT - Frontend Upgrade (Current App Aware)

You are a senior frontend architect and React engineer.

Upgrade the existing React frontend in this repo into a production-ready AI SaaS frontend while preserving the current futuristic look and section flow.

Current baseline to respect:
- React + Vite app already exists.
- Main UI is currently in `src/App.jsx`.
- Existing sections: Hero, Dashboard, Scraper, PDF, Automation, Analytics, Export.
- Theme toggle behavior is already defined and must remain: dark mode shows `☀️`, light mode shows `🌙`.
- Existing neon/glass visual identity should be preserved, not replaced.

Do not rebuild from scratch. Evolve what exists.

---

# OBJECTIVE

Convert the current prototype-like frontend into a maintainable, scalable, accessible, and API-ready frontend architecture.

Preserve:
- futuristic premium styling
- glass/neon aesthetics
- smooth micro-interactions

Improve:
- code organization
- route architecture
- reusable components
- real data flow integration points
- accessibility and responsiveness

---

# REQUIRED STACK

Use:
- React + Vite
- React Router DOM
- Zustand or Context API
- Axios (or fetch wrapper with equivalent features)
- Framer Motion (optional but preferred for transitions)
- organized styling strategy (modular CSS or structured global system)

Avoid:
- monolithic `App.jsx`
- large inline styles
- hardcoded one-off UI logic spread across many sections

---

# TARGET REFACTOR PLAN

Refactor current single-file UI into:

src/
- app/
- routes/
- layouts/
- pages/
  - Home/
  - Dashboard/
  - Scraper/
  - PDFTools/
  - Automation/
  - Analytics/
  - Export/
  - Settings/
- components/
  - ui/
  - navigation/
  - cards/
  - forms/
  - feedback/
  - sections/
- features/
  - scraper/
  - pdf/
  - analytics/
  - export/
  - theme/
- services/
- hooks/
- store/
- utils/
- constants/
- styles/

---

# ROUTING REQUIREMENTS

Replace section-toggle navigation with route-based pages while keeping equivalent content:

- `/`
- `/dashboard`
- `/scraper`
- `/pdf-tools`
- `/automation`
- `/analytics`
- `/export`
- `/settings`
- `*` (not found)

Add:
- route-level lazy loading
- loading fallback
- scroll restoration
- preserved active nav state

---

# NAVIGATION + THEME REQUIREMENTS

Navbar must include:
- active route highlight
- responsive mobile menu
- sticky glass style
- theme toggle button

Theme system requirements:
- persist in localStorage under `theme`
- apply theme through `document.body.dataset.theme`
- exact toggle icon logic:
  - `theme === 'dark' ? '☀️' : '🌙'`
- avoid regressions in current behavior

---

# PAGE-SPECIFIC UPGRADE REQUIREMENTS

## Home
- keep hero messaging and premium visual identity
- add clearer value proposition blocks and CTA hierarchy

## Dashboard
- convert static stats to reusable stat card components
- prepare for API-fed metrics

## Scraper
- keep URL input workflow
- add form schema support for future fields: depth, selectors, scrape mode
- include loading, success, and error states

## PDF Tools
- preserve current tab model (extraction/images/metadata/conversion/merge-split/security)
- move each tab into modular components
- keep upload behavior and prepare API hooks

## Automation
- keep workflow node UX concept
- create reusable node actions and state model

## Analytics
- modular tabbed analytics panels
- placeholders should be structured for chart integration

## Export
- preserve source selection flow
- modularize export form and history panel

---

# STATE + DATA LAYER

Implement:
- centralized UI/app state (theme, notifications, page-level filters)
- service layer:
  - `scraperService`
  - `pdfService`
  - `analyticsService`
  - `exportService`
- shared HTTP client with:
  - base URL from env (`VITE_API_URL`)
  - timeout
  - standardized error mapping

---

# COMPONENT STANDARDS

Create reusable primitives:
- `Button`
- `Card`
- `Input`, `Select`, `Textarea`
- `Tabs`
- `EmptyState`
- `Toast` / `Notification`
- `SectionHeader`

All components must:
- support dark and light theme tokens
- be keyboard accessible
- avoid style duplication

---

# ACCESSIBILITY + RESPONSIVENESS

Ensure:
- semantic landmarks (`header`, `main`, `nav`, `section`, `footer`)
- keyboard navigable controls
- proper labels and `aria-*` attributes
- visible focus states

Responsive breakpoints to validate:
- 1440
- 1200
- 992
- 768
- 576
- 400

---

# PERFORMANCE REQUIREMENTS

Apply:
- route-based code splitting
- memoization only where it prevents real rerenders
- reduced motion support for heavy animations
- avoid unnecessary global listeners

# <GROQ_API_KEY>

# DELIVERABLES

Generate:
- upgraded frontend architecture
- refactored route-based app
- modular components and feature folders
- preserved futuristic branding
- clean, production-ready code structure

Do not:
- remove current theme behavior
- remove existing core sections
- downgrade visual quality

The result should feel like a deployable SaaS frontend ready for MVP and portfolio demonstration.

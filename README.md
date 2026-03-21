# UX Audit Tool — React

A production-ready UX audit application built with **React + Vite + Tailwind CSS**.

## Features

- **Issue Log** — Capture, categorise, filter and sort UX issues with screenshots
- **Heuristics** — Nielsen's 10 heuristics checklist with Pass / Fail / N/A, evidence, recommendations
- **WCAG 2.1** — All 49 success criteria (Level A & AA) grouped by principle
- **Export Excel** — 4-sheet `.xlsx` with colour-coded cells (Issue Log, Heuristics, WCAG, Summary)
- **HTML Report** — Self-contained report with screenshots embedded as base64
- **CSV Export** — Full or filtered issue log
- **Markdown Export** — Copy issue table as markdown
- **Image Viewer** — Click any thumbnail to enlarge, zoom (+/−) and safely download
- **Auto-save** — localStorage auto-save every 30 s
- **JSON Save / Load** — Full project save and restore

---

## Project Structure

```
src/
├── components/
│   ├── UI.jsx              Reusable: Button, Badge, Modals, Toast, ImageViewer, DropZone
│   ├── Header.jsx          Top bar + all export actions
│   ├── MetaBar.jsx         Project metadata (app name, auditor, date)
│   ├── IssueForm.jsx       Capture-issue sidebar form
│   ├── IssueTable.jsx      Issue list with filters and sort
│   ├── ChecklistItem.jsx   Single heuristic / WCAG item card
│   ├── HeuristicsTab.jsx   Nielsen's 10 full panel
│   └── WcagTab.jsx         WCAG 2.1 full panel
├── context/
│   └── AuditContext.jsx    Global state via React Context
├── data/
│   └── auditData.js        HEURISTICS array, WCAG array, constants
├── utils/
│   ├── helpers.js          slug, dlBlob, buildCSV, calcStats, initCheckState
│   └── exportUtils.js      exportExcel, exportCSVFile, exportHtmlReport
├── App.jsx                 Root component + tab routing
├── main.jsx                React entry point
└── index.css               Tailwind directives + global styles
```

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start dev server  →  http://localhost:5173
npm run dev

# 3. Build for production
npm run build

# 4. Preview production build
npm run preview
```

---

## Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| React | 19 | UI framework |
| Vite | 8 | Build tool & dev server |
| Tailwind CSS | 3 | Utility-first styling |
| SheetJS (xlsx) | 0.18.5 | Excel export |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Ctrl / Cmd + S` | Save session to browser storage |
| `Esc` | Close any open modal |
| `+` / `=` | Zoom in (image viewer) |
| `-` | Zoom out (image viewer) |

---

## Data Persistence

- **Auto-save** to `localStorage` key `ux-audit-react-v1` every 30 s
- **JSON export** for full portable save/restore
- Screenshots stored as base64 inside the JSON — no external files

---

## Export Reference

| Format | Description |
|--------|-------------|
| `.xlsx` | 4 sheets: Issue Log, Heuristics, WCAG 2.1, Summary. Colour-coded severity/status cells. |
| `.html` | Standalone report. All screenshots embedded. Open in any browser, print to PDF. |
| `.csv` | Issue log rows (filtered or full). `Has Screenshot` column included. |
| Markdown | Issue table copied to clipboard. |
| `.json` | Full project state for save/restore. |

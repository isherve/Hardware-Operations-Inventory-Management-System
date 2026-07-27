# Thesis Document — Built In Hardware Operations and Inventory Management System

This folder contains the final-year thesis report for the **Built In Hardware — Operations and Inventory
Management System** project, written as a single self-contained, print-ready HTML document.

## Files

| File | Description |
|------|-------------|
| `THESIS.html` | The complete thesis report (cover page, declaration, abstract, 8 chapters, references, appendices). Open it directly in any modern browser. |
| `figures/` | Screenshots and metrics referenced by the thesis (`01-home.png` … `11-pos-new-sale.png`, `metrics.json`). |
| `README.md` | This file. |

`THESIS.html` loads two small external libraries from a CDN at view time:

- **Mermaid.js** (`https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js`) — renders the architecture,
  ERD, sequence, use-case and deployment diagrams.
- **Chart.js** (`https://cdn.jsdelivr.net/npm/chart.js`) — renders the top-products, role-distribution and
  stock-status charts in Chapter 7.

An internet connection is required the first time you open the file so these scripts can load. Everything else
(text, tables, styling, screenshots) is fully self-contained and works offline.

## How to open it

1. Locate `THESIS.html` in this folder:
   `docs/thesis/THESIS.html`
2. Double-click the file, or right-click → **Open with** → your preferred browser (Chrome, Edge, or Firefox
   all work well). Google Chrome or Microsoft Edge is recommended for the most accurate print/PDF output.
3. Wait a moment for the diagrams (Mermaid) and charts (Chart.js) to render — this happens automatically once
   the page finishes loading.
4. Use the **Table of Contents** near the top of the document to jump to any chapter, the List of Figures, or
   the List of Tables via clickable links.

## How to export it to PDF

The document is already styled with print-specific CSS (A4 page size, page breaks between chapters, running
header/footer, table/figure-friendly page breaks), so exporting a clean PDF only takes a few steps:

1. Open `THESIS.html` in **Google Chrome** or **Microsoft Edge** (both use the same, most reliable print engine).
2. Wait for the diagrams and charts to fully render (a couple of seconds after the page loads).
3. Press **Ctrl + P** (Windows/Linux) or **Cmd + P** (macOS) to open the print dialog.
4. Set the following options in the print dialog:
   - **Destination:** Save as PDF
   - **Paper size:** A4
   - **Margins:** Default
   - **More settings → Background graphics:** ✅ **enabled** (this is required — it makes sure the cover page
     colours, coloured table headers, callout boxes and chapter accents print correctly instead of coming out
     plain black-and-white)
   - **Headers and footers (browser-provided):** optional — you can leave the browser's own header/footer off,
     since the document already includes its own running header/footer for print.
5. Click **Save**, choose a filename (e.g. `Built-In-Hardware-Thesis.pdf`) and a destination folder, then **Save**.

That's it — you now have a print-ready PDF version of the thesis with correctly numbered figures/tables,
page breaks between chapters, and all diagrams/charts baked in as static images.

### Tips for the best-looking PDF

- If a diagram or chart looks cut off, re-open the print dialog after the page has fully loaded (Mermaid and
  Chart.js need a moment to draw) and print again.
- If colours look washed out or headers/footers are missing, double-check that **Background graphics** is
  enabled in the print dialog's "More settings" section.
- If you want to review the document on-screen first, simply scroll through `THESIS.html` in the browser — the
  Table of Contents, List of Figures and List of Tables all use clickable anchor links.

## Notes on content accuracy

All technical details in the thesis (tech stack versions, database schema, roles, Flyway migrations, live
metrics, and screenshots) were taken directly from the project's own source code, database migrations,
`README.md`, `CREDENTIALS.md`, `DEPLOY.md`, and the seeded demonstration dataset captured in
`figures/metrics.json`, so the report accurately reflects the real, working system.

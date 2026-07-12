# KEREI / Digital Archive

Developer notes for the static personal archive interface.

## Overview

This project is a small static Digital Dossier UI built with:

- Vanilla HTML5
- Vanilla JavaScript
- Tailwind CSS via CDN
- Google Fonts: Inter and JetBrains Mono
- A flat local `data.json` file

There is no build step, package manager, backend, framework, routing layer, or database.

## Files

```text
index.html   Static page shell, Tailwind config, fonts, list layout, detail view markup
app.js       Data loading, filtering, metrics, list rendering, hash routing, detail view logic
data.json    Flat archive data template
```

## Local Run

Because `app.js` loads `data.json` with `fetch`, open the app through a local HTTP server instead of opening `index.html` directly from the filesystem.

```bash
python3 -m http.server 4174
```

Then open:

```text
http://127.0.0.1:4174/
```

Any static server works as long as it serves all three files from the same directory.

## Data Model

`data.json` is intentionally flat. Keep it as a top-level array of archive items.

```json
[
  {
    "id": "unique-entry-id",
    "date": "2026-07-12",
    "category": "IT",
    "tags": ["tag"],
    "title": "Entry title",
    "shortDescription": "Short card description.",
    "fullStory": "Long detail story.",
    "images": [],
    "links": {
      "source": "https://example.com"
    },
    "technologies": ["tool"]
  }
]
```

Required for rendering:

- `id`
- `date`
- `title`

The starter template uses empty strings. Empty template items are ignored by `app.js`, so the archive starts clean until real content is added.

## Categories

The filter row is defined in `app.js` through `FILTERS`.

Current category ids:

- `IT`
- `Шығармашылық`
- `Спорт`
- `Өмір`

For filtering to work, an item's `category` value must exactly match one of those ids. `all` is reserved for the "Барлығы" filter.

## Images

Each item accepts local or remote image paths:

```json
"images": ["assets/example.jpg"]
```

Images are intentionally shown only on the detail view. The main archive stays as a quiet achievement list, so entries without images still look complete. When `images` is empty, no image block is rendered.

## Links

`links` is an object where each key becomes a visible label and each value is the external URL:

```json
"links": {
  "github": "https://github.com/example/project",
  "demo": "https://example.com"
}
```

Empty `links` renders a quiet placeholder mark in the detail view.

## Design Constraints

Keep the product surface monolingual:

- UI text must stay in Kazakh.
- Do not add language switchers.
- Do not add nested language objects to `data.json`.
- Keep `data.json` flat and direct.

Visual direction:

- Minimal, monochrome, spacious.
- Prefer thin zinc borders and `#fafafa` backgrounds.
- Keep typography-led hierarchy.
- Use Inter for body text.
- Use JetBrains Mono for labels, dates, tags, and system-like text.

## Development Notes

- `renderMedia()` owns detail image rendering.
- `renderListItem()` owns archive list row markup.
- `handleRoute()` switches between the main list and `#entry/{id}` detail views.
- `renderDetailPage()` fills the detail view.
- `renderMetrics()` derives all metric numbers from loaded data.
- `isFilledItem()` prevents the empty template object from appearing as content.

There are no automated tests in this repository. Basic verification is:

```bash
node -e "JSON.parse(require('fs').readFileSync('data.json','utf8')); console.log('json ok')"
python3 -m http.server 4174
```

Then check the page in a browser and confirm:

- Filters render.
- Empty state renders when no filled entries exist.
- List rows render after adding a filled item.
- Empty `images` does not render an image block.
- Clicking a list row opens the `#entry/{id}` detail view.

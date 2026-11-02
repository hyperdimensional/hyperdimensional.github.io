# hyperdimensional.net: design rationale

## 1. Content audit

| Rank | Content | Job |
| --- | --- | --- |
| 1 | **hyperdimensional** and the mark | Identify |
| 1 | Lede: what the company does, in two sentences | Orient. It names both practices. |
| 2 | **Consulting**: how we work with organisations whose technology delivery has stalled | Persuade. It's the commercial practice. |
| 2 | **Projects**: the things we make, one line each | Show. It links out, with no framing sentence. |
| 3 | `© 2007–2026 Hyperdimensional Limited` | Copyright, from incorporation |
| 4 | Company number, jurisdiction, registered office | Legal: required on UK company websites, so shown on every page, smallest type |

Two practices of equal rank, so they sit side by side on wide screens and
stack on narrow ones, each opened by the same rule. The lede states both in
two sentences and doesn't invent a link between them.

Copy source: the profound.fyi bio, rewritten from one person's career into what
the company does. Past roles and employers are deliberately *not* claimed as
company credentials. The project summaries quote or paraphrase each project's
own description.

## 2. Systems

### Module, from the mark

The mark is a black disc with the glyph cut out of it. The glyph is drawn on a grid:
horizontally its parts measure 3 / 3 / 6 modules, 12 modules wide, and the original square
mark added 2 modules either side for **16 modules**. The disc is **18 modules** across
(216 units). That's the smallest whole number of modules that clears the glyph's corners
(97 units from its centre) with room to spare. The site uses that module as its spacing
unit, `--u`.

| Viewport | `--u` | Mark width (18u) | Page margin |
| --- | --- | --- | --- |
| < 40em | 6px | 108px | 3u |
| ≥ 40em | 8px | 144px | 6u |

Every gap is a multiple of `--u`:

| Gap | Size |
| --- | --- |
| Mark → name; hero → practices; between stacked practices | 12u |
| Name → lede | 4u |
| Column gutter | 6u |
| Section heading below its rule | 2u above, 3u below |
| Paragraphs | 2u |
| Work items | 2u padding |
| Footer | 16u above |
| Heavy rules | u/4 (2px at 8px) |

### Layout

A single left edge (the page margin) for everything. The name fills the full
measure. The practices form two equal columns from 64em, each capped at 34em
for comfortable line length. The empty space after the shorter column is left alone.

### Typography

| Role | Face | Size / leading |
| --- | --- | --- |
| Name | Neo-grotesque 700, −0.045em | Fills the measure: `(100vw − 2·margin) / 8.6`, max 12rem / 1 |
| Lede | Neo-grotesque 400, −0.01em | `clamp(1.375rem, 1rem + 1.5vw, 2.125rem)` / 1.25, max 24em |
| Body | Neo-grotesque 400 | 1.0625rem / 1.55 |
| Section headings | Neo-grotesque 700, −0.01em | 1.375rem / 1.25 |
| Footer | System monospace 400 | 0.875rem / 1.5 (legal lines 0.75rem) |

Neo-grotesque = Helvetica Neue → Helvetica → Arial → system. The heavy grotesk echoes
the mark's solid blocks. Monospace is kept for the footer: copyright and company details. System fonts only: no downloads, nothing for the CSP to allow.

### Colour

Monochrome, matching the mark.

| Token | Light | Dark | Contrast |
| --- | --- | --- | --- |
| `--bg` | #ffffff | #000000 | — |
| `--fg` | #000000 | #ffffff | 21:1 |
| `--muted` | #595959 | #a6a6a6 | 7.0:1 / 8.6:1 (AAA) |

`--muted` carries secondary text: project summaries, the profound.fyi aside,
footer labels. The mark uses `currentColor`, so dark mode inverts it with no
second asset.

### Motion

None. The original glitch effect has been removed.

## 3. Decisions

- **No "established" line.** The old `established 993914803` timestamp is gone.
  Dates now come from the company's incorporation (22 May 2007).
- **The work is alluded to, not showcased.** Each project is a name, one line and an
  outbound link, held in `src/_data/work.js`. If the work grows, it gets its own
  page; until then a list is honest about the scale.
- **Copyright is a range**, from the incorporation year to the build year, computed at
  build time. Plain years, not Roman numerals: they read at a glance.
- **No JavaScript.** The CSP forbids scripts outright.
- **The mark is a circle.** The glyph is unchanged from the original artwork, and
  its pixels match it exactly. Only its container changed: the 192×178 square
  became a 216-unit disc, with the glyph centred inside it. The glyph's thinner
  horizontal bars (31 units, not 36) are kept as drawn.

## 4. Assets

The share image (`og-image.png`, 1200×630) is a screenshot of the top of the built home page.
The touch icon (`apple-touch-icon.png`, 180×180) is the disc on white, 148px across;
iOS rounds the corners itself. `favicon.ico` (16/32/48px) is rendered from `logo.svg`.
Regenerate all three after design changes.

`favicon.svg` is built from `logo.svg`'s path data (`src/favicon.svg.njk`), so it never
drifts. It's black, and white under `prefers-color-scheme: dark`. In a browser tab
`currentColor` resolves to black, which made the disc vanish on dark tab bars.

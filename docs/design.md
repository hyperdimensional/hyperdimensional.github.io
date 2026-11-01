# hyperdimensional.net: design rationale

## 1. Content audit

The site has four facts, and the design shouldn't pretend there are more.

| Rank | Content | Job |
| --- | --- | --- |
| 1 | **hyperdimensional**, the name | Identify |
| 1 | The mark | Identify (visual) |
| 2 | `established 993914803` | Provenance, as a Unix timestamp (2001-06-30T15:26:43Z), shown undecoded on purpose |
| 3 | `© MMI–MMXXVI` | Legal and house style (Roman numerals, carried over from the original `© MMXX`) |

Purpose: identification. Density: as low as it gets. So the design leans on scale,
position and space rather than on decoration.

## 2. Systems

### Module, from the mark

The mark is drawn on a grid. Horizontally its parts measure 24 / 36 / 36 / 72 / 24 px
in the source artwork: 2 / 3 / 3 / 6 / 2 modules of 12 px, **16 modules** in total.

The site uses that same module as its spacing unit, `--u`:

| Viewport | `--u` | Mark width (16u) | Page margin |
| --- | --- | --- | --- |
| < 40em | 6px | 96px | 3u = 18px |
| ≥ 40em | 8px | 128px | 6u = 48px |

Every gap in the stylesheet is a multiple of `--u`: section gap 4u, name-to-provenance 3u,
footer padding 2u, footer rule u/4. So the mark's proportions and the page's are the same.

### Layout

A three-row grid filling the viewport (`100dvh`): mark at the top, name and provenance
at the bottom, footer under a rule. The empty middle is deliberate. It is the
largest element on the page and gives the name its weight. Everything aligns to one
left edge, the page margin.

### Typography

| Role | Face | Size | Why |
| --- | --- | --- | --- |
| Name | Neo-grotesque (Helvetica Neue → Helvetica → Arial), 700, −0.045em tracking | Fills the measure: `(100vw − 2·margin) / 8.6`, max 12rem | A heavy, neutral grotesk echoes the mark's solid black blocks; filling the width makes the name the page's horizon line |
| Everything else | System monospace, 400, 0.875rem/1.5 | — | The timestamp is machine data; mono says so, and gives tabular digits |

Two sizes, no more. System fonts only: no font downloads, nothing for the CSP to allow,
and nothing to slow the first paint.

### Colour

Monochrome, matching the mark.

| Token | Light | Dark | Contrast |
| --- | --- | --- | --- |
| `--bg` | #ffffff | #000000 | — |
| `--fg` | #000000 | #ffffff | 21:1 |
| `--muted` | #595959 | #a6a6a6 | 7.0:1 / 8.6:1 (AAA) |
| `--glitch-a` | #e60000 | #ff4d4d | Decorative only |
| `--glitch-b` | #0033ff | #4d79ff | Decorative only |

The mark uses `currentColor`, so dark mode inverts it (white field, black glyph) with
no second asset. The red and blue are the original site's glitch fringes, and they never carry
meaning.

### Motion

The glitch on the name is kept from the original site: two offset copies sliced by
animated `clip-path`. It is switched off for `prefers-reduced-motion: reduce` and
`forced-colors: active`. The copies use `content: … / ""` so they stay out of the
accessible name, and `white-space: nowrap` so multi-word headings don't wrap.

## 3. Decisions

- **The timestamp stays a timestamp.** Decoding it into a date on screen would explain
  the joke away. It is marked up as `<time datetime="2001-06-30T15:26:43Z">`, so machines
  get the date and people get the puzzle.
- **Copyright is a range.** `MMI–MMXXVI` runs from the established year to the build year,
  computed at build time, instead of the stale `MMXX`.
- **No JavaScript.** Nothing on the page needs it. The CSP forbids scripts outright.
- **The mark is inlined, not linked.** That gives one fewer request, lets the colour follow
  the theme, and keeps a single source: the `logo` shortcode reads `src/assets/logo.svg`.
- **The mark's proportions are kept as drawn.** The source artwork is 192×178, not square:
  the horizontal bars are 31 px thick, not 36. If that's an export artefact rather than
  intent, squaring it is a one-line change to the `viewBox` and path.

## 4. Specification

```css
--u: 6px | 8px (≥40em)
--margin: 3u | 6u
mark: width 16u
gap (sections): 4u
gap (name → provenance): 3u
footer: padding-top 2u, rule u/4
name: 700, line-height 1, tracking -0.045em, min(12rem, (100vw - 2·margin)/8.6)
body: 400 0.875rem/1.5 monospace
```

Share image (`og-image.png`, 1200×630) and touch icon (`apple-touch-icon.png`, 180×180)
are rendered from the built site and the mark. Regenerate them after design changes.

/**
 * Draw every article's hero and card, in HTML and CSS, and screenshot them.
 *
 * ════════════════════════════════════════════════════════════════════════════════════════════════
 * THE OUTPUT IS COMMITTED. THIS SCRIPT IS NOT PART OF THE BUILD.
 *
 * `package.json` says it in one line and here is the reason: this drives a real browser, and a build
 * that downloads a browser is a build that fails on the day the download does. CI stays hermetic,
 * the Dockerfile installs nothing, and the images in `public/articles/` are reviewed in a pull
 * request like any other change — which is what you want for the picture a stranger sees attached to
 * an article in a chat app.
 *
 * `test/assets.test.ts` asserts every article names files that exist and that each card is exactly
 * 1200×630. That is the check that catches an article added without running this.
 * ════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * ── WHY THE ART IS DRAWN RATHER THAN PHOTOGRAPHED ────────────────────────────────────────────────
 *
 * A crypto publication illustrated with stock photography of glowing coins and men in suits looking
 * at candlestick charts is announcing, above the headline, that it is the same as everything else.
 * The subject this desk actually works in is record-keeping: ledgers, rules, entries, cadence, the
 * things a forge and a filing system have in common. So each piece is a printer's device built from
 * the materials of that world — hairlines, ruled paper, one hot mass of bronze — and each says
 * something specific about the article it sits on rather than being decoration in a house style.
 *
 * The bronze is `#ae7b3d`, this surface's registry accent, and the six bars in "A tour of
 * CloudsForge" are the six product accents from `tokens.css`, read off rather than invented.
 *
 * ── HERO AND CARD ARE COMPOSED DIFFERENTLY, ON PURPOSE ───────────────────────────────────────────
 *
 * The HERO carries no words. It sits directly under the headline on the page, and repeating the
 * headline inside the picture underneath it is the kind of redundancy that reads as a template.
 *
 * The CARD is the whole article as far as a chat app is concerned — nobody sees the page around it —
 * so it carries the headline, the topic and the publication, with the artwork as a panel on the
 * right that bleeds off the edge. 1200×630 because that is what every preview fetcher crops to.
 *
 * ── LITERAL COLOURS ARE CORRECT HERE ─────────────────────────────────────────────────────────────
 *
 * `test/tokens.test.ts` forbids a literal colour in `src/styles.css`, and rightly: that stylesheet
 * runs inside a page whose palette the token layer owns and whose scheme the reader chooses. This
 * file emits a standalone document that exists for one thousandth of a second inside a headless
 * browser and is then a PNG. There is no token layer in it, no scheme to follow, and no reader.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'
import { ARTICLES } from '../src/content/index.ts'
import { tagBySlug } from '../src/content/tags.ts'
import type { Article } from '../src/content/types.ts'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const fonts = join(root, 'node_modules', '@cloudsforge', 'ui', 'src', 'fonts')

const HERO = { width: 1600, height: 900 }
const CARD = { width: 1200, height: 630 }

/** The ink, the rules and the one hot colour. */
const INK = '#0d1116'
const INK_DEEP = '#070a0d'
const RULE = '#233039'
const RULE_FAINT = '#161d24'
const BRONZE = '#ae7b3d'
const BRONZE_HOT = '#e2a85f'
const TEXT = '#ccd6de'
const MUTED = '#79868f'

/** The six product accents, from `ui/packages/ui/src/tokens.css`. Order is the switcher's. */
const PRODUCTS: readonly { name: string; accent: string }[] = [
  { name: 'Foresight', accent: '#1e89c7' },
  { name: 'Network', accent: '#d6412f' },
  { name: 'Trade', accent: '#2a9e93' },
  { name: 'Create', accent: '#b28e1e' },
  { name: 'Market', accent: '#9b7bf0' },
  { name: 'Worlds', accent: '#6d9a49' },
]

/**
 * One stroke of a polyline, as a rotated 1px div.
 *
 * A line that bends is the one shape CSS boxes cannot make directly. The geometry is computed here,
 * in TypeScript, and emitted as absolutely positioned segments — so the drawing is deterministic and
 * reviewable rather than a blob of path data nobody reads.
 */
function stroke(
  from: readonly [number, number],
  to: readonly [number, number],
  colour: string,
  weight: number,
): string {
  const dx = to[0] - from[0]
  const dy = to[1] - from[1]
  const length = Math.sqrt(dx * dx + dy * dy)
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI
  return (
    `<i style="position:absolute;left:${from[0]}px;top:${from[1] - weight / 2}px;` +
    `width:${length}px;height:${weight}px;background:${colour};` +
    `transform-origin:0 50%;transform:rotate(${angle}deg);border-radius:${weight}px"></i>`
  )
}

function polyline(points: readonly (readonly [number, number])[], colour: string, weight: number) {
  return points
    .slice(1)
    .map((point, index) => stroke(points[index] as [number, number], point, colour, weight))
    .join('')
}

/**
 * ART 1 — "the ledger that never ends", for *Crypto, explained without the crypto words*.
 *
 * The article's whole argument is that the technology is a shared list of who paid whom, so the
 * picture is that list: ruled entries running off the right edge of the paper, one of them lit.
 */
function ledger(w: number, h: number): string {
  const rows = 11
  const top = h * 0.13
  const gap = (h * 0.74) / rows
  const parts: string[] = []
  for (let i = 0; i < rows; i += 1) {
    const y = top + i * gap
    const hot = i === 4
    parts.push(
      `<i style="position:absolute;left:${w * 0.08}px;top:${y}px;width:${w * 0.98}px;height:1px;background:${hot ? BRONZE : RULE}"></i>`,
    )
    // The date column, then two entry blocks per row, at widths that vary like real entries do.
    parts.push(
      `<i style="position:absolute;left:${w * 0.09}px;top:${y - gap * 0.42}px;width:${gap * 1.5}px;height:${gap * 0.16}px;background:${hot ? BRONZE_HOT : RULE}"></i>`,
    )
    const a = w * (0.22 + ((i * 7) % 5) * 0.012)
    parts.push(
      `<i style="position:absolute;left:${w * 0.2}px;top:${y - gap * 0.42}px;width:${a - w * 0.2}px;height:${gap * 0.16}px;background:${hot ? BRONZE : RULE_FAINT};opacity:${hot ? 1 : 0.9}"></i>`,
    )
    parts.push(
      `<i style="position:absolute;left:${w * 0.46}px;top:${y - gap * 0.42}px;width:${w * (0.2 + ((i * 3) % 4) * 0.05)}px;height:${gap * 0.16}px;background:${hot ? BRONZE : RULE_FAINT}"></i>`,
    )
  }
  // The lit entry's glow, and the vertical rule that makes it a ledger rather than a list.
  parts.push(
    `<i style="position:absolute;left:${w * 0.08}px;top:${top + 4 * gap - gap * 0.6}px;width:${w * 0.7}px;height:${gap * 0.9}px;background:radial-gradient(ellipse at 30% 50%, rgba(174,123,61,0.26), transparent 70%)"></i>`,
  )
  parts.push(
    `<i style="position:absolute;left:${w * 0.185}px;top:${top - gap * 0.5}px;width:1px;height:${gap * rows}px;background:${RULE}"></i>`,
  )
  return parts.join('')
}

/**
 * ART 2 — "the cadence", for *Why we built our own chain*.
 *
 * Twelve seconds, every twelve seconds, whether anyone is watching. The picture is the regularity:
 * identical marks at identical spacing, with the sparks above them getting brighter as the chain
 * warms up. If it looks monotonous, it is drawing the right thing.
 */
function cadence(w: number, h: number): string {
  const count = 13
  const base = h * 0.66
  const left = w * 0.09
  const step = (w * 0.82) / (count - 1)
  const parts: string[] = [
    `<i style="position:absolute;left:${left}px;top:${base}px;width:${w * 0.85}px;height:1px;background:${RULE}"></i>`,
  ]
  for (let i = 0; i < count; i += 1) {
    const x = left + i * step
    const heat = 0.28 + (i / (count - 1)) * 0.72
    const size = h * 0.055
    parts.push(
      `<i style="position:absolute;left:${x - size / 2}px;top:${base - size}px;width:${size}px;height:${size}px;background:${BRONZE};opacity:${heat.toFixed(2)}"></i>`,
    )
    // The spark: a thin tick above each block, its height set by a fixed pattern rather than random,
    // so two runs of this script produce identical bytes.
    const tick = h * (0.06 + ((i * 5) % 7) * 0.022)
    parts.push(
      `<i style="position:absolute;left:${x - 1}px;top:${base - size - tick}px;width:2px;height:${tick}px;background:linear-gradient(to top, ${BRONZE_HOT}, transparent);opacity:${(heat * 0.9).toFixed(2)}"></i>`,
    )
  }
  parts.push(
    `<i style="position:absolute;left:${left}px;top:${base - h * 0.02}px;width:${w * 0.85}px;height:${h * 0.09}px;background:linear-gradient(to top, rgba(174,123,61,0.22), transparent)"></i>`,
  )
  return parts.join('')
}

/**
 * ART 3 — "six tools, one bench", for *A tour of CloudsForge*.
 *
 * Six products, six colours the estate already owns, standing on one surface. The bench is the
 * account: the piece is about the thing they share, so the rule under them is the only bronze in it.
 */
function bench(w: number, h: number): string {
  const base = h * 0.74
  const left = w * 0.12
  const span = w * 0.76
  const step = span / PRODUCTS.length
  const parts: string[] = [
    `<i style="position:absolute;left:${left - w * 0.03}px;top:${base}px;width:${span + w * 0.06}px;height:3px;background:${BRONZE}"></i>`,
    `<i style="position:absolute;left:${left - w * 0.03}px;top:${base + 3}px;width:${span + w * 0.06}px;height:${h * 0.05}px;background:linear-gradient(to bottom, rgba(174,123,61,0.18), transparent)"></i>`,
  ]
  const heights = [0.4, 0.52, 0.33, 0.47, 0.29, 0.44]
  PRODUCTS.forEach((product, i) => {
    const x = left + i * step + step * 0.5
    const tall = h * (heights[i] ?? 0.4)
    const width = w * 0.018
    parts.push(
      `<i style="position:absolute;left:${x - width / 2}px;top:${base - tall}px;width:${width}px;height:${tall}px;background:${product.accent};opacity:0.92"></i>`,
    )
    // The head of the tool: a square, twice the shaft's width, sitting on top of it.
    parts.push(
      `<i style="position:absolute;left:${x - width}px;top:${base - tall - width * 2}px;width:${width * 2}px;height:${width * 2}px;background:${product.accent}"></i>`,
    )
    parts.push(
      `<i style="position:absolute;left:${x - width * 2}px;top:${base - tall - width * 2}px;width:${width * 4}px;height:${tall}px;background:radial-gradient(ellipse at 50% 0%, ${product.accent}33, transparent 70%)"></i>`,
    )
    /*
     * The name, under the rule, in the tool's own colour.
     *
     * Six coloured shapes on a bench is a picture of six things; six coloured shapes with FORESIGHT,
     * NETWORK, TRADE under them is a picture of this estate, which is what the piece is about. It is
     * also what fills the lower third — the version without them had the bench floating above dead
     * space. In the card the panel is cropped, so some names run off the edge and read as texture;
     * that is the same choice the ledger makes with its entries.
     */
    parts.push(
      `<span style="position:absolute;left:${x - step / 2}px;top:${base + h * 0.055}px;width:${step}px;` +
        `font-family:'CF Mono',monospace;font-size:${w * 0.0115}px;letter-spacing:0.18em;` +
        `text-transform:uppercase;text-align:center;color:${product.accent};opacity:0.78">${product.name}</span>`,
    )
  })
  return parts.join('')
}

/**
 * ART 4 — "the line that settles", for *The healthy way to hold crypto*.
 *
 * The article is about what watching a price does to a person, so the picture is the watching: a
 * trace that thrashes, and then stops, and the dot at the end is at rest. Deliberately NOT a
 * candlestick chart — the point is the reader's pulse, not the market's.
 */
function settle(w: number, h: number): string {
  const mid = h * 0.5
  const start = w * 0.08
  const jagEnd = w * 0.56
  const points: [number, number][] = [[start, mid]]
  const swings = [0.34, -0.3, 0.26, -0.38, 0.31, -0.22, 0.18, -0.14, 0.09, -0.05, 0.02]
  swings.forEach((swing, i) => {
    const x = start + ((jagEnd - start) / swings.length) * (i + 1)
    points.push([x, mid + h * swing * 0.5])
  })
  points.push([w * 0.92, mid])
  return [
    `<i style="position:absolute;left:${start}px;top:${mid}px;width:${w * 0.84}px;height:1px;background:${RULE_FAINT}"></i>`,
    polyline(points, BRONZE, 3),
    `<i style="position:absolute;left:${w * 0.9}px;top:${mid - h * 0.03}px;width:${h * 0.06}px;height:${h * 0.06}px;border-radius:50%;background:${BRONZE_HOT}"></i>`,
    `<i style="position:absolute;left:${w * 0.82}px;top:${mid - h * 0.11}px;width:${h * 0.22}px;height:${h * 0.22}px;border-radius:50%;background:radial-gradient(circle, rgba(226,168,95,0.3), transparent 70%)"></i>`,
  ].join('')
}

/**
 * ART 5 — "nine doors, one ajar", for *Nine ways people lose crypto*.
 *
 * Nine ways, eight of them shut. The one left open is the whole article: nothing was broken into,
 * something was left open. The wedge is light falling out of it, not into it.
 */
function doors(w: number, h: number): string {
  const cols = 3
  const rows = 3
  const dw = w * 0.115
  const dh = h * 0.235
  const gapX = w * 0.075
  const gapY = h * 0.075
  const totalW = cols * dw + (cols - 1) * gapX
  const totalH = rows * dh + (rows - 1) * gapY
  const left = (w - totalW) / 2
  const top = (h - totalH) / 2
  const parts: string[] = []
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const x = left + c * (dw + gapX)
      const y = top + r * (dh + gapY)
      const open = r === 1 && c === 1
      parts.push(
        `<i style="position:absolute;left:${x}px;top:${y}px;width:${dw}px;height:${dh}px;border:2px solid ${open ? BRONZE : RULE};box-sizing:border-box"></i>`,
      )
      if (open) {
        // The door swung inward, plus the light on the floor in front of it.
        parts.push(
          `<i style="position:absolute;left:${x}px;top:${y}px;width:${dw}px;height:${dh}px;background:linear-gradient(105deg, ${BRONZE_HOT} 0%, rgba(226,168,95,0.35) 38%, transparent 62%)"></i>`,
        )
        parts.push(
          `<i style="position:absolute;left:${x - dw * 0.5}px;top:${y + dh}px;width:${dw * 2}px;height:${dh * 0.42}px;background:linear-gradient(to bottom, rgba(226,168,95,0.28), transparent);clip-path:polygon(38% 0%, 62% 0%, 100% 100%, 0% 100%)"></i>`,
        )
      } else {
        parts.push(
          `<i style="position:absolute;left:${x + dw * 0.78}px;top:${y + dh * 0.5}px;width:${dw * 0.06}px;height:${dw * 0.06}px;border-radius:50%;background:${RULE}"></i>`,
        )
      }
    }
  }
  return parts.join('')
}

/**
 * ART 6 — "the staircase", for *The difficulty adjustment is not a safety net*.
 *
 * Blocks keep arriving at the same spacing along the top rule: that is the thing the retarget
 * protects, and it never wavers. Underneath, the number that bought it steps down and carries on
 * stepping. The two halves of the picture are the argument — the cadence held while the price of
 * holding it fell.
 */
function retarget(w: number, h: number): string {
  const count = 17
  const rail = h * 0.3
  const left = w * 0.07
  const step = (w * 0.86) / (count - 1)
  const size = h * 0.034
  const parts: string[] = [
    `<i style="position:absolute;left:${left}px;top:${rail}px;width:${w * 0.9}px;height:1px;background:${RULE}"></i>`,
  ]
  for (let i = 0; i < count; i += 1) {
    const x = left + i * step
    parts.push(
      `<i style="position:absolute;left:${x - size / 2}px;top:${rail - size}px;width:${size}px;height:${size}px;background:${RULE};opacity:0.95"></i>`,
    )
  }
  // Four flats, three drops, and the last flat running off the right edge rather than stopping.
  const xs = [0.05, 0.29, 0.5, 0.71, 1.05]
  const ys = [0.5, 0.6, 0.68, 0.74]
  const points: [number, number][] = [[w * (xs[0] as number), h * (ys[0] as number)]]
  ys.forEach((y, i) => {
    points.push([w * (xs[i + 1] as number), h * y])
    const next = ys[i + 1]
    if (next !== undefined) points.push([w * (xs[i + 1] as number), h * next])
    // A shadow under each flat rather than one rectangle under the lot, so the top of the glow
    // follows the line down instead of cutting a hard horizontal edge across the picture.
    parts.push(
      `<i style="position:absolute;left:${w * (xs[i] as number)}px;top:${h * y}px;width:${w * ((xs[i + 1] as number) - (xs[i] as number))}px;height:${h * 0.14}px;background:linear-gradient(to bottom, rgba(174,123,61,0.18), transparent)"></i>`,
    )
  })
  parts.push(polyline(points, BRONZE, 5))
  return parts.join('')
}

/**
 * ART 7 — "the branch that stopped", for *Two blocks in eight hours*.
 *
 * The fork did exactly what it said it would: it produced a chain. Then it produced two blocks in
 * eight hours and went quiet. The upper branch keeps the spacing it always had; the lower one has
 * two marks and then nothing, and the nothing is drawn as fading ticks so the eye follows it out.
 */
function fork(w: number, h: number): string {
  const size = h * 0.062
  const mid = h * 0.5
  const left = w * 0.1
  const step = w * 0.07
  const split = 4
  const parts: string[] = []
  const mark = (x: number, y: number, colour: string, opacity: number): string =>
    `<i style="position:absolute;left:${x - size / 2}px;top:${y - size / 2}px;width:${size}px;height:${size}px;background:${colour};opacity:${opacity}"></i>`

  // The shared history, on one rule.
  for (let i = 0; i <= split; i += 1) {
    const x = left + i * step
    if (i > 0) parts.push(stroke([x - step, mid], [x, mid], RULE, 2))
    parts.push(mark(x, mid, RULE, 0.95))
  }

  const junction = left + split * step
  const rise = h * 0.17
  // The branch that kept going.
  parts.push(stroke([junction, mid], [junction + step, mid - rise], BRONZE, 2))
  for (let i = 1; i <= 7; i += 1) {
    const x = junction + i * step
    if (i > 1) parts.push(stroke([x - step, mid - rise], [x, mid - rise], BRONZE, 2))
    parts.push(mark(x, mid - rise, BRONZE, 0.9))
  }

  // The branch that made two and stalled.
  parts.push(stroke([junction, mid], [junction + step, mid + rise], RULE, 2))
  parts.push(mark(junction + step, mid + rise, MUTED, 0.75))
  parts.push(stroke([junction + step, mid + rise], [junction + step * 2, mid + rise], RULE, 2))
  parts.push(mark(junction + step * 2, mid + rise, MUTED, 0.4))
  for (let i = 0; i < 5; i += 1) {
    const x = junction + step * 2.6 + i * (step * 0.55)
    parts.push(
      `<i style="position:absolute;left:${x}px;top:${mid + rise - 1}px;width:${step * 0.22}px;height:2px;background:${RULE};opacity:${(0.55 - i * 0.11).toFixed(2)}"></i>`,
    )
  }
  parts.push(
    `<i style="position:absolute;left:${junction - step}px;top:${mid - rise - size}px;width:${step * 9}px;height:${size * 2.4}px;background:radial-gradient(ellipse at 30% 50%, rgba(174,123,61,0.2), transparent 72%)"></i>`,
  )
  return parts.join('')
}

/**
 * ART 8 — "the key was already out", for *A tenth way to lose crypto*.
 *
 * The device is sealed, the keyhole is intact, nothing has been forced. The key is lying outside it,
 * on the far side of the case, because it left in the factory — which is the piece's whole point and
 * the reason none of the reader's habits would have caught it.
 */
function keyhole(w: number, h: number): string {
  const caseW = w * 0.84
  const caseH = h * 0.56
  const caseX = (w - caseW) / 2
  const caseY = (h - caseH) / 2
  const dw = caseW * 0.34
  const dh = caseH * 0.72
  const dx = caseX + caseW * 0.08
  const dy = caseY + (caseH - dh) / 2
  const bore = dw * 0.12
  const cx = dx + dw / 2
  const cy = dy + dh * 0.44
  const parts: string[] = [
    `<i style="position:absolute;left:${caseX}px;top:${caseY}px;width:${caseW}px;height:${caseH}px;border:1px solid ${RULE};box-sizing:border-box"></i>`,
    `<i style="position:absolute;left:${caseX + caseW * 0.46}px;top:${caseY}px;width:1px;height:${caseH}px;background:${RULE_FAINT}"></i>`,
    // The device: sealed, no seam, one dark face.
    `<i style="position:absolute;left:${dx}px;top:${dy}px;width:${dw}px;height:${dh}px;border:2px solid ${BRONZE};background:${INK_DEEP};box-sizing:border-box;border-radius:${dw * 0.08}px"></i>`,
    `<i style="position:absolute;left:${dx + dw * 0.18}px;top:${dy + dh * 0.12}px;width:${dw * 0.64}px;height:2px;background:${RULE}"></i>`,
    // The keyhole: a bore and the slot beneath it. Drawn in the light grey rather than in the ink,
    // because a hole cut into a face this dark is invisible unless something is behind it.
    `<i style="position:absolute;left:${cx - bore}px;top:${cy - bore}px;width:${bore * 2}px;height:${bore * 2}px;border-radius:50%;background:${MUTED}"></i>`,
    `<i style="position:absolute;left:${cx - bore * 0.55}px;top:${cy}px;width:${bore * 1.1}px;height:${dh * 0.3}px;background:${MUTED};clip-path:polygon(32% 0%, 68% 0%, 100% 100%, 0% 100%)"></i>`,
  ]
  // The key, lying flat on the far side of the case: a bow, a shaft, two teeth.
  const kx = caseX + caseW * 0.6
  const ky = caseY + caseH * 0.5
  const bow = h * 0.055
  const shaft = caseW * 0.28
  parts.push(
    `<i style="position:absolute;left:${kx}px;top:${ky - bow}px;width:${bow * 2}px;height:${bow * 2}px;border-radius:50%;border:${bow * 0.42}px solid ${BRONZE_HOT};box-sizing:border-box"></i>`,
  )
  parts.push(stroke([kx + bow * 2, ky], [kx + bow * 2 + shaft, ky], BRONZE_HOT, bow * 0.34))
  parts.push(
    `<i style="position:absolute;left:${kx + bow * 2 + shaft * 0.72}px;top:${ky}px;width:${bow * 0.3}px;height:${bow * 0.7}px;background:${BRONZE_HOT}"></i>`,
  )
  parts.push(
    `<i style="position:absolute;left:${kx + bow * 2 + shaft * 0.88}px;top:${ky}px;width:${bow * 0.3}px;height:${bow * 1.05}px;background:${BRONZE_HOT}"></i>`,
  )
  parts.push(
    `<i style="position:absolute;left:${kx - bow}px;top:${ky - bow * 2.4}px;width:${shaft + bow * 4}px;height:${bow * 4.8}px;background:radial-gradient(ellipse at 40% 50%, rgba(226,168,95,0.18), transparent 70%)"></i>`,
  )
  return parts.join('')
}

/**
 * ART 9 — "the premium", for *The premium was the product*.
 *
 * One column in two parts: the coins at the bottom, which have not moved, and the bronze above them,
 * which is what the market used to pay on top and is on its way down to meet them. The ghost rules
 * are where the top of the bronze stood at each earlier mark.
 */
function premium(w: number, h: number): string {
  const base = h * 0.82
  const barW = w * 0.16
  const x = w * 0.5 - barW / 2
  const assetH = h * 0.2
  const premiumH = h * 0.3
  const wasTop = h * 0.16
  const top = base - assetH - premiumH
  const parts: string[] = [
    `<i style="position:absolute;left:${w * 0.16}px;top:${base}px;width:${w * 0.68}px;height:1px;background:${RULE}"></i>`,
    // The shorter bar underneath: the coins, which have not moved.
    `<i style="position:absolute;left:${x}px;top:${base - assetH}px;width:${barW}px;height:${assetH}px;background:${RULE};opacity:0.95"></i>`,
    // The taller bar on top: what the market paid over them, on its way down to meet them.
    `<i style="position:absolute;left:${x}px;top:${top}px;width:${barW}px;height:${premiumH}px;background:linear-gradient(to top, ${BRONZE}, ${BRONZE_HOT})"></i>`,
    `<i style="position:absolute;left:${x}px;top:${base - assetH}px;width:${barW}px;height:2px;background:${INK}"></i>`,
    // Where the top of it stood before.
    `<i style="position:absolute;left:${x}px;top:${wasTop}px;width:${barW}px;height:${top - wasTop}px;border:1px dashed ${RULE};border-bottom:none;box-sizing:border-box"></i>`,
  ]
  const ghosts = [0.29, 0.25, 0.21, 0.17]
  ghosts.forEach((level, i) => {
    parts.push(
      `<i style="position:absolute;left:${x - w * 0.035}px;top:${h * level}px;width:${barW + w * 0.07}px;height:1px;background:${BRONZE};opacity:${(0.45 - i * 0.09).toFixed(2)}"></i>`,
    )
  })
  parts.push(
    `<i style="position:absolute;left:${x - w * 0.04}px;top:${top - h * 0.03}px;width:${barW + w * 0.08}px;height:${premiumH + h * 0.06}px;background:radial-gradient(ellipse at 50% 60%, rgba(226,168,95,0.16), transparent 72%)"></i>`,
  )
  return parts.join('')
}

/**
 * ART 10 — "less money, going round faster", for *The stablecoin float is the wrong number*.
 *
 * The stack on the left is the figure everybody quotes, and it is getting shorter. The loop on the
 * right is the figure nobody quotes, and it is the same dollar coming past again. Drawn as one arc
 * overlapping itself rather than a circle, because the point is the repetition.
 */
function circulation(w: number, h: number): string {
  const parts: string[] = []
  const coinW = w * 0.18
  const coinH = h * 0.062
  const cx = w * 0.26
  const floor = h * 0.72
  const pitch = coinH * 0.74
  // Four coins still there, and three outlines above them where the stack used to reach.
  for (let i = 0; i < 7; i += 1) {
    const y = floor - (i + 1) * pitch
    const gone = i >= 4
    parts.push(
      `<i style="position:absolute;left:${cx - coinW / 2}px;top:${y}px;width:${coinW}px;height:${coinH}px;` +
        `border-radius:50%;border:${gone ? `1px dashed ${RULE}` : `2px solid ${MUTED}`};box-sizing:border-box;` +
        `background:${gone ? 'transparent' : INK_DEEP};opacity:${gone ? (0.5 - (i - 4) * 0.13).toFixed(2) : '1'}"></i>`,
    )
  }
  parts.push(
    `<i style="position:absolute;left:${cx - coinW * 0.8}px;top:${floor}px;width:${coinW * 1.6}px;height:1px;background:${RULE}"></i>`,
  )
  // The loop: four passes of one wide arc, each turned a little, so it reads as a line coming back
  // past the same point rather than as a circle somebody drew.
  const lx = w * 0.66
  const ly = h * 0.48
  const loopW = w * 0.36
  const loopH = h * 0.34
  for (let i = 0; i < 4; i += 1) {
    parts.push(
      `<i style="position:absolute;left:${lx - loopW / 2}px;top:${ly - loopH / 2}px;width:${loopW}px;height:${loopH}px;` +
        `border-radius:50%;border:3px solid ${i === 0 ? BRONZE_HOT : BRONZE};box-sizing:border-box;` +
        `opacity:${(0.9 - i * 0.16).toFixed(2)};transform:rotate(${i * 9 - 5}deg)"></i>`,
    )
  }
  parts.push(
    `<i style="position:absolute;left:${lx - loopW * 0.75}px;top:${ly - loopH * 0.95}px;width:${loopW * 1.5}px;height:${loopH * 1.9}px;background:radial-gradient(ellipse at 50% 50%, rgba(174,123,61,0.16), transparent 68%)"></i>`,
  )
  return parts.join('')
}

const ART: Record<string, (w: number, h: number) => string> = {
  'crypto-without-the-crypto-words': ledger,
  'why-we-built-our-own-chain': cadence,
  'a-tour-of-cloudsforge': bench,
  'the-healthy-way-to-hold-crypto': settle,
  'nine-ways-people-lose-crypto': doors,
  'the-difficulty-adjustment-is-not-a-safety-net': retarget,
  'two-blocks-in-eight-hours': fork,
  'a-tenth-way-to-lose-crypto': keyhole,
  'the-premium-was-the-product': premium,
  'the-stablecoin-float-is-the-wrong-number': circulation,
}

/** The faces the estate already ships, loaded off disk so the PNG is set in the estate's type. */
function faces(): string {
  const face = (family: string, file: string, weight: string): string =>
    `@font-face{font-family:'${family}';src:url('file://${join(fonts, file)}') format('woff2');font-weight:${weight};font-display:block}`
  return [
    face('CF Display', 'bricolage-grotesque-latin.woff2', '200 800'),
    face('CF Sans', 'archivo-latin.woff2', '100 900'),
    face('CF Mono', 'spline-sans-mono-latin.woff2', '300 700'),
  ].join('')
}

function frame(w: number, h: number, inner: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
${faces()}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${w}px;height:${h}px;overflow:hidden}
body{background:${INK};font-family:'CF Sans',system-ui,sans-serif;color:${TEXT};-webkit-font-smoothing:antialiased}
.sheet{position:relative;width:${w}px;height:${h}px;overflow:hidden;
  background:
    radial-gradient(ellipse at 22% 12%, rgba(174,123,61,0.10), transparent 58%),
    linear-gradient(160deg, ${INK} 0%, ${INK_DEEP} 100%);}
/* The drafting grid. Faint enough to be a texture and not a pattern you can count. */
.grid{position:absolute;inset:0;opacity:0.5;
  background-image:linear-gradient(${RULE_FAINT} 1px, transparent 1px),linear-gradient(90deg, ${RULE_FAINT} 1px, transparent 1px);
  background-size:${Math.round(w / 24)}px ${Math.round(w / 24)}px;
  -webkit-mask-image:radial-gradient(ellipse at 50% 50%, #000 30%, transparent 78%)}
.art{position:absolute;inset:0}
</style></head><body>${inner}</body></html>`
}

function heroHtml(article: Article): string {
  const draw = ART[article.slug]
  if (!draw) throw new Error(`no artwork registered for ${article.slug}`)
  const { width: w, height: h } = HERO
  return frame(
    w,
    h,
    `<div class="sheet"><div class="grid"></div><div class="art">${draw(w, h)}</div>
      <i style="position:absolute;left:${w * 0.05}px;top:${h * 0.05}px;right:${w * 0.05}px;bottom:${h * 0.05}px;border:1px solid rgba(174,123,61,0.25)"></i>
    </div>`,
  )
}

function cardHtml(article: Article): string {
  const draw = ART[article.slug]
  if (!draw) throw new Error(`no artwork registered for ${article.slug}`)
  const { width: w, height: h } = CARD
  const panel = Math.round(w * 0.4)
  const topic = tagBySlug(article.tags[0] ?? '')?.name ?? 'Forge Journal'
  const size = article.title.length > 52 ? 52 : article.title.length > 38 ? 60 : 68
  return frame(
    w,
    h,
    `<div class="sheet">
      <div class="grid"></div>
      <div style="position:absolute;right:0;top:0;width:${panel}px;height:${h}px;overflow:hidden;border-left:1px solid rgba(174,123,61,0.3)">
        <div class="art" style="left:${-panel * 0.35}px;width:${panel * 1.6}px">${draw(panel * 1.6, h)}</div>
      </div>
      <div style="position:absolute;left:64px;top:60px;width:${w - panel - 120}px;height:${h - 120}px;display:flex;flex-direction:column;justify-content:space-between">
        <p style="font-family:'CF Mono',monospace;font-size:19px;letter-spacing:0.16em;text-transform:uppercase;color:${BRONZE_HOT}">${escape(topic)}</p>
        <h1 style="font-family:'CF Display',sans-serif;font-weight:600;font-size:${size}px;line-height:1.06;letter-spacing:-0.02em;color:#f2f5f7">${escape(article.title)}</h1>
        <p style="font-family:'CF Mono',monospace;font-size:18px;letter-spacing:0.14em;text-transform:uppercase;color:${MUTED};display:flex;align-items:center;gap:16px">
          <span style="display:inline-block;width:44px;height:2px;background:${BRONZE}"></span>
          Forge Journal&nbsp;&nbsp;·&nbsp;&nbsp;CloudsForge
        </p>
      </div>
    </div>`,
  )
}

function escape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/*
 * `chromium.executablePath()` then `launch({ executablePath })` is the estate's convention — the
 * same two lines `wallet-extension` and `micro-brand` use. playwright-core ships no browser of its
 * own, so this reads whichever one the machine already has installed.
 */
const browser = await chromium.launch({ executablePath: chromium.executablePath() })
const page = await browser.newPage({ deviceScaleFactor: 1 })

for (const article of ARTICLES) {
  const dir = join(root, 'public', 'articles', article.slug)
  mkdirSync(dir, { recursive: true })

  await page.setViewportSize(HERO)
  await page.setContent(heroHtml(article), { waitUntil: 'load' })
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: join(dir, 'hero.png'), type: 'png' })

  await page.setViewportSize(CARD)
  await page.setContent(cardHtml(article), { waitUntil: 'load' })
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: join(dir, 'card.png'), type: 'png' })

  process.stdout.write(`  ${article.slug}: hero.png card.png\n`)
}

/*
 * The publication's own share card, for `/`, `/topics`, `/about` and the 404 — every page that is
 * not one article. It is the same materials with no artwork behind it, because the archive is not
 * about any one of the things drawn above.
 */
const dir = join(root, 'public')
await page.setViewportSize(CARD)
await page.setContent(
  frame(
    CARD.width,
    CARD.height,
    `<div class="sheet">
      <div class="grid"></div>
      <div class="art">${cadence(CARD.width, CARD.height * 1.7)}</div>
      <div style="position:absolute;left:72px;top:0;height:${CARD.height}px;width:${CARD.width - 144}px;display:flex;flex-direction:column;justify-content:center;gap:22px">
        <p style="font-family:'CF Mono',monospace;font-size:20px;letter-spacing:0.18em;text-transform:uppercase;color:${BRONZE_HOT}">CloudsForge</p>
        <h1 style="font-family:'CF Display',sans-serif;font-weight:600;font-size:96px;line-height:1;letter-spacing:-0.03em;color:#f2f5f7">Forge Journal</h1>
        <p style="font-family:'CF Sans',sans-serif;font-size:27px;line-height:1.4;color:${TEXT};max-width:760px">Writing about technology, money and the systems people are asked to trust — plainly, with the working shown.</p>
      </div>
    </div>`,
  ),
  { waitUntil: 'load' },
)
await page.evaluate(() => document.fonts.ready)
await page.screenshot({ path: join(dir, 'og-1200x630.png'), type: 'png' })
process.stdout.write('  og-1200x630.png\n')

await browser.close()

// A file rather than a log line: `test/assets.test.ts` reads it to check nothing was drawn by a
// version of this script that no longer exists in the tree.
writeFileSync(
  join(root, 'public', 'articles', 'MANIFEST.txt'),
  `${ARTICLES.map((a) => a.slug).sort().join('\n')}\n`,
)

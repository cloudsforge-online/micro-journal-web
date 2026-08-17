/**
 * Word counts, reading time, and the date a reader sees.
 */
import type { Article, Block } from '../content/types.ts'
import { stripInline } from './inline.tsx'

/** Every word of prose in an article, markup removed. Headings included; captions included. */
export function wordCount(article: Article): number {
  const text = article.body.map(blockText).join(' ')
  return `${article.dek} ${text}`
    .split(/\s+/)
    .filter((word) => /[a-z0-9]/i.test(word)).length
}

function blockText(block: Block): string {
  switch (block.kind) {
    case 'ul':
    case 'ol':
      return block.items.map(stripInline).join(' ')
    case 'quote':
      return stripInline(block.text)
    case 'callout':
      return `${block.title} ${stripInline(block.text)}`
    case 'figure':
      return block.caption
    default:
      return stripInline(block.text)
  }
}

/**
 * Minutes, rounded up, never below one.
 *
 * ── 200 WORDS A MINUTE, AND WHY THE NUMBER IS NOT TUNED ──────────────────────────────────────────
 *
 * Published research on adult silent reading of non-fiction clusters around 200–260 words per
 * minute. The low end is used deliberately: the failure mode of this label is a reader who budgets
 * four minutes, is still going at nine, and abandons it — so the estimate should be generous rather
 * than accurate. A count that is occasionally too high costs nothing.
 *
 * It is computed at build time from the content, so it cannot be an aspiration somebody typed.
 */
export function readingMinutes(article: Article): number {
  return Math.max(1, Math.ceil(wordCount(article) / 200))
}

/**
 * An ISO date as a reader reads it: `4 August 2026`.
 *
 * ── NO `toLocaleDateString`, AND THIS IS THE REASON ──────────────────────────────────────────────
 *
 * Every page of this surface is rendered TWICE — once into a static file by `scripts/prerender.ts`
 * under Node, and once in the reader's browser. `toLocaleDateString` consults the environment's
 * locale and time zone, so those two renders would disagree for most of the world's readers: the
 * static file would carry the build machine's answer and the browser would paint a different one a
 * moment later. Worse, `new Date('2026-08-04')` parses as UTC midnight and formats as the third of
 * August anywhere west of Greenwich, so an article would be dated a day early for a whole
 * hemisphere.
 *
 * So the ISO string is split on hyphens and the parts are looked up. No Date object is constructed
 * anywhere on this surface, which is also what lets the prerender be byte-for-byte reproducible.
 */
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

export function formatDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!match) return iso
  const [, year, month, day] = match as unknown as [string, string, string, string]
  const name = MONTHS[Number(month) - 1]
  if (!name) return iso
  return `${Number(day)} ${name} ${year}`
}

/**
 * The same date as RFC 822, which is what an RSS `<pubDate>` has to be.
 *
 * Hand-composed for the reason above, and pinned at midnight UTC: an article has a publication DAY
 * in this archive and not a publication instant, so inventing a time would be inventing precision.
 */
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

export function toRfc822(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!match) return iso
  const [, year, month, day] = match as unknown as [string, string, string, string]
  // Sakamoto's algorithm. A `Date` would do this too, and would drag a time zone in with it.
  const y = Number(year)
  const m = Number(month)
  const d = Number(day)
  const table = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4]
  const shifted = m < 3 ? y - 1 : y
  const offset = table[m - 1] ?? 0
  const weekday =
    WEEKDAYS[
      (shifted + Math.floor(shifted / 4) - Math.floor(shifted / 100) + Math.floor(shifted / 400) + offset + d) % 7
    ] ?? 'Mon'
  const monthName = (
    ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const
  )[m - 1]
  return `${weekday}, ${day} ${monthName} ${year} 00:00:00 GMT`
}

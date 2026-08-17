/**
 * Regenerate the block between `<!-- cf:head:start -->` and `<!-- cf:head:end -->` in `index.html`.
 *
 * ── WHY THE BLOCK IS COMMITTED AT ALL ────────────────────────────────────────────────────────────
 *
 * `scripts/prerender.ts` overwrites it for every route, so at first glance whatever is in the source
 * file is dead bytes. It is not: `pnpm dev` serves `index.html` UNMODIFIED, and a head that only
 * exists in production is a head nobody looks at until it is wrong. Committing the home page's real
 * tags means the thing a developer sees locally is the thing a stranger's crawler gets.
 *
 * ── AND WHY IT IS GENERATED RATHER THAN TYPED ────────────────────────────────────────────────────
 *
 * Hand-writing it is how it drifts. The version this replaced had `og:site_name` as "Forge Journal"
 * — the publication — where `@cloudsforge/ui/seo` says "CloudsForge", and had the canonical in the
 * third position where `renderHead()` puts it last. Neither is visible in a browser and both are
 * exactly what a link-preview fetcher reads.
 *
 * `test/seo.test.ts` asserts the committed bytes equal this function's output, so the check is not
 * "somebody remembered to run this" — it is a red build. Run `pnpm head` when the description or the
 * shared SEO module changes; the test tells you when that is.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SURFACE_DESCRIPTION } from '../src/lib/hosts.ts'
import { HEAD_END, HEAD_START, homeHead, renderHead } from '../src/lib/meta.ts'

/** The exact bytes that belong between the markers, indent and all. Also read by the test. */
export function indexHeadBlock(): string {
  return renderHead(homeHead(SURFACE_DESCRIPTION))
}

/** `index.html` with the block replaced. Pure, so the test can compare without writing. */
export function withHeadBlock(html: string): string {
  const start = html.indexOf(HEAD_START)
  const end = html.indexOf(HEAD_END)
  if (start === -1 || end === -1) throw new Error(`index.html is missing ${HEAD_START}/${HEAD_END}`)
  return (
    html.slice(0, start + HEAD_START.length) + '\n' + indexHeadBlock() + '\n    ' + html.slice(end)
  )
}

export const INDEX_HTML = join(dirname(fileURLToPath(import.meta.url)), '..', 'index.html')

// Only when run directly. Imported by the test, which must not write to the working tree.
if (process.argv[1] !== undefined && process.argv[1].endsWith('sync-head.ts')) {
  const before = readFileSync(INDEX_HTML, 'utf8')
  const after = withHeadBlock(before)
  if (before === after) {
    process.stdout.write('index.html head block is already current\n')
  } else {
    writeFileSync(INDEX_HTML, after)
    process.stdout.write('index.html head block regenerated\n')
  }
}

/**
 * The contents of a long article, and the reader's position in it.
 *
 * ── THE HIGHLIGHT IS AN IntersectionObserver, NOT A SCROLL HANDLER ───────────────────────────────
 *
 * A scroll listener that measures every heading's `getBoundingClientRect` runs on every frame of
 * every scroll and forces a layout each time; on a long article on a modest phone that is the whole
 * frame budget spent on a decoration. The observer does the same job off the main thread's critical
 * path and reports only when something crosses.
 *
 * `rootMargin: '0px 0px -70% 0px'` shrinks the viewport's bottom edge upwards, so a heading is
 * "current" from the moment it reaches the top third rather than the moment it appears at the
 * bottom. Without it every heading below the fold is intersecting at once and the highlight sits on
 * whichever the browser reports last.
 *
 * It degrades to nothing: with no observer the list is still a list of working links, which is all
 * it has to be. `scripts/prerender.ts` renders it with no highlight at all, and that is correct —
 * the static file has no reader in it.
 */
import { useEffect, useState } from 'react'
import type { TocEntry } from '../lib/toc.ts'

/**
 * The indent class for each heading level, written out rather than composed.
 *
 * `jn-toc__item--l${entry.level}` reads better and is the version this replaced. The problem is that
 * no tool can see it: `test/tokens.test.ts` proves every class named in `src/` has a rule in
 * `src/styles.css`, and a name assembled from a number is a name the check cannot resolve — so an
 * `--l4` arriving with a fourth heading level would render unstyled and nothing would say so. Spelt
 * out, both classes are literals in this file and the test covers them.
 */
const LEVEL_CLASS: Record<number, string> = {
  2: 'jn-toc__item--l2',
  3: 'jn-toc__item--l3',
}

export function TableOfContents({ entries }: { entries: readonly TocEntry[] }) {
  const [current, setCurrent] = useState<string | null>(null)

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const seen = new Set<string>()
    const observer = new IntersectionObserver(
      (records) => {
        for (const record of records) {
          if (record.isIntersecting) seen.add(record.target.id)
          else seen.delete(record.target.id)
        }
        // The FIRST entry in document order that is currently in view. Taking the observer's own
        // report would take whichever crossed most recently, which on a fast scroll is the last
        // one — so the highlight would run ahead of the reader.
        const first = entries.find((entry) => seen.has(entry.id))
        setCurrent(first?.id ?? null)
      },
      { rootMargin: '0px 0px -70% 0px' },
    )
    for (const entry of entries) {
      const element = document.getElementById(entry.id)
      if (element) observer.observe(element)
    }
    return () => observer.disconnect()
  }, [entries])

  return (
    <nav className="jn-toc" aria-label="Contents of this article">
      <p className="jn-toc__label">Contents</p>
      <ol className="jn-toc__list">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className={`jn-toc__item ${LEVEL_CLASS[entry.level] ?? ''}${
              entry.id === current ? ' jn-toc__item--current' : ''
            }`}
          >
            <a
              className="jn-toc__link"
              href={`#${entry.id}`}
              // The current section is announced rather than only coloured. `aria-current="true"`
              // rather than `location`: the reader has not navigated here, they have scrolled here.
              {...(entry.id === current ? { 'aria-current': true as const } : {})}
            >
              {entry.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

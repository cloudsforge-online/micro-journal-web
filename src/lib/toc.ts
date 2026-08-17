/**
 * The table of contents, derived from the headings an article already has.
 *
 * ── THE FRAGMENT ID IS WRITTEN DOWN IN THE ARTICLE, NOT SLUGIFIED FROM THE HEADING ───────────────
 *
 * Slugifying is the obvious move and it is wrong for one reason: a heading is COPY and an id is an
 * ADDRESS. Editing "The trick" to "The trick, finally" is a copy change with no consequences; if
 * the id is derived from it, that edit silently breaks every link anybody ever shared to that
 * section, with nothing anywhere to notice. So `HeadingBlock` carries its own `id`, an editor may
 * change the words freely, and `test/content.test.ts` asserts the ids are unique within an article
 * and are the shape a URL fragment can hold.
 */
import type { Article } from '../content/types.ts'

export interface TocEntry {
  readonly id: string
  readonly text: string
  readonly level: 2 | 3
}

export function tableOfContents(article: Article): readonly TocEntry[] {
  return article.body
    .filter((block): block is Extract<typeof block, { kind: 'h2' | 'h3' }> =>
      block.kind === 'h2' || block.kind === 'h3',
    )
    .map((block) => ({ id: block.id, text: block.text, level: block.kind === 'h2' ? 2 : 3 }))
}

/**
 * Whether an article gets a contents block at all.
 *
 * Three headings is the floor. A two-entry table of contents is a list of the two things the reader
 * can already see without scrolling, occupying the space where the article should have started.
 */
export function hasToc(article: Article): boolean {
  return tableOfContents(article).length >= 3
}

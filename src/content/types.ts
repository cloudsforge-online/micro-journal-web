/**
 * What an article IS, as data.
 *
 * ── WHY THE BODY IS A LIST OF BLOCKS AND NOT A STRING OF HTML ────────────────────────────────────
 *
 * Two reasons, and only the second one is about safety.
 *
 * The first is that this surface renders each article THREE times — into a static file at build
 * time, into the DOM when a reader navigates to it, and into an RSS item — and those three want
 * different things. A `<figure>` in the feed should be a plain `<img>` with a caption paragraph,
 * because most readers do not run stylesheets; on the page it is a figure with a caption in the
 * margin. One string of HTML can only be right for one of them, so the body is kept as structure
 * and each renderer decides.
 *
 * The second is that a string of HTML in a content file is an injection site that looks like prose.
 * Nothing here is ever passed to `dangerouslySetInnerHTML`: `renderInline()` in
 * `src/lib/inline.tsx` turns the tiny markup below into React elements, and React escapes text.
 * That is a property of the pipeline rather than of anybody's discipline.
 *
 * ── THE INLINE MARKUP IS DELIBERATELY TINY ───────────────────────────────────────────────────────
 *
 * `**bold**`, `*italic*`, `` `code` `` and `[text](href)`. That is the whole language, it is parsed
 * by one function with its own test, and it does not grow without a reason written down. A content
 * format that accepts arbitrary markdown accepts arbitrary HTML in practice, because every markdown
 * implementation has an escape hatch and somebody always finds it.
 */

/** A heading, which is also a table-of-contents entry and therefore needs a stable id. */
export interface HeadingBlock {
  readonly kind: 'h2' | 'h3'
  readonly text: string
  /** The fragment. Written down rather than slugified from `text` — see `src/lib/toc.ts`. */
  readonly id: string
}

export interface ParagraphBlock {
  readonly kind: 'p'
  readonly text: string
}

/** The opening paragraph, set larger. One per article, always first after the hero. */
export interface LeadBlock {
  readonly kind: 'lead'
  readonly text: string
}

export interface ListBlock {
  readonly kind: 'ul' | 'ol'
  readonly items: readonly string[]
}

export interface QuoteBlock {
  readonly kind: 'quote'
  readonly text: string
  readonly cite?: string
}

/** An aside the reader can skip without losing the thread. Never used for the argument itself. */
export interface CalloutBlock {
  readonly kind: 'callout'
  readonly title: string
  readonly text: string
}

export interface FigureBlock {
  readonly kind: 'figure'
  /** A path under `public/`, always absolute, never a hostname. */
  readonly src: string
  readonly alt: string
  readonly caption: string
}

export type Block =
  | HeadingBlock
  | ParagraphBlock
  | LeadBlock
  | ListBlock
  | QuoteBlock
  | CalloutBlock
  | FigureBlock

export interface Article {
  /** The URL segment. Lower case, hyphens, and never changed once published. */
  readonly slug: string
  /** The headline, as it appears on the page and in the `<title>`. */
  readonly title: string
  /**
   * The standfirst — one or two sentences under the headline.
   *
   * Distinct from `description` on purpose. This is written for somebody who has already arrived
   * and is deciding whether to read on; `description` is written for somebody looking at a list of
   * ten search results. They are frequently different sentences and pretending otherwise produces
   * copy that serves neither.
   */
  readonly dek: string
  /**
   * The meta description and the card description, byte for byte.
   *
   * Under 160 characters, because Google truncates around there and a sentence cut mid-clause reads
   * as carelessness. `test/content.test.ts` enforces the length rather than trusting a count by eye.
   */
  readonly description: string
  readonly authorId: string
  /** ISO date, the day it was published. Never back-dated. */
  readonly publishedAt: string
  /** ISO date of the last substantive edit, or null when it has not been edited. */
  readonly updatedAt: string | null
  /** Topic tags, lower case. Every one must exist in `TAGS`. */
  readonly tags: readonly string[]
  /** The hero image, under `public/`. Every article has one; a card with no image is a dead card. */
  readonly hero: {
    readonly src: string
    readonly alt: string
  }
  /**
   * The card image for social previews, 1200×630.
   *
   * Separate from the hero because the two are cropped differently and a hero letterboxed into a
   * card wastes half of it. Both are generated from the same source by `scripts/make-assets.ts`.
   */
  readonly card: string
  readonly body: readonly Block[]
}

export interface Author {
  readonly id: string
  readonly name: string
  /** One sentence, in the first person plural. Shown under every article this author signs. */
  readonly bio: string
}

/** A topic, with the sentence its own page leads on. */
export interface Tag {
  readonly slug: string
  readonly name: string
  readonly blurb: string
}

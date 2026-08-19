/**
 * An article's blocks, rendered for a reader in a browser.
 *
 * The other renderer lives in `src/lib/syndication.ts` and produces a string for the feed. This one
 * produces elements, which is what keeps `dangerouslySetInnerHTML` out of the repository: React
 * escapes every string it is handed, so a `<script>` typed into a content file renders as the words
 * `<script>` and nothing happens. Both walk the same tokens from `lib/inline.tsx`.
 *
 * ── HEADINGS ARE `h2`/`h3` AND THE ARTICLE TITLE IS THE `h1` ─────────────────────────────────────
 *
 * One `h1` per document, and on this surface it is the headline. A body that opened at `h1` would
 * give a screen-reader user two documents on one page and would give a crawler two candidate titles
 * for the same URL, which is the sort of ambiguity that gets resolved against you.
 *
 * Every heading is also an ANCHOR: the id comes from the article (see `lib/toc.ts` on why it is not
 * slugified from the text), the table of contents links to it, and `nginx.conf` never sees a
 * fragment because a fragment is never sent to a server. The heading itself is the link target
 * rather than a separate `<a name>`, so `scroll-margin-top` in the stylesheet is what stops the
 * sticky bar covering it.
 */
import type { Block } from '../content/types.ts'
import { renderInline } from '../lib/inline.tsx'
import { publicPath } from '../lib/routes.ts'

export function ArticleBody({ blocks }: { blocks: readonly Block[] }) {
  return (
    <>
      {blocks.map((block, index) => (
        <BlockView key={index} block={block} />
      ))}
    </>
  )
}

function BlockView({ block }: { block: Block }) {
  switch (block.kind) {
    case 'h2':
      return (
        <h2 id={block.id} className="jn-body__h2">
          {renderInline(block.text)}
        </h2>
      )
    case 'h3':
      return (
        <h3 id={block.id} className="jn-body__h3">
          {renderInline(block.text)}
        </h3>
      )
    case 'lead':
      return <p className="jn-body__lead">{renderInline(block.text)}</p>
    case 'p':
      return <p className="jn-body__p">{renderInline(block.text)}</p>
    case 'ul':
      return (
        <ul className="jn-body__list">
          {block.items.map((item, index) => (
            <li key={index}>{renderInline(item)}</li>
          ))}
        </ul>
      )
    case 'ol':
      return (
        <ol className="jn-body__list jn-body__list--ordered">
          {block.items.map((item, index) => (
            <li key={index}>{renderInline(item)}</li>
          ))}
        </ol>
      )
    case 'quote':
      return (
        <blockquote className="jn-body__quote">
          <p>{renderInline(block.text)}</p>
          {block.cite !== undefined && <cite className="jn-body__cite">{block.cite}</cite>}
        </blockquote>
      )
    case 'callout':
      // `aside` rather than `div`: it is genuinely tangential, and the landmark is what lets a
      // screen-reader user skip it the way a sighted reader skips a tinted box.
      return (
        <aside className="jn-callout">
          <p className="jn-callout__title">{block.title}</p>
          <p className="jn-callout__text">{renderInline(block.text)}</p>
        </aside>
      )
    default:
      return (
        <figure className="jn-figure">
          {/*
            `loading="lazy"` on a body figure and never on the hero: the hero is what the reader
            came for and is almost always the largest paint, so deferring it costs the one metric
            that matters. Width and height are stated so the paragraph after it does not jump when
            the image arrives — the layout shift a reader experiences as losing their place.

            `publicPath()` because this bundle is mounted at `/journal` and an `<img>` src resolves
            against the ORIGIN, not against the router — see the same note in `components/card.tsx`.
            `src/lib/syndication.ts` applies it to the same field for the feed's copy of the figure.
          */}
          <img
            className="jn-figure__img"
            src={publicPath(block.src)}
            alt={block.alt}
            width={1600}
            height={900}
            loading="lazy"
            decoding="async"
          />
          <figcaption className="jn-figure__caption">{block.caption}</figcaption>
        </figure>
      )
  }
}

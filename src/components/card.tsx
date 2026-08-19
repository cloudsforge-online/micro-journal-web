/**
 * An article, as it appears in a list.
 *
 * ── THE WHOLE CARD IS NOT A LINK, AND THAT IS AN ACCESSIBILITY DECISION ──────────────────────────
 *
 * Wrapping the card in one `<a>` is the common pattern and it produces a link whose accessible name
 * is the headline, the standfirst, the date, the reading time and every topic chip read out as one
 * unbroken sentence — and it makes the topic chips unreachable, because a link inside a link is
 * invalid and browsers resolve it by dropping one. So the HEADLINE is the link, the chips are their
 * own links, and the stylesheet stretches the headline's hit area across the card with a
 * pseudo-element so a mouse still gets the large target. `jn-card__link::after` is that rule.
 */
import { Link } from 'react-router-dom'
import type { Article } from '../content/types.ts'
import { formatDate, readingMinutes } from '../lib/reading.ts'
import { stripInline } from '../lib/inline.tsx'
import { articlePath, publicPath, topicPath } from '../lib/routes.ts'
import { tagBySlug } from '../content/tags.ts'

export function ArticleCard({
  article,
  lead = false,
}: {
  article: Article
  /** The newest article on the archive page, given the full width and its image. */
  lead?: boolean
}) {
  const minutes = readingMinutes(article)
  return (
    <article className={`jn-card${lead ? ' jn-card--lead' : ''}`}>
      <Link className="jn-card__thumb" to={articlePath(article.slug)} tabIndex={-1} aria-hidden="true">
        {/*
          `publicPath()` and not the bare `article.hero.src`, and the asymmetry with the `to` above
          is the point: `<Link>` re-applies the router's basename on its own, and an `<img>` is a
          plain browser URL that resolves against the ORIGIN. Without it the picture is requested
          from `/articles/<slug>/hero.png` at the apex, which belongs to the marketing site and
          answers 404 — every card on the archive page a broken image, in production only, because
          `pnpm dev` serves the same tree from the same base.
        */}
        <img
          className="jn-card__img"
          src={publicPath(article.hero.src)}
          alt=""
          width={1600}
          height={900}
          loading={lead ? 'eager' : 'lazy'}
          decoding="async"
        />
      </Link>
      <div className="jn-card__text">
        <h2 className={lead ? 'jn-card__title jn-card__title--lead' : 'jn-card__title'}>
          <Link className="jn-card__link" to={articlePath(article.slug)}>
            {article.title}
          </Link>
        </h2>
        <p className="jn-card__dek">{stripInline(article.dek)}</p>
        <p className="jn-card__meta">
          <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
          {' · '}
          {/*
            "min read" rather than "minutes": it sits in a run of small metadata and the long form
            crowds the date off the line on a narrow screen. The `title` carries the long form for
            anyone who wants it, and the number itself is computed from the words — see
            `lib/reading.ts` on why the estimate is deliberately generous.
          */}
          <span title={`About ${minutes} minute${minutes === 1 ? '' : 's'} of reading`}>
            <span className="cf-num">{minutes}</span> min read
          </span>
        </p>
        <p className="jn-card__tags">
          {article.tags.map((slug) => {
            const tag = tagBySlug(slug)
            if (!tag) return null
            return (
              <Link key={slug} className="jn-chip" to={topicPath(slug)}>
                {tag.name}
              </Link>
            )
          })}
        </p>
      </div>
    </article>
  )
}

/**
 * One article.
 *
 * ── THE PAGE IS ALSO A FILE, AND EVERYTHING HERE HAS TO SURVIVE BEING RENDERED WITHOUT A BROWSER ──
 *
 * `scripts/prerender.ts` renders this component under Node with `renderToStaticMarkup` and writes
 * the result to `dist/a/<slug>/index.html`. So nothing on this page may read `window` during render,
 * nothing may depend on an effect having run, and every piece of the article a reader came for —
 * headline, standfirst, date, byline, body, related links — is in the markup before a single byte of
 * JavaScript arrives. The two things that are not are the contents highlight and the share row, and
 * both are decorations that degrade to a list of links and two dead buttons.
 *
 * ── AN UNKNOWN SLUG IS A 404, NOT A REDIRECT ─────────────────────────────────────────────────────
 *
 * The prerender writes no file for it, nginx therefore falls to `error_page 404 /404.html`, and the
 * client router renders the same page below. Redirecting an unknown article to the archive would
 * answer 200 for every misspelling anybody ever shared and would tell a crawler that the archive
 * lives at forty different addresses.
 */
import { Link, useParams } from 'react-router-dom'
import { ArticleBody } from '../components/article-body.tsx'
import { ArticleCard } from '../components/card.tsx'
import { Head } from '../components/head.tsx'
import { ShareRow } from '../components/share.tsx'
import { TableOfContents } from '../components/toc.tsx'
import { articleBySlug, relatedTo } from '../content/index.ts'
import { authorById } from '../content/authors.ts'
import { tagBySlug } from '../content/tags.ts'
import { stripInline } from '../lib/inline.tsx'
import { articleHead } from '../lib/meta.ts'
import { formatDate, readingMinutes, wordCount } from '../lib/reading.ts'
import { articlePath, publicPath, topicPath } from '../lib/routes.ts'
import { hasToc, tableOfContents } from '../lib/toc.ts'
import { NotFoundPage } from './not-found.tsx'
import type { Article } from '../content/types.ts'

export function ArticlePage() {
  const { slug } = useParams<{ slug: string }>()
  const article = slug === undefined ? undefined : articleBySlug(slug)
  if (!article) return <NotFoundPage />
  return <ArticleView article={article} />
}

/**
 * Split from the route component so the prerender can render an article it already holds, without
 * standing up a router just to put a slug into it.
 */
export function ArticleView({ article }: { article: Article }) {
  const author = authorById(article.authorId)
  const sections = article.tags.map((slug) => tagBySlug(slug)?.name ?? slug)
  const minutes = readingMinutes(article)
  const related = relatedTo(article)

  return (
    <>
      <Head
        page={articleHead(article, {
          wordCount: wordCount(article),
          authorName: author.name,
          sectionNames: sections,
        })}
      />

      <article className="jn-article">
        <header className="jn-article__head">
          <p className="jn-article__topics">
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
          <h1 className="jn-article__title">{article.title}</h1>
          <p className="jn-article__dek">{stripInline(article.dek)}</p>
          <p className="jn-article__byline">
            <span className="jn-article__author">{author.name}</span>
            {' · '}
            <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
            {article.updatedAt !== null && (
              <>
                {' · '}
                <span>Updated {formatDate(article.updatedAt)}</span>
              </>
            )}
            {' · '}
            <span>
              <span className="cf-num">{minutes}</span> min read
            </span>
          </p>
        </header>

        {/*
          THE HERO IS EAGER AND HAS NO `loading` ATTRIBUTE AT ALL. It is almost always the largest
          contentful paint on this page, and `loading="lazy"` on an image that is already in the
          viewport delays it for no benefit — the browser has to run layout before it can tell the
          image is visible. `fetchPriority="high"` says the same thing to the network stack.

          `publicPath()` on the src, as on every other image in this bundle: an `<img>` resolves
          against the ORIGIN and this bundle is mounted at `/journal`. This is the one where getting
          it wrong is most expensive — the hero is the largest paint AND the picture in the link
          preview a reader was sold the article by.
        */}
        <figure className="jn-article__hero">
          <img
            className="jn-article__hero-img"
            src={publicPath(article.hero.src)}
            alt={article.hero.alt}
            width={1600}
            height={900}
            decoding="async"
            fetchPriority="high"
          />
        </figure>

        <div className="jn-article__grid">
          {hasToc(article) && (
            <div className="jn-article__aside">
              <TableOfContents entries={tableOfContents(article)} />
            </div>
          )}
          <div className="jn-body">
            <ArticleBody blocks={article.body} />
          </div>
        </div>

        <footer className="jn-article__foot">
          <ShareRow title={article.title} path={articlePath(article.slug)} />
          <aside className="jn-byline">
            <p className="jn-byline__name">{author.name}</p>
            <p className="jn-byline__bio">{author.bio}</p>
          </aside>
        </footer>
      </article>

      {related.length > 0 && (
        <section className="jn-related" aria-label="More from the journal">
          <h2 className="jn-related__title">More from the journal</h2>
          <div className="jn-grid">
            {related.map((other) => (
              <ArticleCard key={other.slug} article={other} />
            ))}
          </div>
        </section>
      )}
    </>
  )
}

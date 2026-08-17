/**
 * The page that is not a page.
 *
 * It renders at two moments that look the same to a reader and are completely different to a
 * crawler. Following a bad link inside the app, the client router lands here and the address bar
 * carries a 200 that nginx never saw. Arriving cold on a bad address, nginx finds no file, falls to
 * `error_page 404 /404.html`, and serves this same markup UNDER a real 404 — which is the half that
 * matters, because a soft 404 is how an archive of six pages gets indexed as an archive of six
 * hundred, most of them identical.
 *
 * So it offers the three ways out that are actually useful — the archive, the topics, the search —
 * rather than a redirect. A redirect would answer 200 for every misspelling anybody ever shared.
 */
import { Link } from 'react-router-dom'
import { Head } from '../components/head.tsx'
import { ARTICLES } from '../content/index.ts'
import { ArticleCard } from '../components/card.tsx'
import { notFoundHead } from '../lib/meta.ts'

export const NOT_FOUND_DESCRIPTION =
  'That address is not part of Forge Journal. The archive, the topics and the search are all one ' +
  'click away.'

export function NotFoundPage() {
  const newest = ARTICLES.slice(0, 2)
  return (
    <>
      <Head page={notFoundHead(NOT_FOUND_DESCRIPTION)} />
      <header className="jn-pagehead">
        <p className="jn-pagehead__eyebrow">404</p>
        <h1 className="jn-pagehead__title">There is nothing at this address</h1>
        <p className="jn-pagehead__standfirst">
          The link may be old, or it may have a character missing. Nothing published here is ever
          moved, so an address that worked once still works.
        </p>
      </header>
      <p className="jn-pagehead__actions">
        <Link className="cf-btn jn-btn--solid" to="/">
          The archive
        </Link>
        <Link className="cf-btn" to="/topics">
          Topics
        </Link>
        <Link className="cf-btn" to="/search">
          Search
        </Link>
      </p>
      <section className="jn-grid" aria-label="Recent articles">
        {newest.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </section>
    </>
  )
}

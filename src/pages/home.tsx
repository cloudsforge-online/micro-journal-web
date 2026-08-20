/**
 * The archive: everything published, newest first.
 *
 * ── THE NEWEST ARTICLE GETS THE WHOLE WIDTH AND THE REST GET A GRID ──────────────────────────────
 *
 * A page of identical tiles is the shape the estate has already had to redesign twice — Foresight's
 * main page and Forge Market both shipped as a wall of repeating cards and both were reported as
 * unreadable, not because a card is wrong but because a page with no hierarchy asks the reader to
 * do the editing. So the front page makes one editorial decision, which is the one a front page
 * exists to make: this is the piece to read first.
 *
 * There is no pagination and no "load more". Ten articles fit; the day they do not, the fix is a
 * year index, not a second page of the same list — `lib/routes.ts` records why neither exists yet.
 */
import { Link } from 'react-router-dom'
import { ARTICLES, populatedTags } from '../content/index.ts'
import { Head } from '../components/head.tsx'
import { ArticleCard } from '../components/card.tsx'
import { SURFACE_DESCRIPTION } from '../lib/hosts.ts'
import { homeHead, PUBLICATION } from '../lib/meta.ts'
import { FEED_PATH, topicPath } from '../lib/routes.ts'

export function HomePage() {
  const [lead, ...rest] = ARTICLES

  return (
    <>
      <Head page={homeHead(SURFACE_DESCRIPTION)} />

      {/*
        The masthead of the PAGE, not of the site — the site's is in the shell. `h1` here and
        nowhere else on this route, so the document has exactly one.
      */}
      <header className="jn-hero">
        <p className="jn-hero__eyebrow">{PUBLICATION}</p>
        <h1 className="jn-hero__title">Things worth explaining properly</h1>
        <p className="jn-hero__standfirst">
          Writing about technology, money and the systems people are asked to trust — plainly, with
          the working shown. No jargon you have to look up, nothing to sign up for, and when we
          write about our own products we say so.
        </p>
      </header>

      {lead && (
        <section className="jn-lead" aria-label="Latest article">
          <ArticleCard article={lead} lead />
        </section>
      )}

      {rest.length > 0 && (
        <section className="jn-grid" aria-label="More articles">
          {rest.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </section>
      )}

      <section className="jn-strip" aria-label="Topics">
        <h2 className="jn-strip__title">Browse by topic</h2>
        <p className="jn-strip__chips">
          {populatedTags().map((tag) => (
            <Link key={tag.slug} className="jn-chip" to={topicPath(tag.slug)}>
              {tag.name} <span className="cf-num">{tag.count}</span>
            </Link>
          ))}
        </p>
      </section>

      {/*
        ── SUBSCRIBING WITHOUT AN ACCOUNT, WHICH IS THE ONLY WAY OFFERED ────────────────────────────

        No email capture. An address collected here would be a mailing list to store, a consent to
        record, an unsubscribe to honour and a breach to disclose, in exchange for a channel the
        reader already has. A feed URL is the same subscription with none of that: the reader's
        software asks this server for a file, we never learn who they are, and they leave by
        deleting a line in an application we have no part in.
      */}
      <section className="jn-subscribe">
        <h2 className="jn-subscribe__title">Get new pieces as they go up</h2>
        <p className="jn-subscribe__body">
          There is no mailing list. Paste this address into any feed reader and new articles arrive
          there in full — we never learn that you did, and you leave by deleting the line.
        </p>
        <p className="jn-subscribe__link">
          <a className="cf-btn jn-btn--solid" href={FEED_PATH}>
            The feed
          </a>
        </p>
      </section>
    </>
  )
}

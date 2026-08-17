/**
 * The `<Route>` elements, in a module of their own.
 *
 * ── THIS IS SPLIT OUT OF `app.tsx` FOR ONE MECHANICAL REASON ─────────────────────────────────────
 *
 * `scripts/prerender.ts` renders these routes under plain Node, with no DOM of any kind. `app.tsx`
 * cannot be imported there: it reaches `components/shell.tsx`, which imports the estate's bar and
 * `lib/viewed.ts`, and those touch `window` while their modules are still evaluating — before a
 * single component has rendered, so no amount of conditional rendering avoids it. Installing a fake
 * DOM to get past that is the usual answer and it is the wrong one: the prerender would then be
 * exercising a second browser implementation's opinion of the estate's chrome, and any disagreement
 * would surface as markup a reader never sees on a real browser.
 *
 * So the ROUTE TABLE lives here and the two shells are passed in. `app.tsx` supplies the real one;
 * the prerender supplies `components/static-shell.tsx`, which is deliberately smaller. The
 * alternative — the prerender declaring its own routes — would make it the second place that has to
 * agree about every address this app answers, and the first one no test could cross-check.
 *
 * ── WHAT THE STATIC SHELL LEAVES OUT, AND WHY THAT IS NOT A COMPROMISE ───────────────────────────
 *
 * The estate's bar and footer compose ABSOLUTE URLs to the twelve sibling surfaces, derived at
 * runtime from the hostname the reader is on. At build time there is no hostname, and writing one in
 * is the failure `vite.config.ts` spends a page arguing against: a file that names `cloudsforge.online`
 * is a file that is wrong on the testnet host, wrong on a preview deployment and wrong on a laptop.
 * `test/no-build-time-config.test.ts` fails the build over exactly that string.
 *
 * The words are what the static file is for. A crawler that runs no JavaScript gets the headline,
 * the standfirst, the byline, the whole body, the topics and the links to every other article — all
 * of it relative, all of it correct on any origin. The estate chrome arrives a moment later with the
 * bundle, for the reader who has one.
 */
import { Route } from 'react-router-dom'
import type { ReactElement } from 'react'
import { ARTICLE_PREFIX } from './lib/routes.ts'
import { AboutPage } from './pages/about.tsx'
import { ArticlePage } from './pages/article.tsx'
import { HomePage } from './pages/home.tsx'
import { NotFoundPage } from './pages/not-found.tsx'
import { SearchPage } from './pages/search.tsx'
import { TopicPage } from './pages/topic.tsx'
import { TopicsPage } from './pages/topics.tsx'

/**
 * FIVE things have to agree about which addresses this bundle answers, and `test/routes.test.ts`
 * reads them all as text to check they do: `ROUTES` in `lib/routes.ts` (which the navigation derives
 * from), the elements below, the enumerated `location` blocks in `nginx.conf`, the list
 * `scripts/prerender.ts` writes a file for, and the entries `lib/syndication.ts` puts in the
 * sitemap. The last is the one this surface adds and the one that matters most: every address below
 * has a REAL FILE behind it in `dist`.
 */
export function routeChildren(): ReactElement {
  return (
    <>
      {/* The archive. */}
      <Route index element={<HomePage />} />
      {/*
        `/a/<slug>`. The prefix is one letter because it appears in every link anybody shares, and
        it is a constant rather than a string here so the router, the path helper and the prerender
        cannot disagree about it.
      */}
      <Route path={`${ARTICLE_PREFIX}/:slug`} element={<ArticlePage />} />
      <Route path="topics" element={<TopicsPage />} />
      <Route path="topics/:slug" element={<TopicPage />} />
      <Route path="about" element={<AboutPage />} />
      <Route path="search" element={<SearchPage />} />
      {/* Unknown paths render inside the shell so the reader keeps the navigation they need to get
          back out — under a real 404, which `nginx.conf` preserves. */}
      <Route path="*" element={<NotFoundPage />} />
    </>
  )
}

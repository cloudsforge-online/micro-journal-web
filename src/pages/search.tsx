/**
 * Search, run entirely in the reader's own browser.
 *
 * `content/index.ts` carries the argument: the whole corpus is already in the bundle the reader
 * downloaded, so asking a server about text the browser is holding would be slower, would need a
 * service to deploy, and would put a log of what every reader searched for on a machine we own.
 *
 * ── THE QUERY LIVES IN THE URL, AND THE URL IS REPLACED RATHER THAN PUSHED ───────────────────────
 *
 * In the URL, because a search worth sharing is one somebody can paste; the `SearchAction` in the
 * home page's JSON-LD points a search engine straight at `?q=`, so the parameter is a published
 * interface rather than an implementation detail.
 *
 * REPLACED, because pushing a history entry per keystroke means the reader's Back button walks them
 * backwards through their own typing one letter at a time — which is the single most reliable way to
 * trap somebody on a page they are trying to leave.
 *
 * The page is `noindex, follow` (`lib/meta.ts`) and `robots.txt` disallows the path
 * (`lib/syndication.ts`). Both are needed: the tag stops the indexing and the disallow stops the
 * fetch.
 */
import { useSearchParams } from 'react-router-dom'
import { ArticleCard } from '../components/card.tsx'
import { Head } from '../components/head.tsx'
import { search } from '../content/index.ts'
import { searchHead } from '../lib/meta.ts'

export const SEARCH_DESCRIPTION =
  'Search every article in Forge Journal. The whole archive is already in your browser, so nothing ' +
  'you type here is sent anywhere.'

export function SearchPage() {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const results = query.trim() === '' ? [] : search(query)

  return (
    <>
      <Head page={searchHead(SEARCH_DESCRIPTION)} />
      <header className="jn-pagehead">
        <h1 className="jn-pagehead__title">Search</h1>
        <p className="jn-pagehead__standfirst">{SEARCH_DESCRIPTION}</p>
      </header>

      {/*
        A `<form>` with `role="search"`, and `onSubmit` prevented. The form is not decoration: on a
        phone keyboard it is what turns the return key into "Search", and without it a reader who
        presses it gets a full page reload of an address the client already has.
      */}
      <form
        className="jn-search"
        role="search"
        onSubmit={(event) => {
          event.preventDefault()
        }}
      >
        <label className="jn-search__label" htmlFor="jn-q">
          What are you looking for?
        </label>
        <input
          id="jn-q"
          className="cf-input jn-search__input"
          type="search"
          name="q"
          value={query}
          autoComplete="off"
          placeholder="wallet, seed phrase, mining…"
          onChange={(event) => {
            const next = event.target.value
            setParams(next.trim() === '' ? {} : { q: next }, { replace: true })
          }}
        />
      </form>

      <p className="jn-search__count" role="status">
        {query.trim() === ''
          ? 'Type to search the archive.'
          : `${results.length} ${results.length === 1 ? 'article' : 'articles'} match “${query.trim()}”.`}
      </p>

      {results.length > 0 && (
        <section className="jn-grid" aria-label="Search results">
          {results.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </section>
      )}

      {query.trim() !== '' && results.length === 0 && (
        <p className="jn-empty">
          Nothing matched. Every word has to appear somewhere in an article for it to count, so
          fewer words usually finds more.
        </p>
      )}
    </>
  )
}

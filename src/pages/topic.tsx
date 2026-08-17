/**
 * Every article under one topic.
 *
 * An unknown slug is the 404 rather than an empty list with a heading, for the reason `topics.tsx`
 * gives from the other side: a page that renders "0 articles" answers 200, so a crawler files it as
 * a real but empty page of this publication and a reader who mistyped is told nothing useful.
 */
import { useParams } from 'react-router-dom'
import { ArticleCard } from '../components/card.tsx'
import { Head } from '../components/head.tsx'
import { articlesByTag } from '../content/index.ts'
import { tagBySlug } from '../content/tags.ts'
import { topicHead } from '../lib/meta.ts'
import { NotFoundPage } from './not-found.tsx'
import type { Tag } from '../content/types.ts'

export function TopicPage() {
  const { slug } = useParams<{ slug: string }>()
  const tag = slug === undefined ? undefined : tagBySlug(slug)
  if (!tag) return <NotFoundPage />
  return <TopicView tag={tag} />
}

/** Split out so the prerender can render a topic it already holds. See `pages/article.tsx`. */
export function TopicView({ tag }: { tag: Tag }) {
  const articles = articlesByTag(tag.slug)
  return (
    <>
      <Head page={topicHead(tag, articles.length)} />
      <header className="jn-pagehead">
        <p className="jn-pagehead__eyebrow">Topic</p>
        <h1 className="jn-pagehead__title">{tag.name}</h1>
        <p className="jn-pagehead__standfirst">{tag.blurb}</p>
      </header>
      <section className="jn-grid" aria-label={`Articles about ${tag.name}`}>
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </section>
    </>
  )
}

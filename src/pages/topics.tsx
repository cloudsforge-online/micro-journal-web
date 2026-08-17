/**
 * The five topics, each with the sentence its own page leads on.
 *
 * `populatedTags()` rather than `TAGS`, and `content/index.ts` records why: a test asserts they are
 * the same list, and a derivation that CANNOT link an empty page is still better than a test saying
 * nobody did. This index is the page a crawler follows to find every topic, so a dead entry here is
 * a dead end it reports back.
 */
import { Link } from 'react-router-dom'
import { Head } from '../components/head.tsx'
import { populatedTags } from '../content/index.ts'
import { tagBySlug } from '../content/tags.ts'
import { topicsHead } from '../lib/meta.ts'
import { topicPath } from '../lib/routes.ts'

export const TOPICS_DESCRIPTION =
  'Five subjects this journal keeps returning to: starting out, staying safe, the Hearth chain, ' +
  'the CloudsForge ecosystem, and what living with a volatile thing actually does to your week.'

export function TopicsPage() {
  const tags = populatedTags()
  return (
    <>
      <Head page={topicsHead(TOPICS_DESCRIPTION)} />
      <header className="jn-pagehead">
        <h1 className="jn-pagehead__title">Topics</h1>
        <p className="jn-pagehead__standfirst">{TOPICS_DESCRIPTION}</p>
      </header>
      <ul className="jn-topics">
        {tags.map((tag) => {
          const full = tagBySlug(tag.slug)
          return (
            <li key={tag.slug} className="jn-topics__item">
              <h2 className="jn-topics__name">
                <Link className="jn-topics__link" to={topicPath(tag.slug)}>
                  {tag.name}
                </Link>
              </h2>
              <p className="jn-topics__blurb">{full?.blurb}</p>
              <p className="jn-topics__count">
                <span className="cf-num">{tag.count}</span>{' '}
                {tag.count === 1 ? 'article' : 'articles'}
              </p>
            </li>
          )
        })}
      </ul>
    </>
  )
}

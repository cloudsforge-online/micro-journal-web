/**
 * The topics, closed.
 *
 * A tag here is a PAGE — `/topics/<slug>` is prerendered, listed in the sitemap and offered to a
 * crawler as a real address — so the set has to be small, deliberate and stable. Free-text tags
 * produce a hundred pages with one article each, which is the shape search engines describe as thin
 * and readers experience as a dead end.
 *
 * `test/content.test.ts` fails on an article that names a tag absent from here, and on a tag here
 * that no article uses: the first would 404 from a chip the reader can see, the second would put an
 * empty page in the sitemap.
 */
import type { Tag } from './types.ts'

export const TAGS: readonly Tag[] = [
  {
    slug: 'starting-out',
    name: 'Starting out',
    blurb:
      'For anyone who has heard about crypto for years and never found an explanation that assumed nothing.',
  },
  {
    slug: 'staying-safe',
    name: 'Staying safe',
    blurb:
      'How people actually lose money in crypto, and the small habits that prevent nearly all of it.',
  },
  {
    slug: 'hearth',
    name: 'Hearth',
    blurb: 'The chain CloudsForge runs, why it exists, and what it is and is not good at.',
  },
  {
    slug: 'ecosystem',
    name: 'The ecosystem',
    blurb: 'What each part of CloudsForge is for, and how the pieces fit together.',
  },
  {
    slug: 'living-with-it',
    name: 'Living with it',
    blurb:
      'The part nobody writes about: what holding a volatile thing does to your week, and how to hold it without it holding you.',
  },
]

export function tagBySlug(slug: string): Tag | undefined {
  return TAGS.find((tag) => tag.slug === slug)
}

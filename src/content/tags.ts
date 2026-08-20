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

/*
 * ── WHY THESE SIX, AND NOT THE SIX THAT WERE HERE ────────────────────────────────────────────────
 *
 * The first set was named after the first ten articles rather than after the publication: `hearth`,
 * `ecosystem` and `living-with-it` were three ways of saying CloudsForge, and `starting-out` and
 * `staying-safe` between them described a beginner's crypto-safety guide. That is a fair account of
 * what had been written by August 2026 and a poor one of what this is for — every piece that was not
 * about losing coins or about our own products had nowhere to sit, so the taxonomy would have had to
 * grow a new page each time the subject moved. A closed set that needs opening is not closed.
 *
 * These six are named after the KIND of piece rather than its subject, which is the property that
 * makes them last: an explainer is an explainer whether it is about seed phrases or settlement
 * batching, and `what-we-build` holds anything of ours without naming which product exists this
 * quarter. Only `the-wider-world` survives unchanged — it was already about a kind, not a topic.
 */
export const TAGS: readonly Tag[] = [
  {
    slug: 'explainers',
    name: 'Explainers',
    blurb:
      'For anyone who has heard a thing referred to for years and never found an explanation that assumed nothing.',
  },
  {
    slug: 'security',
    name: 'Security',
    blurb:
      'How people actually lose money and access, and the small habits that prevent nearly all of it.',
  },
  {
    slug: 'how-things-work',
    name: 'How things work',
    blurb:
      'The mechanism underneath, taken apart slowly: what the system is really doing, and what it is and is not good at.',
  },
  {
    slug: 'what-we-build',
    name: 'What we build',
    blurb: 'Our own work — what we built, what it is for, and what we got wrong on the way.',
  },
  {
    slug: 'field-notes',
    name: 'Field notes',
    blurb:
      'The part nobody writes down: what running and using this stuff is actually like, week to week.',
  },
  {
    slug: 'the-wider-world',
    name: 'The wider world',
    blurb:
      'What happened in somebody else\'s system, in somebody else\'s filings, read by people who run one and have to make the same decisions.',
  },
]

export function tagBySlug(slug: string): Tag | undefined {
  return TAGS.find((tag) => tag.slug === slug)
}

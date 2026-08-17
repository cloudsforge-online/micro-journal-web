/**
 * The prose, read as data.
 *
 * ════════════════════════════════════════════════════════════════════════════════════════════════
 * THIS IS THE ONLY FILE IN THE REPOSITORY THAT CHECKS WHAT THE ARTICLES SAY.
 *
 * Every other test here guards a mechanism: the head is built per page, the routes match the files,
 * the origin is a placeholder, the chrome is mounted. All of that can be perfect while the thing
 * actually published is wrong — and on a publication the wrong thing is not a broken page, it is a
 * correct-looking sentence.
 *
 * Three of them are worth naming, because they are the three that cost something:
 *
 *   1. A NUMBER ABOUT OUR OWN CHAIN THAT NOBODY CHECKED. "EMBER confirms in about a minute" is
 *      unfalsifiable to a reader and trivially wrong to us, and it stays wrong for years because an
 *      article is never re-read after the day it ships. `src/content/claims.ts` is the register and
 *      the scan below is what makes it more than a document.
 *   2. ADVICE. This publication is written by a company that sells the things it explains. The line
 *      between "here is what a seed phrase is" and "here is what you should buy" is the line between
 *      a blog and an unlicensed solicitation, and it is crossed one friendly draft at a time.
 *   3. A SILENT DEAD END. A tag no article carries is a topic page in the sitemap with nothing on
 *      it; a hero at a path with no file is a link preview that has been a grey box since launch.
 *
 * ── WHAT THIS FILE DELIBERATELY DOES NOT DO ────────────────────────────────────────────────────
 *
 * It does not grade writing. There is no minimum word count, no readability score and no banned
 * adverb list, because every one of those produces a green build for prose nobody would publish and
 * a red one for a good sentence. What is mechanised here is only the part where being wrong is
 * invisible from inside the repository.
 * ════════════════════════════════════════════════════════════════════════════════════════════════
 */
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'
import type { Article, Block } from '../src/content/types.ts'
import { ARTICLES, articleBySlug, populatedTags, searchText } from '../src/content/index.ts'
import { AUTHORS, authorById } from '../src/content/authors.ts'
import { CLAIMS, allowedNumbers } from '../src/content/claims.ts'
import { TAGS, tagBySlug } from '../src/content/tags.ts'
import { isAllowedHref } from '../src/lib/inline.tsx'
import { ARTICLE_PREFIX } from '../src/lib/routes.ts'
import { ROOT, readSibling } from './sources.ts'

/** Everything a reader will actually read, block by block, with a label for the failure message. */
function proseOf(article: Article): { where: string; text: string }[] {
  const out = [
    { where: 'title', text: article.title },
    { where: 'dek', text: article.dek },
    { where: 'description', text: article.description },
    { where: 'hero alt', text: article.hero.alt },
  ]
  article.body.forEach((block: Block, index) => {
    const where = `body[${index}] ${block.kind}`
    switch (block.kind) {
      case 'ul':
      case 'ol':
        block.items.forEach((item, n) => out.push({ where: `${where}[${n}]`, text: item }))
        break
      case 'callout':
        out.push({ where: `${where} title`, text: block.title })
        out.push({ where, text: block.text })
        break
      case 'figure':
        out.push({ where: `${where} alt`, text: block.alt })
        out.push({ where: `${where} caption`, text: block.caption })
        break
      case 'quote':
        out.push({ where, text: block.text })
        if (block.cite) out.push({ where: `${where} cite`, text: block.cite })
        break
      default:
        out.push({ where, text: block.text })
    }
  })
  return out
}

/**
 * Sentences, split well enough for a scan and no better.
 *
 * A real sentence splitter is a research problem. This one needs to be right about where a claim
 * about our own chain sits, and prose that says "CloudsForge runs three chains" does not put the
 * name and the number in different sentences. The known imprecision is abbreviations — "e.g." ends
 * a sentence here — and it fails in the SAFE direction: a fragment carries the estate's name into a
 * scan it would otherwise have escaped, so the register is asked about more numbers, not fewer.
 */
function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
}

/** Does this sentence name something this estate owns? */
const ESTATE = /\bCloudsForge\b|\bHearth\b|\bEMBER\b|\bSparks?\b|\bForge [A-Z]\w+/

/** Every digit-run in a string, in the form an article prints it — thousands separators and all. */
function numbersIn(text: string): string[] {
  return [...text.matchAll(/\d[\d,]*(?:\.\d+)?/g)].map((match) => match[0])
}

test('EVERY ARTICLE IS WELL FORMED AS DATA', () => {
  assert.ok(ARTICLES.length > 0, 'the archive is empty')

  const slugs = new Set<string>()
  const titles = new Set<string>()
  for (const article of ARTICLES) {
    // The slug is in every link that has ever been shared and it can never change, so its shape is
    // worth being strict about ONCE — at the moment it is added, which is the only moment it is
    // free. `Nine Ways` and `nine--ways` are both permanent mistakes.
    assert.match(article.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `${article.slug} is not a clean slug`)
    assert.ok(!slugs.has(article.slug), `two articles claim the slug ${article.slug}`)
    slugs.add(article.slug)

    assert.ok(!titles.has(article.title), `two articles share the headline "${article.title}"`)
    titles.add(article.title)

    assert.ok(article.title.trim().length > 0, `${article.slug} has no headline`)
    assert.ok(article.dek.trim().length > 0, `${article.slug} has no standfirst`)
    assert.equal(article.title, article.title.trim(), `${article.slug}'s headline has loose space`)

    // The byline is a claim a search result carries outward. There is exactly one author here and
    // it is the company; the check is that nothing has quietly acquired a second, invented one.
    assert.doesNotThrow(() => authorById(article.authorId), `${article.slug} has an unknown author`)

    assert.match(article.publishedAt, /^\d{4}-\d{2}-\d{2}$/, `${article.slug} has no publish date`)
    if (article.updatedAt !== null) {
      assert.match(article.updatedAt, /^\d{4}-\d{2}-\d{2}$/, `${article.slug} has a bad edit date`)
      assert.ok(
        article.updatedAt >= article.publishedAt,
        `${article.slug} was edited before it was published`,
      )
    }

    // The artwork paths are derived from the slug by convention, and the convention is load-bearing:
    // `scripts/make-assets.ts` writes to it and nginx serves `/articles/` as its own location.
    assert.equal(article.hero.src, `/articles/${article.slug}/hero.png`)
    assert.equal(article.card, `/articles/${article.slug}/card.png`)
    assert.ok(article.hero.alt.trim().length > 0, `${article.slug}'s hero has no alt text`)
  }

  // The archive is newest first, and it is sorted from the dates rather than from the import order.
  const dates = ARTICLES.map((article) => article.publishedAt)
  assert.deepEqual(dates, [...dates].sort().reverse(), 'the archive is not in date order')

  assert.equal(AUTHORS.length, 1, 'a second author appeared; a byline is a claim about a person')
})

test('THE PICTURES EXIST AT THE PATHS THE ARTICLES NAME', () => {
  // A hero renders as a broken image, which somebody notices. A card does not render anywhere a
  // human looks — it is fetched by Slack, LinkedIn and iMessage — so a missing one is a grey box in
  // every share of that article for as long as the link is passed around, silently.
  for (const article of ARTICLES) {
    for (const path of [article.hero.src, article.card]) {
      assert.ok(existsSync(join(ROOT, 'public', path)), `${path} is named by ${article.slug} and does not exist`)
    }
    for (const block of article.body) {
      if (block.kind !== 'figure') continue
      assert.ok(existsSync(join(ROOT, 'public', block.src)), `${block.src} does not exist`)
      assert.ok(block.alt.trim().length > 0, `a figure in ${article.slug} has no alt text`)
    }
  }
})

test('THE DESCRIPTION IS WRITTEN FOR A SEARCH RESULT, NOT COPIED FROM THE PAGE', () => {
  const seen = new Set<string>()
  for (const article of ARTICLES) {
    // 160, because Google truncates around there and a sentence cut mid-clause reads as
    // carelessness. `src/content/types.ts` states the budget; this is what enforces it.
    assert.ok(
      article.description.length <= 160,
      `${article.slug}'s description is ${article.description.length} characters`,
    )
    // And a floor, because the other failure is a four-word description that wins no click. There
    // is nothing magic about 70; it is short enough that no reasonable sentence trips it.
    assert.ok(article.description.length >= 70, `${article.slug}'s description is too thin to rank`)
    assert.match(article.description, /[.!?]$/, `${article.slug}'s description is a fragment`)

    // Distinct from the standfirst ON PURPOSE: one is for somebody who has arrived and is deciding
    // whether to read on, the other for somebody looking at ten blue links. Copying one into the
    // other produces copy that serves neither, and it is the single easiest corner to cut.
    assert.notEqual(article.description, article.dek, `${article.slug} reuses its dek as its description`)

    assert.ok(!seen.has(article.description), 'two articles share a description')
    seen.add(article.description)
  }
})

test('EVERY TOPIC HAS ARTICLES, AND EVERY ARTICLE HAS REAL TOPICS', () => {
  for (const article of ARTICLES) {
    assert.ok(article.tags.length > 0, `${article.slug} is in no topic`)
    assert.equal(new Set(article.tags).size, article.tags.length, `${article.slug} repeats a tag`)
    for (const tag of article.tags) {
      assert.ok(tagBySlug(tag), `${article.slug} carries the unknown tag ${tag}`)
    }
  }
  // `src/content/index.ts` says in its own comment that in a green tree `populatedTags()` is the
  // whole of `TAGS`. This is the assertion that sentence points at. An unpopulated tag is a topic
  // page with nothing on it — a dead end for a reader and, worse, a dead end in the sitemap.
  assert.deepEqual(
    populatedTags().map((tag) => tag.slug),
    TAGS.map((tag) => tag.slug),
    'a topic exists that no article carries; write one or remove the topic',
  )
  for (const tag of TAGS) {
    assert.match(tag.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `${tag.slug} is not a clean slug`)
    assert.ok(tag.blurb.trim().length > 0, `topic ${tag.slug} has no sentence of its own`)
  }
})

test('EVERY NUMBER IN A SENTENCE THAT NAMES THIS ESTATE IS A REGISTERED CLAIM', () => {
  // ══════════════════════════════════════════════════════════════════════════════════════════════
  // THE RULE `src/content/claims.ts` EXISTS FOR.
  //
  // Not "every number in the archive" — an article says "the 1980s" and "a third of its value" and
  // "nine ways", and a register that has to hold those becomes a list of arbitrary integers with no
  // provenance to record, which teaches the next person that adding a row is a formality.
  //
  // The scan is aimed at the sentence that names CloudsForge, Hearth, EMBER, a Spark or a Forge
  // product AND carries a digit. That is a statement about our own chain, made to a reader with no
  // way to check it, by the people who run the chain. Those need a source.
  // ══════════════════════════════════════════════════════════════════════════════════════════════
  const allowed = allowedNumbers()
  const offences: string[] = []
  for (const article of ARTICLES) {
    for (const { where, text } of proseOf(article)) {
      for (const sentence of sentences(text)) {
        if (!ESTATE.test(sentence)) continue
        for (const number of numbersIn(sentence)) {
          if (allowed.has(number)) continue
          offences.push(`${article.slug} ${where}: "${number}" in — ${sentence}`)
        }
      }
    }
  }
  assert.deepEqual(
    offences,
    [],
    'a number about this estate is not in src/content/claims.ts. Register it with its source, or ' +
      'write it as a word — a figure a reader cannot check, published by the people who run the ' +
      'chain, is the one kind of error this publication cannot afford.',
  )
})

test('THE REGISTER HAS NO ORPHANS AND CITES NO LINE NUMBERS', () => {
  const everything = ARTICLES.flatMap((article) => proseOf(article).map((piece) => piece.text)).join(' ')
  for (const [key, entry] of Object.entries(CLAIMS)) {
    // An orphan row is the most plausible-looking wrong value the next writer could reach for: it
    // is in the register, so it looks checked, and nobody has read it since it was added.
    assert.ok(
      everything.includes(entry.rendered),
      `CLAIMS.${key} (${entry.rendered}) is used by no article; a register is not a fact sheet`,
    )
    assert.ok(entry.meaning.trim().length > 0, `CLAIMS.${key} says what it is but not what it means`)

    // A path and a SYMBOL. micro-site's own header records four separate red builds caused by
    // citations naming a LINE in a file this estate owns but that repository does not watch — every
    // one a stale position rather than a wrong value. A search survives a file growing.
    assert.match(entry.source, /\S+\.(ts|md|tsx|json|yml)\b|@cloudsforge\/ui/, `CLAIMS.${key} cites no file`)
    assert.doesNotMatch(entry.source, /:\d+\b/, `CLAIMS.${key} cites a line number; name the symbol`)
    assert.match(entry.source, /—|"/, `CLAIMS.${key} names a file but nothing in it`)
  }
})

test('THE ARCHIVE AND THE MARKETING SITE CANNOT STATE THE SAME FACT TWO WAYS', (t) => {
  // The register here is deliberately a SUBSET of micro-site's, cited to the same upstream symbols.
  // Two registers that drift are worse than one, because each looks authoritative on its own page —
  // and the reader who notices is the one comparing the blog with the pricing page.
  const upstream = readSibling('site/src/content/claims.ts')
  if (!upstream) return t.skip('micro-site is not checked out (CI fails if this skips there)')

  const missing: string[] = []
  for (const [key, entry] of Object.entries(CLAIMS)) {
    if (!upstream.includes(`'${entry.rendered}'`) && !upstream.includes(`"${entry.rendered}"`)) {
      missing.push(`${key} = ${entry.rendered}`)
    }
  }
  assert.deepEqual(
    missing,
    [],
    'a claim here has no counterpart in site/src/content/claims.ts. Either the site is out of date ' +
      'or this publication has invented a fact — and from inside this repository those look the same.',
  )
})

test('NOTHING HERE TELLS ANYBODY WHAT TO DO WITH THEIR MONEY', () => {
  // ══════════════════════════════════════════════════════════════════════════════════════════════
  // The disclosure in the shell says nothing here is financial advice. This is what keeps that true.
  //
  // It is a word list, which means it is crude and will not catch a careful violation. It is not
  // aimed at a careful one: the way this line gets crossed is a warm draft written by somebody being
  // helpful — "the safest thing is to buy a little every month" — and every phrase below is from
  // that register rather than from a lawyer's.
  // ══════════════════════════════════════════════════════════════════════════════════════════════
  const FORBIDDEN: readonly (readonly [RegExp, string])[] = [
    [/\bguaranteed?\b/i, 'nothing about a coin is guaranteed'],
    [/\bAPY\b|\bAPR\b/, 'a rate of return is an offer, not an explanation'],
    [/\brisk[- ]free\b/i, 'nothing here is risk-free'],
    [/\bsafe investment\b/i, 'no investment is described as safe'],
    [/\byou should (buy|sell|invest|put)\b/i, 'this publication does not tell anybody what to buy'],
    [/\bwe recommend (buying|selling|holding|investing)\b/i, 'a recommendation is advice'],
    [/\bwill (double|triple|moon|go up|rise)\b/i, 'nothing here forecasts a price'],
    [/\bprice target\b|\bto the moon\b/i, 'this is not a trading desk'],
    [/\bcan(not|.t) lose\b/i, 'people lose crypto; this archive has an article about it'],
  ]
  const offences: string[] = []
  for (const article of ARTICLES) {
    for (const { where, text } of proseOf(article)) {
      for (const [pattern, why] of FORBIDDEN) {
        if (pattern.test(text)) offences.push(`${article.slug} ${where}: ${why} — "${text.slice(0, 120)}"`)
      }
    }
  }
  assert.deepEqual(offences, [], 'an article offers a return, a forecast or a recommendation')
})

test('THE BODY IS SHAPED LIKE AN ARTICLE', () => {
  for (const article of ARTICLES) {
    const [first, ...rest] = article.body
    assert.ok(first, `${article.slug} has no body`)
    assert.equal(first.kind, 'lead', `${article.slug} does not open with a lead paragraph`)
    assert.ok(
      !rest.some((block) => block.kind === 'lead'),
      `${article.slug} has a second lead; there is one opening paragraph per article`,
    )

    // Heading ids are written down rather than slugified, because they are fragments: a link to
    // `#how-people-lose-it` in somebody's bookmark must survive the heading being reworded.
    // `src/lib/toc.ts` explains the decision; this is what stops two of them colliding, which would
    // silently send every link to the first.
    // `flatMap` rather than `filter().map()`: a filter predicate does not narrow the union for the
    // map that follows, so `.id` would not typecheck on a `Block`.
    const ids = article.body.flatMap((block) => (block.kind === 'h2' || block.kind === 'h3' ? [block.id] : []))
    assert.equal(new Set(ids).size, ids.length, `${article.slug} has two headings with one id`)
    for (const id of ids) assert.match(id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `${id} is not a clean fragment`)

    for (const { where, text } of proseOf(article)) {
      assert.ok(text.trim().length > 0, `${article.slug} ${where} is empty`)
      // A string of HTML in a content file is an injection site that looks like prose. Nothing here
      // reaches `dangerouslySetInnerHTML` — `renderInline()` builds React elements and React escapes
      // text — so an angle bracket would render as literal characters rather than as markup. This
      // fails it at the source anyway, because prose containing `<b>` is prose somebody expected to
      // become markup.
      assert.doesNotMatch(text, /<[a-zA-Z/!]/, `${article.slug} ${where} contains raw HTML`)
      // Unbalanced emphasis renders as a stray asterisk in the middle of a published sentence.
      assert.equal(
        (text.match(/\*\*/g) ?? []).length % 2,
        0,
        `${article.slug} ${where} has an unclosed **bold**`,
      )
      assert.equal((text.match(/`/g) ?? []).length % 2, 0, `${article.slug} ${where} has an unclosed code span`)
    }
  }
})

test('EVERY LINK IN AN ARTICLE GOES SOMEWHERE THAT EXISTS', () => {
  // ══════════════════════════════════════════════════════════════════════════════════════════════
  // A link in prose is the one thing in this repository that can rot without anybody touching it.
  //
  // Internal ones are checked against the corpus, so renaming a topic breaks the build rather than
  // the archive. And no article may name a hostname: the estate's addresses are composed from the
  // page's own host so that the testnet copy links within itself, and a literal
  // `https://forge.cloudsforge.online` in an essay is a hole straight through that, permanently, in
  // a file nobody re-reads.
  // ══════════════════════════════════════════════════════════════════════════════════════════════
  for (const article of ARTICLES) {
    for (const { where, text } of proseOf(article)) {
      for (const match of text.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)) {
        // `?? ''` because a capture group is `string | undefined` to the compiler even when the
        // pattern cannot match without it. An empty label or href then fails the assertions below,
        // which is the right outcome for a link that somehow arrived without one.
        const label = match[1] ?? ''
        const href = match[2] ?? ''
        assert.ok(label.trim().length > 0, `${article.slug} ${where} has a link with no label`)
        assert.ok(isAllowedHref(href), `${article.slug} ${where} links to ${href}, which is refused`)
        assert.doesNotMatch(
          href,
          /cloudsforge\.online/,
          `${article.slug} ${where} names a hostname; link relatively so the testnet archive links to itself`,
        )
        if (href.startsWith(`/${ARTICLE_PREFIX}/`)) {
          // A fragment or a query on an internal link is legitimate — `/a/slug#how-people-lose-it`
          // is how one article points at a section of another — and it is not part of the slug.
          const slug = href.slice(ARTICLE_PREFIX.length + 2).split(/[#?]/)[0] ?? ''
          assert.ok(articleBySlug(slug), `${article.slug} ${where} links to the article ${slug}, which does not exist`)
          assert.notEqual(slug, article.slug, `${article.slug} ${where} links to itself`)
        }
        if (href.startsWith('/topics/')) {
          const slug = href.slice('/topics/'.length).split(/[#?]/)[0] ?? ''
          assert.ok(tagBySlug(slug), `${article.slug} ${where} links to the topic ${slug}, which does not exist`)
        }
      }
    }
  }
})

test('THE SEARCH INDEX CONTAINS EVERY KIND OF BLOCK', () => {
  // `searchText()` flattens the body through a `switch`, and a `switch` over a union is where a new
  // block kind gets forgotten. The failure is quiet in the worst way: search keeps working, and the
  // article whose answer is inside a callout stops being findable by the words in it.
  for (const article of ARTICLES) {
    const haystack = searchText(article).toLowerCase()
    for (const { where, text } of proseOf(article)) {
      // The hero's alt text is the one piece of prose deliberately outside the index. It describes
      // a picture for somebody who cannot see it, not the argument of the article, and indexing it
      // makes an essay findable by the contents of its illustration. A FIGURE's alt and caption ARE
      // indexed — those sit inside the body and carry part of the point.
      if (where === 'hero alt') continue
      const run = text.replace(/[*`[\]()]/g, ' ').split(/\s+/).filter((word) => word.length > 4)[0]
      if (!run) continue
      assert.ok(
        haystack.includes(run.toLowerCase()),
        `${article.slug} ${where} is not in the search index — check the switch in searchText()`,
      )
    }
  }
})

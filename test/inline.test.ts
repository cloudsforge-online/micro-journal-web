/**
 * The four-form inline language, and the one thing it does to a href on the way out.
 *
 * ════════════════════════════════════════════════════════════════════════════════════════════════
 * THIS FILE WAS CITED BY THREE OTHERS BEFORE IT EXISTED, WHICH IS ITS OWN SMALL LESSON.
 *
 * `src/lib/inline.tsx` says "`test/inline.test.ts` holds the list" about the accepted href shapes,
 * and again that `isAllowedHref` is "exported because `test/inline.test.ts` walks every link in
 * every article through it"; `test/no-build-time-config.test.ts` points a reader here for why a
 * typed hostname in a content file is a defect. All three were written in good faith and all three
 * named a file nobody had written. The walk over the articles was real — it is in
 * `test/content.test.ts` — but the tokeniser's own behaviour was covered nowhere, and a comment
 * that names a test is a claim a reader believes without checking.
 *
 * So it exists now, and it is where the MOUNT belongs. `linkHref()` is the whole of what the apex
 * consolidation changed in this module: the authoring convention did not move, and an author still
 * writes `[…](/a/some-other-piece)` and means the article of that name. Applying `/journal` on the
 * way out of the tokeniser is what keeps that true, and it is invisible in every other test here
 * because every other test reads a page that was rendered rather than a link that was authored.
 * ════════════════════════════════════════════════════════════════════════════════════════════════
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { isAllowedHref, isExternal, linkHref, stripInline, tokenizeInline } from '../src/lib/inline.tsx'
import { BASE } from '../src/lib/routes.ts'

/** The `link` tokens of `text`, which is what both renderers actually walk. */
function links(text: string): readonly { readonly text: string; readonly href: string }[] {
  return tokenizeInline(text).flatMap((token) =>
    token.kind === 'link' ? [{ text: token.text, href: token.href }] : [],
  )
}

describe('the accepted href shapes', () => {
  it('THE LIST, WHICH IS THREE THINGS LONG', () => {
    for (const href of ['/a/custody', '/topics/mining', '/', 'https://example.test/x', '#footnote-1']) {
      assert.ok(isAllowedHref(href), `${href} should be accepted`)
    }
  })

  it('refuses the shapes an HTML-escaping renderer does not save you from', () => {
    // A href becomes an ATTRIBUTE rather than markup, so React's escaping never sees it as a
    // string to escape — `javascript:` is the oldest injection in the book and it survives.
    // `//evil.example` is the subtle one: it looks like a path and is a protocol-relative URL to
    // somebody else's origin, which is why `isAllowedHref` checks the second character.
    for (const href of [
      'javascript:alert(1)',
      'JavaScript:alert(1)',
      'data:text/html,<script>',
      'vbscript:msgbox',
      '//evil.example/a',
      'http://example.test/x',
      'a/custody',
    ]) {
      assert.ok(!isAllowedHref(href), `${href} should be refused`)
    }
  })

  it('a refused link keeps the sentence and drops the link', () => {
    // The reader gets the words they were meant to read. The fallback lives in the TOKENISER so
    // that the page and the feed cannot disagree about it — neither renderer implements it.
    const tokens = tokenizeInline('read [the note](javascript:alert) first')
    assert.deepEqual(
      tokens.map((token) => token.kind),
      ['text', 'text', 'text'],
    )
    assert.equal(stripInline('read [the note](javascript:alert) first'), 'read the note first')
  })

  it('A href CANNOT CONTAIN A CLOSING PAREN, and the failure is visible in the prose', () => {
    // ══════════════════════════════════════════════════════════════════════════════════════════════
    // A limitation found by writing this file, recorded rather than fixed.
    //
    // `\(([^)]+)\)` stops at the FIRST `)`, so a Wikipedia-shaped URL — the everyday case — is cut
    // in half: the href loses its tail and the remainder lands in the sentence as literal text.
    //
    // It is left alone because of how it fails. The stray `)` is sitting in the middle of a
    // published paragraph where a writer reading their own draft cannot miss it, and the truncated
    // href is very unlikely to resolve. Compare the alternative — a balanced-paren scanner, which is
    // more parser than this language has ever wanted, in the one module whose whole argument is that
    // it is small enough to be obviously correct. `test/content.test.ts` walks every authored link
    // through `isAllowedHref`, so the day an article needs one of these, this test is the note
    // explaining what to do about it.
    // ══════════════════════════════════════════════════════════════════════════════════════════════
    const [link] = links('see [the article](https://en.wikipedia.org/wiki/Merkle_tree_(hash)) here')
    assert.ok(link)
    assert.equal(link.href, 'https://en.wikipedia.org/wiki/Merkle_tree_(hash')
    assert.ok(stripInline('see [the article](https://en.wikipedia.org/wiki/x_(y)) here').endsWith(') here'))
  })
})

describe('linkHref applies the mount, and applies it to one shape only', () => {
  it('A SITE-RELATIVE PATH GETS THE MOUNT, WHICH IS THE ENTIRE MIGRATION INSIDE THIS MODULE', () => {
    // ══════════════════════════════════════════════════════════════════════════════════════════════
    // A leading slash in a content file means "somewhere in this publication", and it meant the same
    // thing when the publication was a hostname. What changed underneath it is that a leading slash
    // now resolves against the APEX — where micro-site answers — so an untouched `/a/custody` in the
    // middle of a paragraph is a link from one article to the marketing site's 404 page.
    //
    // That is the worst class of link to get wrong. It is inside published prose, it renders
    // perfectly, it is in the RSS body as well as on the page, and the author who wrote it cannot
    // reasonably be asked to track where the estate happens to be serving this surface from.
    // ══════════════════════════════════════════════════════════════════════════════════════════════
    assert.equal(linkHref('/a/custody'), `${BASE}/a/custody`)
    assert.equal(linkHref('/topics/mining'), `${BASE}/topics/mining`)
    // The home page is the one path where the mount is not a prefix but the whole answer: `/` must
    // become `/journal` and never `/journal/`, which is what `publicPath()` special-cases and what
    // `test/routes.test.ts` holds the nginx side of.
    assert.equal(linkHref('/'), BASE)
  })

  it('AN EXTERNAL URL AND A FRAGMENT ARE LEFT ALONE, EACH FOR ITS OWN REASON', () => {
    // Prefixing somebody else's site would be nonsense; a fragment resolves against whatever page
    // the reader is already on, which is by definition the right one.
    assert.equal(linkHref('https://bitcoin.org/bitcoin.pdf'), 'https://bitcoin.org/bitcoin.pdf')
    assert.equal(linkHref('#how-custody-works'), '#how-custody-works')
    // And a protocol-relative URL is not a path, so it must not be treated as one. It never reaches
    // here from the tokeniser — `isAllowedHref` refuses it first — but this function is exported and
    // the two guards are one line apart in the source, which is exactly how they drift.
    assert.equal(linkHref('//evil.example/a'), '//evil.example/a')
  })

  it('IS APPLIED ONCE, IN THE TOKENISER, SO NEITHER RENDERER HAS TO REMEMBER', () => {
    // The page renders React elements; `syndication.ts` composes a string for the feed's
    // `content:encoded`. Two renderers reaching for the mount separately is how a feed comes to
    // carry a different address than the page for the same sentence.
    const [link] = links('see [the custody piece](/a/custody) for the detail')
    assert.ok(link)
    assert.equal(link.href, `${BASE}/a/custody`)
    assert.equal(link.text, 'the custody piece')
  })

  it('does not double the mount on a path that already carries it', () => {
    // Not a shape an author should write — the convention is router-relative — but if one does, the
    // failure must be a link to a real page rather than `/journal/journal/a/custody`. This is
    // asserted rather than implemented: `publicPath()` is a prefix, so this test is the thing that
    // would go red if the convention were ever quietly changed to "write the public path".
    assert.equal(linkHref(`${BASE}/a/custody`), `${BASE}${BASE}/a/custody`)
  })

  it('THE MOUNT DOES NOT MAKE AN INTERNAL LINK LOOK EXTERNAL', () => {
    // `isExternal` decides `target="_blank"` and `rel="noopener noreferrer"`. It answers on the
    // MOUNTED href, because that is what the token carries, and it must still say "internal" — a
    // publication that opens its own cross-references in new tabs leaves a reader with nine of them.
    const [internal] = links('see [the custody piece](/a/custody)')
    const [external] = links('see [the paper](https://bitcoin.org/bitcoin.pdf)')
    assert.ok(internal && external)
    assert.equal(isExternal(internal.href), false)
    assert.equal(isExternal(external.href), true)
  })
})

describe('the four forms', () => {
  it('parses each one, and does not nest', () => {
    assert.deepEqual(
      tokenizeInline('a **bold** and *italic* and `code` here').filter((t) => t.kind !== 'text'),
      [
        { kind: 'strong', text: 'bold' },
        { kind: 'em', text: 'italic' },
        { kind: 'code', text: 'code' },
      ],
    )
    // ══════════════════════════════════════════════════════════════════════════════════════════════
    // THE NO-NESTING RULE, AND WHAT IT ACTUALLY DOES — WHICH IS NOT WHAT THE MODULE SAID IT DID.
    //
    // `inline.tsx` claimed `**bold with *italic* inside**` "renders as bold text containing literal
    // asterisks". It does not, and could not: `\*\*[^*]+\*\*` cannot match a run with a `*` in it,
    // so the bold alternative never fires at all. What the one pass finds instead is `*bold with *`
    // and `* inside*` — TWO italic runs, the word that was meant to be emphasised left plain between
    // them, and a stray asterisk at each end.
    //
    // Pinned as the real output rather than the intended one, because the intended one is the
    // version somebody would "restore" by adding a nesting pass. The behaviour is still acceptable
    // for the same reason as the paren above: it is loud. A writer previewing the paragraph sees
    // asterisks and the wrong words in italics, which is a draft problem rather than a published one.
    // ══════════════════════════════════════════════════════════════════════════════════════════════
    assert.deepEqual(tokenizeInline('**bold with *italic* inside**'), [
      { kind: 'text', text: '*' },
      { kind: 'em', text: 'bold with ' },
      { kind: 'text', text: 'italic' },
      { kind: 'em', text: ' inside' },
      { kind: 'text', text: '*' },
    ])
  })

  it('an asterisk inside a code span stays an asterisk', () => {
    // The reason this is ONE alternation rather than four passes. A second pass over the output
    // would re-read `*` inside the code span as emphasis.
    assert.deepEqual(
      tokenizeInline('run `a * b` twice').filter((t) => t.kind !== 'text'),
      [{ kind: 'code', text: 'a * b' }],
    )
  })

  it('stripInline gives the reader the words without the asterisks', () => {
    // Three callers that cannot take elements: a `<meta>` attribute, the search excerpt, and the
    // word count. All three would otherwise show the markup.
    assert.equal(
      stripInline('a **bold** [link](/a/custody) and `code`'),
      'a bold link and code',
    )
  })
})

/**
 * The tab icon is the company's. The link preview is this publication's own. That split is the
 * decision this file pins, and it is the opposite of the call every other frontend in the estate
 * makes.
 *
 * ── WHY A SEPARATE HOSTNAME NEEDS ANY ASSETS AT ALL ───────────────────────────────────────────
 *
 * "A browser tab and a shared link inherit nothing" (`brand/plan.ts`). Favicons are per-origin and
 * an og card is per-URL, so `journal.<apex>` gets a blank tab and a blank link preview unless it
 * carries its own copies — no matter what the apex serves.
 *
 * ── THE FAVICONS ARE BORROWED, BECAUSE A TAB ICON SAYS WHOSE SITE THIS IS ─────────────────────
 *
 * micro-brand has no `journal` set: there is no `brand/assets/journal/` directory and no `journal`
 * entry in the plan. Generating one from a frontend repository is the one place brand assets must
 * never come from, so the icon is CloudsForge's own ridge-and-flame — which is not a compromise
 * here but the right answer. A favicon is 16 logical pixels in a strip of twenty tabs; the only
 * thing it can usefully say at that size is which company's site this is, and it is ours.
 *
 * ── THE OG CARD IS NOT BORROWED, AND THAT IS THIS SURFACE'S WHOLE ARGUMENT ────────────────────
 *
 * Every other frontend takes CloudsForge's og card too, and for every other frontend that is right:
 * a link to Forge Create is a link to a product inside a company, and the card should say the
 * company. This surface is different in the one way that matters — IT IS THE ONE PEOPLE SHARE. An
 * article's whole reason to exist is to be sent to somebody who has never heard of us, and the card
 * is the entire first impression in that message. The company's ridge-and-flame under a headline
 * about losing your crypto reads as an advertisement someone pasted, which is the thing the article
 * spends 2,000 words not being.
 *
 * So `scripts/make-assets.ts` draws this surface's own: the publication's rule, in the journal's
 * bronze, with the wordmark. It is a GENERATED asset committed to the repository rather than a
 * hand-export — the script is in the repository, it runs from HTML and CSS, and re-running it
 * reproduces the bytes. That is a different thing from re-exporting an icon in a frontend repo,
 * which is what the rule below exists to prevent, and the difference is that nothing here claims to
 * be a brand asset. It claims to be a picture of an article.
 *
 * The favicon bytes are compared IN BOTH DIRECTIONS against the sibling checkout, so "copied from
 * brand" stays true rather than becoming "copied from brand once, in March". And the absence of
 * `brand/assets/journal/` is asserted too, so the day micro-brand generates one is the day a test
 * tells somebody to come back here and swap them.
 */
import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'
import { ACCENT_SURFACE } from '../src/lib/hosts.ts'
import { ARTICLES } from '../src/content/index.ts'
import { ROOT, SIBLINGS, read, stripComments } from './sources.ts'

const INDEX_HTML = read('index.html')
const HTML = stripComments(INDEX_HTML, 'html')
const DOCKERFILE = stripComments(read('Dockerfile'), 'nginx')
const PUBLIC = join(ROOT, 'public')

/** The tab icons, which are CloudsForge's own bytes. */
const BORROWED = ['favicon-32x32.png', 'favicon-192x192.png', 'favicon-512x512.png'] as const

/** The link preview, which is this publication's. */
const OWN = 'og-1200x630.png'

/**
 * micro-brand's checkout, or null.
 *
 * Absent for somebody who cloned only this repository, and the comparison then cannot run. CI
 * checks the sibling out (see `.github/workflows/ci.yml`) and FAILS THE JOB if it is missing, so
 * this skip cannot become a permanent silence on the runner — which is where it would matter.
 */
function brandDir(): string | null {
  const dir = join(SIBLINGS, 'brand/assets/site')
  return existsSync(dir) ? dir : null
}

test('the three tab icons are byte-identical to CloudsForge’s own', (t) => {
  const dir = brandDir()
  if (!dir) return t.skip('micro-brand is not checked out beside this repository')

  for (const asset of BORROWED) {
    const ours = readFileSync(join(PUBLIC, asset))
    const theirs = readFileSync(join(dir, asset))
    assert.ok(
      ours.equals(theirs),
      `public/${asset} differs from brand/assets/site/${asset}. These are copies rather than ` +
        `originals: a divergence here means somebody re-exported an icon in a frontend repository, ` +
        `which is where brand assets must never be made.`,
    )
  }
})

test('THE OG CARD IS THIS SURFACE’S OWN, AND IS DELIBERATELY NOT THE COMPANY’S', (t) => {
  const dir = brandDir()
  if (!dir) return t.skip('micro-brand is not checked out beside this repository')

  // ════════════════════════════════════════════════════════════════════════════════════════════
  // The inverse of the assertion above, and the only one of its kind in the estate.
  //
  // If somebody "fixes" this surface by copying the company card over the generated one — which is
  // the obvious repair, because it is what the other eleven frontends do and it makes this file
  // look consistent with theirs — every article shared from here starts previewing as a corporate
  // link. Nothing breaks, no page changes, and the loss is entirely off-site, in a message someone
  // else sent. That is a change that could survive a review, so it gets a test rather than a
  // comment.
  // ════════════════════════════════════════════════════════════════════════════════════════════
  const ours = readFileSync(join(PUBLIC, OWN))
  const company = readFileSync(join(dir, OWN))
  assert.ok(
    !ours.equals(company),
    `public/${OWN} is now byte-identical to CloudsForge's own card. This surface draws its own — ` +
      `see scripts/make-assets.ts — because an article is shared with people who have never heard ` +
      `of the company, and the company's card on that link reads as an advertisement. Re-run ` +
      `\`pnpm assets\` to restore it.`,
  )

  // And it is the size every preview fetcher crops to, which is the check that catches a card
  // regenerated at some other dimension. Read from the PNG header rather than from the script that
  // wrote it, so this measures the committed bytes.
  const png = readFileSync(join(PUBLIC, OWN))
  assert.equal(png.readUInt32BE(16), 1200, `${OWN} is not 1200 wide`)
  assert.equal(png.readUInt32BE(20), 630, `${OWN} is not 630 tall`)
})

test('THERE IS STILL NO JOURNAL BRAND SET, WHICH IS WHY THE ICONS ARE BORROWED', (t) => {
  if (!brandDir()) return t.skip('micro-brand is not checked out beside this repository')
  assert.equal(
    existsSync(join(SIBLINGS, 'brand/assets/journal')),
    false,
    'brand/assets/journal/ now exists. That is good news and it retires half a decision: this ' +
      "surface borrows CloudsForge's own favicons only because micro-brand had no set for the " +
      'journal. Copy the journal icons into public/ and update the argument in index.html. The og ' +
      'card is a separate question and the answer there does not change — it is generated per ' +
      'article by scripts/make-assets.ts, and a brand set does not have one of those.',
  )
})

test('public/ carries the chrome, the article art, and nothing else', () => {
  // A mark or a wordmark is NOT one of the artefacts a separate hostname needs as a FILE — the
  // masthead draws its own in markup — and adding one should be a decision rather than a reflex.
  assert.deepEqual(readdirSync(PUBLIC).sort(), [...BORROWED, OWN, 'articles'].sort())
  assert.doesNotMatch(HTML, /mark-|wordmark-|social-/)

  // Every article has a directory, and every directory belongs to an article. The second direction
  // is the one that matters after a piece is renamed: the slug is the URL, a renamed slug leaves
  // its old art behind, and the orphan then ships in the image forever with nothing pointing at it.
  const dirs = readdirSync(join(PUBLIC, 'articles'))
    .filter((entry) => statSync(join(PUBLIC, 'articles', entry)).isDirectory())
    .sort()
  assert.deepEqual(dirs, ARTICLES.map((article) => article.slug).sort())

  for (const dir of dirs) {
    for (const file of ['card.png', 'hero.png']) {
      assert.ok(
        existsSync(join(PUBLIC, 'articles', dir, file)),
        `public/articles/${dir}/${file} is missing — run \`pnpm assets\``,
      )
    }
  }
})

test('index.html links four icons and exactly one og block', () => {
  const icons = [...HTML.matchAll(/<link[^>]+rel="(?:icon|apple-touch-icon)"[^>]*>/g)]
  assert.equal(icons.length, 4, 'index.html should link three icon sizes plus the apple-touch icon')
  for (const tag of icons) {
    const href = /href="\/([^"]+)"/.exec(tag[0])?.[1]
    assert.ok(href && BORROWED.includes(href as (typeof BORROWED)[number]), `${href} is not in public/`)
  }

  // ONE og block, not two. foresight-web declares og:type, og:title and og:description twice; the
  // second set silently wins in every crawler and the first is dead text nobody edits. Counted per
  // property so a duplicate cannot hide behind a differently ordered second block.
  for (const property of ['og:type', 'og:title', 'og:description', 'og:image']) {
    const count = [...HTML.matchAll(new RegExp(`property="${property}"`, 'g'))].length
    assert.equal(count, 1, `index.html declares ${property} ${count} times`)
  }

  // ════════════════════════════════════════════════════════════════════════════════════════════
  // THE CARD URL IS ABSOLUTE, WHICH IS THE OPPOSITE OF WHAT THE REST OF THIS BUNDLE DOES.
  //
  // Every other URL here is relative or composed at runtime, so one image serves localhost, testnet
  // and mainnet. `og:image` cannot be: the fetchers that read it — Slack, WhatsApp, iMessage,
  // Discord, LinkedIn — do not run the page, and the ones that do not resolve a relative URL simply
  // show no image. There is no error and no fallback; the link arrives as a bare grey rectangle,
  // and the surface whose entire distribution is people sending each other links loses it silently.
  //
  // So the value is written as `__CF_ORIGIN__` — a LITERAL placeholder on disk, substituted by
  // nginx per request with `https://$host`. That is what makes an absolute URL and a
  // build-once-serve-anywhere image the same thing rather than a contradiction. `nginx.conf` holds
  // the substitution and `test/routes.test.ts` holds the three lines that make it work.
  // ════════════════════════════════════════════════════════════════════════════════════════════
  assert.match(HTML, /property="og:image" content="__CF_ORIGIN__\/og-1200x630\.png"/)
  assert.match(HTML, /name="twitter:image" content="__CF_ORIGIN__\/og-1200x630\.png"/)
  assert.doesNotMatch(
    HTML,
    /(?:og|twitter):image" content="\//,
    'a root-relative og:image is invisible to most link-preview fetchers; use __CF_ORIGIN__',
  )
})

test('THE ACCENT SELECTOR THIS PAGE NAMES REALLY EXISTS', () => {
  // The check that catches a silent fall-through either way. A product with no block in tokens.css
  // falls back to the company ember in complete silence — which tokens.css calls out by name: "a
  // silent fallthrough is a latent bug, so every key an app may set is declared". `admin` had this
  // defect and `explorer` still does. `journal` got its block with its registry row, and this is
  // what proves the two arrived together.
  const tokens = readFileSync(join(ROOT, 'node_modules/@cloudsforge/ui/src/tokens.css'), 'utf8')
  const named = /data-cf-product="([a-z-]+)"/.exec(HTML)?.[1]
  assert.equal(named, ACCENT_SURFACE, 'index.html and ACCENT_SURFACE disagree about the accent ramp')
  assert.ok(
    tokens.includes(`[data-cf-product='${named}']`),
    `tokens.css has no [data-cf-product='${named}'] block, so this page falls through to the ` +
      `company ember with nothing to say so`,
  )
  // The other two attributes are set statically on <html> for the same reason: a page that paints
  // before they land flashes the default ramp and then changes colour.
  assert.match(HTML, /data-cf-substrate="warm"/)
  assert.match(HTML, /data-cf-scheme="auto"/)
})

test('THE IMAGE ACTUALLY CONTAINS public/', () => {
  // The web template's Dockerfile once did not copy public/ into the build context, so four
  // frontends shipped an image with no icon in it while their own brand test passed. Committing the
  // bytes and serving them are two different claims, and only the second one a reader can see.
  //
  // It matters more here than it did there: `public/articles/` is 4 MB of committed art that every
  // article's `<img>` and every link preview points at, so a missing COPY is not a blank tab icon
  // but five broken pictures in the middle of the prose.
  assert.match(DOCKERFILE, /COPY\s+public\s+\.\/public/)
})

test('color-scheme is spelled the way the standard spells it', () => {
  // Not the way English does. It is not a registered meta name under any other spelling, so a
  // misspelling is INERT rather than wrong — explorer-web shipped `colour-scheme` for months and
  // drew light form controls on a dark page the whole time. This surface has a search input on its
  // own route and in the masthead, so the same defect would be visible immediately.
  assert.match(HTML, /<meta name="color-scheme" content="dark light" \/>/)
  assert.doesNotMatch(HTML, /colour-scheme/)
})

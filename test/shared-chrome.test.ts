/**
 * What this shell takes from the design system, and the two places it deliberately differs.
 *
 * ════════════════════════════════════════════════════════════════════════════════════════════════
 * THE BAR IS HERE BECAUSE THE EXCHANGE LEFT IT OUT AND THE OWNER FOUND IT.
 *
 * Until 2026-08-16 `exchange-web` asserted the OPPOSITE of the test below — that the bar was
 * absent — behind a long and internally consistent argument: the bar renders an account control,
 * nothing on that surface needs an account, so mounting it would imply one. The owner found the
 * conclusion the way a reader would:
 *
 *   "i tried url directly its open but it has no login bar on top"
 *
 * The mistake was treating the bar as an authorisation mechanism. It is the estate's CHROME — the
 * product switcher, the network switcher, the CloudsForge home link, the handle of whoever is
 * signed in — and a page that drops it does not read as "no account needed", it reads as a page
 * that fell off the estate.
 *
 * That lesson is worth MORE here than it was there, and this file exists to say so before the same
 * argument is made again on better grounds. This surface has the strongest possible case for
 * dropping the bar — there is no `micro-journal`, no service to call, nothing to sign in for, and
 * every page is a static file — and it is also THE SURFACE STRANGERS ARRIVE ON FIRST, from a search
 * result or a link somebody sent them. The bar is the only thing on the page that tells them the
 * other twelve surfaces exist. Dropping it here would not cost an account control; it would cost
 * the entire reason a company publishes.
 *
 * ── AND TWO THINGS THIS SHELL DOES DIFFERENTLY, BOTH PINNED BELOW ────────────────────────────────
 *
 *   1. THERE IS NO `key={viewed}` ON THE OUTLET. Every other viewing surface remounts its tree when
 *      the network changes, because its numbers come from a chain. An essay is byte-identical on
 *      both networks, so there is nothing to re-read and a remount would only throw the reader back
 *      to the top of the article they were in the middle of.
 *   2. THERE IS NO CUSTODY NOTICE, because nothing here holds anything. What replaces it is a
 *      standing disclosure of a different kind — who writes this and what it is not — and it is in
 *      the shell for the same reason the exchange's was: a page-level notice is the one somebody
 *      forgets on the fourth page.
 * ════════════════════════════════════════════════════════════════════════════════════════════════
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { FOOTER_LEGAL_LINKS } from '@cloudsforge/ui'
import { FOOTER_GROUPS, surface } from '@cloudsforge/ui/surfaces'
import { PRODUCT } from '../src/lib/hosts.ts'
import { read, readSibling, stripComments } from './sources.ts'

const SHELL = stripComments(read('src/components/shell.tsx'), 'ts')
const SHELL_RAW = read('src/components/shell.tsx')

/** What the shell imports from the design system, as written. */
function imported(): string[] {
  const line = /import \{([^}]*)\} from '@cloudsforge\/ui'/.exec(SHELL)?.[1] ?? ''
  return line.split(',').map((name) => name.trim()).filter(Boolean)
}

test('the shell takes the shared chrome', () => {
  // Every one of these is a component the estate has already got wrong by hand somewhere. The skip
  // link becomes VISIBLE on focus — a hidden one is worse than none, because the reader activates
  // it and cannot tell whether anything happened. `MainRegion` is the target it skips to, and on a
  // publication that is the single most-used control on the page for anybody reading with a
  // keyboard: the masthead has nine links in front of every article.
  //
  // `CookieBanner` is the only place the analytics tag is ever injected, which is what keeps a
  // cookie from being set before consent. It matters more here than on any other surface because of
  // WHAT a page view on this one reports: the title of something somebody read. "Nine ways people
  // lose crypto" attached to a browser is a more intimate fact than a pool address, and an archive
  // that reports it before asking is a worse trade than an archive with no numbers.
  //
  // `CloudsForgeLogo` is NOT in this list, and its absence is not a regression: the bar renders the
  // logo itself, linked to the marketing site, and two CloudsForge home links in one header is not
  // a smaller defect than none. The masthead below the bar draws the PUBLICATION's name, which is a
  // different claim.
  for (const name of ['SkipLink', 'MainRegion', 'CookieBanner']) {
    assert.ok(imported().includes(name), `src/components/shell.tsx does not use ${name}`)
    assert.ok(SHELL.includes(`<${name}`), `${name} is imported and never mounted`)
  }
  assert.ok(
    !SHELL.includes('<CloudsForgeLogo'),
    'the shell draws its own logo beside the bar’s, which is two home links in one header',
  )
})

test('THE SHARED FOOTER IS MOUNTED, AND THERE IS NO LOCAL ONE LEFT BESIDE IT', () => {
  assert.ok(imported().includes('CloudsForgeFooter'))
  assert.ok(SHELL.includes('<CloudsForgeFooter'))
  // `current` is what marks this surface in its own footer and what the base line renders the name
  // and blurb from. Passed as the same constant the meta is derived from, so the key is written
  // once in this repository.
  assert.match(SHELL, /<CloudsForgeFooter[\s\S]*?current=\{PRODUCT\}/)
  // A second `<footer>` in the document is two landmarks with the same role, which a screen reader
  // announces twice and neither one names.
  assert.ok(!/<footer\b/.test(SHELL), 'src/components/shell.tsx writes a local <footer>')
  assert.ok(!/jn-foot/.test(SHELL), 'a local footer’s classes survive without the footer')
})

test('THE STANDING DISCLOSURE IS IN THE SHELL, SO NO PAGE CAN BE WITHOUT IT', () => {
  // ══════════════════════════════════════════════════════════════════════════════════════════════
  // The exchange puts a custody notice above the outlet. There is nothing to custody here, and the
  // equivalent obligation is a different one: a reader of a COMPANY'S PUBLICATION is owed two facts
  // before they weigh a sentence — who wrote this, and what it is not.
  //
  // It is in the shell rather than on the pages for exactly the reason the exchange's is. A
  // page-level notice is the one somebody forgets to add to the fourth page, and the page it gets
  // forgotten on is whichever one a stranger arrives at from a search result. Here that is not a
  // hypothetical: nobody navigates to an archive, they land on ONE article, and the shell is the
  // only thing guaranteed to be under it.
  //
  // Both claims are also chosen to be ones that CANNOT GO STALE, which is the property a footer
  // needs and the reason there is nothing else in it. "We are not neutral about our own products"
  // and "nothing here is financial advice" are true of every article this publication will ever
  // run; a claim about what we currently build would be a claim in a footer nobody re-reads.
  // ══════════════════════════════════════════════════════════════════════════════════════════════
  // Unwrapped before matching: the prose is wrapped by the formatter, so a sentence that reads as
  // one line in the file is several in the source and a regex over the raw bytes finds neither.
  const raw = /note=\{([\s\S]*?)\n {8}\}/.exec(SHELL)?.[1]
  assert.ok(raw, 'the shared footer is mounted without a `note`')
  const note = raw.replace(/\s+/g, ' ')
  assert.match(note, /not neutral about our own products/)
  assert.match(note, /Nothing here is financial advice, an offer, or a promise of return/)
  assert.match(note, /\{PUBLICATION\}/, 'the note names the publication with a literal')

  // Above the outlet there is exactly one conditional notice, and it is about PLACEMENT rather than
  // about money — see the test below. Nothing else is allowed to grow into a standing banner over
  // an article: a page of writing with a permanent box on top of it is a page people scroll past.
  const region = SHELL.indexOf('<MainRegion')
  const inside = SHELL.slice(SHELL.indexOf('>', region) + 1, SHELL.indexOf('<Outlet'))
  assert.equal([...inside.matchAll(/<[A-Z]/g)].length, 1, 'a second banner has appeared over the article')
})

test('THE FOOTER’S LEGAL LINKS ARE MICRO-SITE ROUTES THAT REALLY EXIST', (t) => {
  // The footer composes these itself, from `FOOTER_LEGAL_LINKS` against `hosts.site` read INSIDE the
  // component — which means nothing in this repository would notice if a path stopped resolving.
  //
  // status-web recorded the estate paying for exactly that: two footer links broken since the day
  // they were written, because a hand-typed `/terms` never became the `/legal/terms` micro-site
  // actually served. So this reads micro-site's router and checks each path against it rather than
  // assuming the shared constant and the shared site agree.
  assert.ok(FOOTER_LEGAL_LINKS.length > 0)
  const app = readSibling('site/src/app.tsx')
  if (!app) return t.skip('micro-site is not checked out beside this repository')
  for (const link of FOOTER_LEGAL_LINKS) {
    const segment = link.path.replace(/^\//, '')
    assert.match(
      app,
      new RegExp(`path=["'](/)?${segment}["']`),
      `the footer links to ${link.path} and site/src/app.tsx has no route for it`,
    )
  }
})

test('THE ESTATE’S BAR IS MOUNTED, WITH A REAL ACCOUNT BEHIND IT', () => {
  assert.ok(
    imported().includes('CloudsForgeBar'),
    'src/components/shell.tsx does not mount CloudsForgeBar. exchange-web shipped without it once ' +
      'and the owner reported it: "it has no login bar on top". The bar is the estate’s chrome — ' +
      'the product switcher, the network switcher, the home link and the reader’s handle — not an ' +
      'authorisation mechanism, so "nothing here needs an account" is not a reason to drop it. On ' +
      'THIS surface it is also the only thing telling a stranger the rest of the estate exists.',
  )
  assert.match(SHELL, /<CloudsForgeBar[\s\S]*?current=\{PRODUCT\}/)

  // A bar wired to a literal is a bar that renders a signed-out control to a signed-in reader
  // forever, which is indistinguishable from the defect this arrangement fixed. The account comes
  // from the provider, and both handlers are passed: `onSignIn` alone leaves a reader unable to
  // leave — and on a publication, somebody who signed in on another surface and then followed a
  // link here is the ordinary case rather than the rare one.
  assert.match(SHELL, /account=\{account\}/)
  assert.match(SHELL, /onSignIn=/)
  assert.match(SHELL, /onSignOut=/)
  assert.match(SHELL, /useSession\(\)/)

  // And the footer sees the same reader. It filters `adminOnly` surfaces on `account.roles`, so a
  // footer given nothing hides the operator tools from the operator the bar above it is greeting by
  // name — which is the drift a shared component exists to prevent.
  assert.match(SHELL, /<CloudsForgeFooter[\s\S]*?account=\{account\}/)
})

test('THIS SURFACE IS OUT OF THE PRODUCT MENU ON PURPOSE, AND IS REACHABLE ANYWAY', () => {
  // ══════════════════════════════════════════════════════════════════════════════════════════════
  // The one place this file's answer differs from exchange-web's, and it has to be argued rather
  // than asserted, because the shape of the mistake is identical to a real defect the estate has
  // already paid for.
  //
  // `inSwitcher: false` is what the pool row also carries, and `surfaces.ts` records what that cost
  // when nothing else linked it: the marketing site advertised the pool in prose, every route to it
  // 404'd, and the two surfaces that do not mount the shared footer were the two that needed it. So
  // "not in the switcher" is only safe when something ELSE is structurally certain to link it.
  //
  // Here that is the case twice over, and both are registry facts rather than somebody's diligence:
  // `servesUi: true` puts this row in `FOOTER_SURFACES`, so every bundle that mounts the shared
  // footer — which is every bundle but `site` and `network-site` — links it without being told; and
  // the marketing site carries it in the map and the tiles.
  //
  // The reason it is not in the switcher is the accent guard. The switcher is where a person picks
  // a PRODUCT, and `surfaces.test.ts` holds `SWITCHER_SURFACES` to a strict bijection with
  // `PRODUCT_ACCENTS` under a dE 30 adjacency gate. A seventh hue does not clear it — the sweep
  // that produced this bronze and the agora's orchid is written up in `tokens.css` — and weakening
  // a colour-accessibility guard so a publication can appear in a product menu is not a trade this
  // estate makes. A publication is also not a product: it is where you read about them.
  // ══════════════════════════════════════════════════════════════════════════════════════════════
  const here = surface(PRODUCT)
  assert.equal(here.key, 'journal')
  assert.equal(here.subdomain, 'journal')
  assert.equal(here.inSwitcher, false, 'the journal is in the product switcher; see the accent guard')
  assert.equal(here.accent, '#ae7b3d')
  assert.equal(here.servesUi, true)

  // THE STRUCTURAL LINK, ASSERTED. This is the half the pool did not have.
  const platform = FOOTER_GROUPS.find((group) => group.kind === 'surface')
  assert.ok(platform, 'the footer no longer has a Platform column')
  assert.ok(
    platform.surfaces.some((s) => s.key === PRODUCT),
    'the journal is neither in the switcher nor in the footer, which is how the pool became ' +
      'unreachable from every surface in the estate at once',
  )

  // And it views in place rather than teleporting, which is what makes the network switch in the
  // bar above an article safe. `lib/hosts.ts` records the reversal: without this flag, pressing
  // Testnet halfway through a piece throws the reader onto Forge Network.
  assert.equal(here.viewsAnyNetwork, true)
})

test('NOTHING ON THIS SURFACE IS GATED, WHICH IS WHAT THE BAR IS NOT FOR', () => {
  // The premise the exchange's old argument got right, kept here as a check rather than as prose.
  // The bar greets a reader; it must never decide what one can read.
  //
  // There is no `micro-journal` and no service base to send a bearer to. `src/content/` is the whole
  // backend, and the day an archive needs a service to serve an essay is the day it acquired a
  // database that can disagree with the repository. If one ever appears, this goes red on the day it
  // does rather than on the day somebody notices in review.
  const hosts = stripComments(read('src/lib/hosts.ts'), 'ts')
  assert.doesNotMatch(
    hosts,
    /apiBase/,
    'src/lib/hosts.ts has grown an apiBase(). An article is committed source; a service base is ' +
      'how a session quietly becomes load-bearing.',
  )

  // No route consults the reader, and no page renders differently for one. `account &&` in a page is
  // the ordinary way a "sign in to read the rest" appears, and it appears one component at a time.
  for (const name of ['about', 'article', 'home', 'not-found', 'search', 'topic', 'topics']) {
    const page = stripComments(read(`src/pages/${name}.tsx`), 'ts')
    assert.doesNotMatch(page, /useSession|account\s*&&|signIn/, `src/pages/${name}.tsx reads the session`)
  }
  assert.doesNotMatch(stripComments(read('src/app.tsx'), 'ts'), /ProtectedRoute|RequireAuth/)

  // The shell's own header carries the argument, because the person who meets this decision next is
  // reading the shell rather than this file — and it must be THIS surface's version of it. The
  // reasoning must not be borrowed from the console it was first written for: micro-pool's version
  // turns on a bearer token and a mining address, neither of which exists here, and a reason a
  // reader can disprove in ten seconds gets the decision reversed for a bad cause.
  const header = SHELL_RAW.slice(0, SHELL_RAW.indexOf('import '))
  assert.match(header, /CloudsForgeBar|bar/)
  assert.match(header, /search result/i, 'the shell does not say where its readers come from')
  assert.doesNotMatch(header, /mining address|micro-pool/)
})

test('THE NETWORK SWITCH IS WIRED, AND THE OUTLET DELIBERATELY DOES NOT REMOUNT', () => {
  // The switch itself is the bar's, wired to real state, and `onSelect` is what makes it re-point
  // this page instead of navigating to a second deployment — without it the bar falls back to an
  // `elsewhere` link, which is the exact defect task #136 exists to remove.
  assert.match(SHELL, /networkSwitch=\{\{/)
  assert.match(SHELL, /selected: viewed/)
  assert.match(SHELL, /onSelect: \(n\) =>/)
  assert.match(SHELL, /setViewedNetwork\(/)
  assert.ok(!SHELL.includes('<NetworkSwitcher'), 'a second network switcher beside the bar’s')
  assert.ok(!SHELL.includes('<TestnetBand'), 'a second testnet band beside the bar’s')

  // ══════════════════════════════════════════════════════════════════════════════════════════════
  // AND NO `key={viewed}`, WHICH IS THE OPPOSITE OF WHAT EVERY OTHER VIEWING SURFACE DOES.
  //
  // There the key is load-bearing: the numbers come from a chain, a switch that changed state
  // without remounting would relabel the page while leaving the other network's balances on it, and
  // that is the worst of the three possible outcomes.
  //
  // Here there is no read to redo. An article is the same bytes on both networks — this bundle
  // makes no chain call at all, which `test/no-build-time-config.test.ts` asserts directly — so the
  // remount would buy nothing and cost the one thing a reader of a 2,000-word piece cannot afford
  // to lose: their place in it. Pressing a switch in the chrome and being returned to the top of
  // the article is indistinguishable from the page having crashed.
  //
  // Asserted as an ABSENCE plus an explanation, because an absence alone is what a well-meaning
  // consistency pass adds back in an afternoon.
  // ══════════════════════════════════════════════════════════════════════════════════════════════
  assert.ok(
    !/<Outlet\s+key=/.test(SHELL),
    'the outlet remounts on a network switch. On this surface there is nothing to re-read and the ' +
      'remount only throws the reader back to the top of the article they were in the middle of.',
  )
  assert.match(
    SHELL_RAW.slice(0, SHELL_RAW.indexOf('import ')),
    /key.*Outlet|Outlet.*key/s,
    'the shell no longer explains why its outlet has no key, which is the state in which somebody ' +
      'adds one back for consistency',
  )
})

test('every estate link in the shell is composed by the REGISTRY, through this repository’s wrapper', () => {
  // There is no local correction — `hosts()` is a one-line pass to `cloudsforgeHosts()`. The
  // indirection stays because it is the seam a test can stub and because the day this surface needs
  // a placement rule again, there is one place for it. Importing the registry function directly
  // here would spread that decision one import at a time.
  assert.ok(!imported().includes('cloudsforgeHosts'))
  assert.match(SHELL, /import \{[^}]*\bhosts\b[^}]*\} from '\.\.\/lib\/hosts\.ts'/)
})

test('THE SHELL SAYS SO WHEN IT CANNOT WORK OUT WHERE IT IS', () => {
  // A page whose every outbound link is silently one level too deep is worse than a page that
  // admits it does not know where it is. It is a smaller problem here than anywhere else — no
  // article needs a host to be readable — and the notice stays anyway, because an unregistered
  // placement is also the placement whose `__CF_ORIGIN__` substitution nginx never ran, so it is
  // the one where a canonical tag may still be carrying a literal placeholder.
  assert.ok(SHELL.includes('placementIsKnown'))
  assert.ok(SHELL.includes('<UnregisteredNotice'))
})

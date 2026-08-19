/**
 * Where this bundle thinks it is, and — mostly — what it does NOT talk to.
 *
 * ════════════════════════════════════════════════════════════════════════════════════════════════
 * THE LARGEST THING THIS FILE CHECKS IS AN ABSENCE.
 *
 * Every other frontend in the estate resolves a CloudsForge service. `src/lib/hosts.ts` here has no
 * `apiBase()`, no `resolveApiBase()` and no dev port for a service, because there is no
 * `micro-journal` and there is not going to be one: an article is committed source, `src/content/`
 * is the entire backend, and the day an archive needs a service to serve an essay is the day it
 * acquired a database that can disagree with the repository, silently, on one host.
 *
 * An absence with no test on it is a decision that has already been forgotten. So the shape of this
 * module is asserted directly — the day somebody adds an API base here, this file is what says why
 * it does not belong, in the place they are already looking.
 *
 * This bundle composes NO remote address at all, which is one fewer than the exchange this
 * repository was forked from: that surface still reached a public JSON-RPC. Here the only URLs are
 * the estate's own, from the registry, plus the absolute ones the prerender writes as
 * `__CF_ORIGIN__` for nginx to substitute per request. `test/seo.test.ts` pins those.
 * ════════════════════════════════════════════════════════════════════════════════════════════════
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { Window } from 'happy-dom'
import { KNOWN_SUBS, SURFACES, surface } from '@cloudsforge/ui/surfaces'
import {
  ACCENT_SURFACE,
  APP_NAME,
  hosts,
  isLocal,
  placementIsKnown,
  PRODUCT,
  SURFACE_DESCRIPTION,
} from '../src/lib/hosts.ts'
import { read, stripComments } from './sources.ts'

/**
 * Run `fn` as though the bundle were being served from `url`.
 *
 * A window rather than a hand-built map of estate URLs, deliberately. The functions under test read
 * `window.location` and hand it to `cloudsforgeHosts()`, and the defect this pattern exists to catch
 * — every sibling address resolved one level too deep, which pool-web shipped for a fortnight —
 * lived entirely in that composition. A test that passed in its OWN idea of what the registry
 * composes would have agreed with the bug it was written to catch, which is the failure mode of
 * every fixture that restates the thing it is checking.
 */
function atPage<T>(url: string, fn: () => T): T {
  const win = new Window({ url })
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'window')
  Object.defineProperty(globalThis, 'window', { value: win, configurable: true, writable: true })
  try {
    return fn()
  } finally {
    if (previous) Object.defineProperty(globalThis, 'window', previous)
    else delete (globalThis as { window?: unknown }).window
  }
}

test('THE REGISTRY SAYS THIS SURFACE SERVES A PAGE, WHICH IS WHAT MADE THIS REPOSITORY LEGAL', () => {
  const journal = surface(PRODUCT)

  // ══════════════════════════════════════════════════════════════════════════════════════════════
  // A FOLDER ON THE APEX, WHICH IS TWO FIELDS AND NOT ONE.
  //
  // `subdomain: ''` alone would place this bundle AT the apex, which belongs to micro-site;
  // `basePath` alone cannot be set without a subdomain to hang it off. Together they are the
  // registry's whole statement that the journal is `https://<apex>/journal` — wave 1 of the
  // consolidation in micro-deploy `docs/apex-consolidation.md`.
  //
  // Both halves are asserted because either one on its own is a live defect rather than a partial
  // migration: `subdomain: ''` with no `basePath` makes `hosts().journal` the marketing site, and
  // every footer link in the estate that says "Forge Journal" then lands on the home page.
  //
  // `journal` is NOT in KNOWN_SUBS any more, and that is the half with a consequence outside this
  // row. KNOWN_SUBS is what `cloudsforgeHosts()` strips to derive the apex, so a stale entry would
  // make `journal.<apex>` — the hostname the gateway now redirects — resolve every sibling under
  // the apex as though it were a live surface address, keeping the retired name working just well
  // enough that nobody notices it is retired.
  // ══════════════════════════════════════════════════════════════════════════════════════════════
  assert.equal(journal.subdomain, '')
  assert.equal(journal.basePath, '/journal')
  assert.equal(KNOWN_SUBS.has('journal'), false)

  // `servesUi` is what puts the journal in the shared footer's columns at all, and it is a claim
  // about the world rather than about this repository: it says a hostname answers. It goes true in
  // ONE commit with the gateway router, the compose service, the cloudflared ingress and the
  // `EXPECTED_UNROUTED` deletion in `deploy/scripts/surface-routes.py`, which checks the claim from
  // both directions. This assertion is the frontend's half of that.
  assert.equal(journal.servesUi, true)

  // `viewsAnyNetwork` is not decoration either, and it is the flag I first left off and was wrong
  // to. The argument for omitting it was that an article is byte-identical on both networks, so
  // there is nothing for a network switch to switch. That confuses the DATA with the CONTROL: the
  // flag decides what the estate bar's Testnet button does, and unflagged it throws a reader
  // halfway through an article out onto Forge Network.
  //
  // IT SURVIVED THE MOVE TO A FOLDER, which is worth an assertion of its own because the obvious
  // reading of the registry says it should not have. The invariant `network-view.test.ts` held was
  // "every row with `servesUi` and no `basePath` views in place", and every `basePath` row it was
  // written against — `wallet`, `signin`, `faucet` — is a ROUTE INSIDE another surface's bundle,
  // which is why it has no network view of its own to switch. This one is not: it is a separate
  // bundle the gateway mounts at a path, it shares a devPort with nothing, and it is served by its
  // own container. So the predicate upstream became `servesOwnBundle()` rather than `!basePath`,
  // and this row keeps the flag it earned.
  assert.equal(journal.viewsAnyNetwork, true)

  // NOT in the switcher, which is the opposite of the call the exchange made and is decided by a
  // different question. The exchange was missing from the product menu and a reader could not reach
  // it; that was a defect, reported in those words. The journal is not a product a reader switches
  // TO — it is where people ARRIVE, from a search result, and it is reached from the footer and the
  // marketing site's map by anyone already inside.
  //
  // The constraint behind the argument is real and worth writing down, because it is what would
  // have decided this even if the argument had gone the other way: `surfaces.test.ts` holds every
  // switcher entry to a distinct hue under a dE 30 adjacency gate, and a seventh product hue does
  // not clear it. The bronze below is a SURFACE accent, measured against the estate's palette and
  // against the agora's orchid under normal, deuteranopic and protanopic simulation — that last
  // measurement being the one the estate's method did not previously make, and the one that killed
  // the first pair I picked, at dE 0.8 from each other.
  assert.equal(journal.inSwitcher, false)
  assert.equal(journal.accent, '#ae7b3d')

  // No mark of its own, which is why public/ borrows CloudsForge's chrome. See brand-chrome.test.
  assert.equal(journal.markId, null)
})

test('THE DEV PORT IS THIS BUNDLE’S OWN SERVER, BECAUSE THERE IS NO SERVICE TO NAME', () => {
  // ══════════════════════════════════════════════════════════════════════════════════════════════
  // The registry's standing rule is that a devPort is A FACT ABOUT THE THING YOU CALL, restated
  // three times in surfaces.ts because three rows got it wrong (foresight carried beacon's 4011,
  // emberkin carried 3014 while binding 4100, admin carried 3002 while admin-api binds 4014).
  //
  // Here there is nothing to call, so the number is this repository's vite server — 5196 — which is
  // the only address that answers for `journal` on a developer's machine and therefore the only
  // true thing it can be. `exchange` set that precedent for a UI-only row and the reason was the
  // same one.
  //
  // The number itself was picked by reading every sibling `vite.config.ts` rather than by
  // incrementing: this file arrived from exchange-web carrying 5194, WHICH IS EXCHANGE-WEB'S, and
  // two frontends on one port is not a bind error you notice once. Whichever `pnpm dev` starts
  // second fails and whichever started first goes on answering, so the symptom is the exchange
  // being served at the journal's address.
  //
  // Read off both files rather than written down here, so the pair cannot drift: `pnpm dev` binds
  // what vite.config.ts says, and every sibling frontend links to what the registry says.
  // ══════════════════════════════════════════════════════════════════════════════════════════════
  const vite = stripComments(read('vite.config.ts'), 'ts')
  const declared = /server:\s*\{\s*port:\s*(\d+)\s*\}/.exec(vite)?.[1]
  assert.equal(
    Number(declared),
    surface(PRODUCT).devPort,
    'vite.config.ts and the surface registry disagree about the port this bundle serves on, so a ' +
      'local link to the Forge Journal resolves to a port nothing is listening on',
  )
  // And the preview server agrees with the dev server, because `pnpm preview` is what a reviewer
  // opens to look at a production build — and on THIS surface that build is the prerendered one, so
  // the preview server is the only place the static HTML a crawler receives is ever looked at by a
  // person. A second number there is a second thing to get wrong.
  assert.match(vite, /preview:\s*\{\s*port:\s*5196\s*\}/)
})

test('THIS SURFACE DOES NOT CALL A CLOUDSFORGE SERVICE, AND SAYS SO BY HAVING NO WAY TO', () => {
  // ══════════════════════════════════════════════════════════════════════════════════════════════
  // The absence, asserted where somebody about to undo it will read it.
  //
  // Adding an `apiBase()` here would not break a test that checks behaviour, because at first it
  // would have no caller. It would break the claim: an article on this surface is a file that was
  // written when the build was, reviewed in a pull request like anything else, and identical on
  // every origin that serves it. The first fetch makes that false — not visibly, and not at once,
  // but from then on the page a reader gets depends on what one host's database happens to hold.
  //
  // It is also the load-bearing assumption of `scripts/prerender.ts`. Static HTML for every route
  // is only possible because every route's content is knowable at build time; a service call is the
  // step that turns this repository back into a client-rendered app with an SEO problem, which is
  // the problem it exists to not have.
  //
  // Comments are stripped first, because the module ARGUES for the absence at length and a grep
  // over the raw bytes would match the argument and fail a correct file — see `test/sources.ts`.
  // ══════════════════════════════════════════════════════════════════════════════════════════════
  const code = stripComments(read('src/lib/hosts.ts'), 'ts')
  for (const forbidden of [/apiBase/, /API_DEV_PORT/, /['"`]\/v1/, /fetch\s*\(/]) {
    assert.doesNotMatch(
      code,
      forbidden,
      'src/lib/hosts.ts has grown a way to call a CloudsForge service; there is no micro-journal, ' +
        'and the surface’s whole argument is that there does not need to be one',
    )
  }

  // And the rule that makes every branch below meaningful: nothing here holds a literal estate
  // address, so an image built once is correct on localhost, on testnet and on mainnet. The
  // `rules` CI job greps for the same names without stripping comments, which is why this module
  // never spells one out even to argue against it.
  assert.ok(!/cloudsforge\.online/.test(code), 'src/lib/hosts.ts must not contain an estate hostname')
  assert.ok(!/import\.meta\.env/.test(code), 'src/lib/hosts.ts must not read build-time configuration')
})

test('the app name and the accent are this surface’s own', () => {
  assert.equal(APP_NAME, 'journal-web')
  // `journal` is a real block in tokens.css, added with the registry row. Naming a product with no
  // block falls through to the company ember in complete silence, which is the defect `admin` had
  // and `explorer` still has; `test/brand-chrome.test.ts` reads the CSS and proves the selector
  // this page names exists upstream.
  assert.ok(SURFACES.some((s) => s.key === ACCENT_SURFACE))
})

test('the description says what the writing IS, and then what it is not', () => {
  // A stranger arriving from a search result is guarding against two things — jargon and a sales
  // pitch — and a crypto publication is presumed guilty of both before it is read. So the sentence
  // spends its second half denying them, and "nothing to sign up for" is last because it is the
  // clause that decides the click. `test/seo.test.ts` compares this byte for byte with index.html;
  // this checks the sentence itself, which that comparison cannot.
  assert.ok(SURFACE_DESCRIPTION.startsWith('Plain-language crypto writing'))
  assert.ok(SURFACE_DESCRIPTION.includes('No jargon'))
  assert.ok(SURFACE_DESCRIPTION.includes('nothing to sign up for'))
  // Under 160 characters, which is where a search result truncates. Not a rule of the estate's — a
  // rule of the surface a search engine renders, which is this repository's whole subject and
  // therefore the one place in the estate where it is worth asserting.
  assert.ok(SURFACE_DESCRIPTION.length <= 160, `description is ${SURFACE_DESCRIPTION.length} chars`)
  // No hostname, for the same reason nothing else in src/ carries one.
  assert.ok(!/cloudsforge\.online/.test(SURFACE_DESCRIPTION))
})

test('the four development hostnames are the same four the design system treats as local', () => {
  for (const local of ['', 'localhost', '127.0.0.1', 'dev.local', 'journal.local']) {
    assert.equal(isLocal(local), true, local)
  }
  for (const remote of ['journal.cloudsforge.online', 'localhost.cloudsforge.online', 'notlocal']) {
    assert.equal(isLocal(remote), false, remote)
  }
})

test('THE REGISTRY PLACES THIS SURFACE AT A FOLDER ON THE APEX, IN BOTH ENVIRONMENT SHAPES', () => {
  // ══════════════════════════════════════════════════════════════════════════════════════════════
  // THE ADDRESS, READ BACK OFF THE REGISTRY AND NOT WRITTEN DOWN TWICE.
  //
  // `hosts().journal` is what every sibling frontend in the estate links to, what the footer's
  // Forge Journal entry resolves and what `isRegisteredPlacement()` compares against. It is the
  // apex plus `/journal` now, on both networks, and the only thing that changes between them is
  // the label in front of the apex.
  // ══════════════════════════════════════════════════════════════════════════════════════════════
  assert.equal(
    atPage('https://cloudsforge.online/journal', () => hosts()[PRODUCT]),
    'https://cloudsforge.online/journal',
  )
  assert.equal(atPage('https://cloudsforge.online/journal', placementIsKnown), true)
  // A reader deep inside the archive is still correctly placed. This is the assertion that would
  // fail if the check ever went back to comparing whole paths rather than the mount.
  assert.equal(atPage('https://cloudsforge.online/journal/a/some-article', placementIsKnown), true)

  // THE TESTNET SHAPE IS THE APEX PREFIX NOW, and the suffix shape is what the move retired.
  // `journal-testnet.<apex>` existed because Cloudflare's Universal SSL wildcard matches exactly
  // ONE label, so a surface could not take a second one; an apex-mounted surface needs neither —
  // `testnet.<apex>/journal` is one label and one path, and the certificate covers it.
  assert.equal(
    atPage('https://testnet.cloudsforge.online/journal', () => hosts()[PRODUCT]),
    'https://testnet.cloudsforge.online/journal',
  )
  assert.equal(atPage('https://testnet.cloudsforge.online/journal', placementIsKnown), true)

  // And a testnet page composes TESTNET siblings. The failure this rules out is the quiet one: a
  // testnet hostname resolving to the mainnet apex, where every link works and points at the other
  // network. Here that lands on the footer and on every in-article link to a product — an essay
  // that tells a reader to go and try the faucet, linking them at the mainnet one.
  assert.match(atPage('https://testnet.cloudsforge.online/journal', () => hosts().site), /testnet/)

  // A local checkout is always placed — the registry resolves every surface to a localhost port,
  // and `vite.config.ts`'s `base` puts the bundle under `/journal` there too.
  assert.equal(atPage('http://localhost:5196/journal', placementIsKnown), true)
})

test('AN ADDRESS THE REGISTRY CANNOT PLACE SAYS SO INSTEAD OF GUESSING', () => {
  // ══════════════════════════════════════════════════════════════════════════════════════════════
  // Served from a name the registry cannot strip, the whole name becomes the apex and every estate
  // URL on the page resolves one level too deep. On most surfaces that is cosmetic: a footer link
  // 404s, which is what it is here too — no article needs a host to be readable.
  //
  // The notice stays anyway, for a reason specific to this surface: an unregistered placement is
  // ALSO the placement whose `__CF_ORIGIN__` substitution nginx never ran, because that
  // substitution is a rule in this repository's own nginx.conf and a bundle served from somewhere
  // else is served by something else. So it is the one placement where a canonical tag may still
  // carry a literal placeholder — and the person who needs to know is whoever put the bundle there.
  //
  // ── AND THE MOVE TO A FOLDER IS WHY THE CHECK READS THE PATH ──────────────────────────────────
  //
  // The first case below is the one that stopped working silently. `some-preview.example.net` is
  // its own apex — there is no known label to strip — so `hosts().journal` composes
  // `https://some-preview.example.net/journal`, whose ORIGIN is the page's own. An origin-against-
  // origin check therefore answered "known" for every unregistered host in existence, which is the
  // worst kind of regression: a guard that still runs, still passes, and can no longer fail.
  //
  // The path is what carries the fact now. This bundle's assets are baked at `/journal/assets/…`,
  // so a copy served at the root of a preview host is broken whatever its hostname, and that is
  // exactly what the first assertion catches.
  // ══════════════════════════════════════════════════════════════════════════════════════════════
  assert.equal(atPage('https://some-preview.example.net/', placementIsKnown), false)
  // Another surface's hostname is not this one either: `hub` IS known, so the apex comes out right
  // and every link works — but this bundle is not what belongs there, and saying so is cheaper than
  // leaving somebody to wonder why the journal is being served from the hub.
  assert.equal(atPage('https://hub.cloudsforge.online/', placementIsKnown), false)
  // The apex root is not the journal either, and this is the case a folder created. Nothing in the
  // estate should serve this bundle at `/` — that address belongs to micro-site — and a gateway
  // router that sent it there would otherwise look correct from inside the page.
  assert.equal(atPage('https://cloudsforge.online/', placementIsKnown), false)
  // NOR A PATH THAT MERELY STARTS WITH THE SAME LETTERS. `/journalism` is a different folder, and
  // a bare `startsWith` on the base URL would call it this one.
  assert.equal(atPage('https://cloudsforge.online/journalism', placementIsKnown), false)
  // The retired hostname, during the redirect period and after it. A bundle actually SERVED there
  // is misplaced — the gateway's job is to 301 that name at the folder, not to answer from it.
  assert.equal(atPage('https://journal.cloudsforge.online/', placementIsKnown), false)
})

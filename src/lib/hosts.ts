/**
 * Where this app talks to, resolved at runtime from `window.location`, never from a build-time
 * constant.
 *
 * ════════════════════════════════════════════════════════════════════════════════════════════════
 * THIS SURFACE HAS NO `apiBase()`, AND THE ABSENCE IS THE POINT.
 *
 * Every other frontend in the estate resolves a CloudsForge service to call. There is no
 * `micro-journal` service and there is not going to be one. An article is committed source —
 * `src/content/` is the entire backend — and the day an archive needs a service to serve an essay
 * is the day it acquired a database that can disagree with the repository, silently, on one host.
 * What a reader gets here is a file that was written when the build was, reviewed in a pull request
 * like anything else, and identical on every origin that serves it.
 *
 * What is left is what every bundle needs: which surface this is, whether the address it is being
 * served from is one the registry knows, and where its siblings are.
 * ════════════════════════════════════════════════════════════════════════════════════════════════
 */
import { cloudsforgeHosts, type CloudsForgeHosts, type SurfaceKey } from '@cloudsforge/ui'

/**
 * The surface this application IS.
 *
 * `journal`, registered as a `surface` with `inSwitcher: false`, accent `#ae7b3d` and glyph `❧`.
 * **`markId: null`**, which is a decision rather than a gap: micro-brand has no `journal` set,
 * nothing in this bundle renders a mark, and `test/brand-chrome.test.ts` asserts there is none to
 * render.
 *
 * `subdomain: ''` WITH `basePath: '/journal'`, which is the registry saying in one line that this
 * publication is a FOLDER on the apex rather than a hostname — wave 1 of the consolidation argued
 * in micro-deploy `docs/apex-consolidation.md`. Everything the estate composes about this surface
 * follows from those two fields, and `src/lib/routes.ts` is where the consequence inside this
 * repository is written down.
 *
 * NOT `inSwitcher`, and the reason is written out in `surfaces.ts`: the switcher is where a person
 * chooses a PRODUCT, and the accent guard holds products to a strict bijection with
 * `PRODUCT_ACCENTS` under a dE 30 adjacency gate that a seventh hue cannot clear. The journal is
 * reached from the footer, from the marketing site's map, and — mostly — from a search result,
 * which is the entrance this whole repository is built around.
 *
 * `viewsAnyNetwork: true`, which is the flag I first left off and was wrong to. The argument for
 * omitting it was that an article is byte-identical on both networks, so there is nothing for a
 * network switch to switch; `signin`, `wallet` and `faucet` looked like precedent. They are not —
 * all three are `basePath` rows, reached under another surface's hostname. The invariant
 * `network-view.test.ts` actually holds is that every row with `servesUi` and no `basePath` views
 * in place, and the flag is about what the TESTNET BUTTON DOES rather than about the data behind
 * it. Unflagged, a reader who presses Testnet halfway through an article is thrown out of the
 * article and onto Forge Network — which is the exact defect the estate spent task #136 removing.
 */
export const PRODUCT: SurfaceKey = 'journal'

/** The name reported to the observability ingest and shown in error copy. */
export const APP_NAME = 'journal-web'

/**
 * The accent block this page's `<html>` names.
 *
 * `journal` is a real selector in `ui/packages/ui/src/tokens.css`, added with the registry row on
 * 2026-08-17. The bronze `#ae7b3d` was chosen jointly with the agora's orchid against every colour
 * the estate already ships, under normal, deuteranopic and protanopic simulation, and against each
 * other — that last measurement being the one the estate's method did not previously make, and the
 * one that killed the first pair I picked at dE 0.8.
 *
 * Naming a product with no block would fall through to the company ember in complete silence, which
 * is the exact failure tokens.css calls out and the one `admin` had and `explorer` still has.
 * `test/brand-chrome.test.ts` asserts the selector this page names really exists upstream, which is
 * the check that catches a fall-through either way.
 */
export const ACCENT_SURFACE = 'journal'

/**
 * The sentence a search result carries, declared ONCE.
 *
 * It says what the writing IS and then says what it is not, because the two things a stranger
 * arriving from a search result is guarding against are jargon and a sales pitch, and a crypto
 * publication is presumed guilty of both. "Nothing to sign up for" is last because it is the line
 * that decides the click.
 *
 * IT FITS IN 160 CHARACTERS, which is why it reads "Plain-language crypto writing" rather than the
 * more natural "Plain-language writing about crypto" it was first written as. That version was 177
 * and a search result would have cut it mid-clause — at "No jargon, no price…", which turns the
 * sentence's whole second half into a fragment that reads like a boast rather than a promise. On
 * every other surface this budget is a nicety. Here the search result IS the product's front door,
 * so `test/hosts.test.ts` asserts the length and this comment is why.
 *
 * `test/seo.test.ts` compares this byte for byte with the description meta in `index.html`, so the
 * copy a link-preview fetcher gets — those generally do not execute JavaScript — cannot drift from
 * the copy a crawler that does execute JavaScript ends up with. On this surface that check is worth
 * more than on any other: the prerender writes a description into every article file too, and the
 * same test walks `dist` to confirm each one came from the article rather than from this default.
 */
export const SURFACE_DESCRIPTION =
  'Plain-language crypto writing: what it is, how people lose it, and what CloudsForge builds on ' +
  'its own chain. No jargon, no price talk, nothing to sign up for.'

/** The same four names `cloudsforgeHosts()` treats as development. Kept in step by test. */
export function isLocal(hostname: string): boolean {
  return (
    hostname === '' ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.endsWith('.local')
  )
}

/**
 * Whether this bundle is being served from the address the surface registry places it at.
 *
 * `cloudsforgeHosts()` derives the apex by stripping a KNOWN first label. Served from an unknown
 * name — a preview deployment, somebody's tunnel — the whole name becomes the apex and every
 * CloudsForge URL derived from it resolves one level too deep. The app still renders, because every
 * route here is public and nothing on this surface is a security boundary; but it says so, once, in
 * the shell.
 *
 * It is a smaller problem here than anywhere else in the estate, and the notice stays anyway. No
 * article needs a host to be readable; only the footer's links to the rest of the estate do. But an
 * unregistered placement is also the placement whose `__CF_ORIGIN__` substitution nginx never ran,
 * so it is the one where a canonical tag may still be carrying a literal placeholder — and the
 * person who needs to know that is whoever put the bundle there.
 *
 * ── IT COMPARES THE WHOLE BASE URL AND NOT THE ORIGIN, AND THE MOUNT IS WHY ──────────────────────
 *
 * This was `new URL(estate[PRODUCT]).origin === pageOrigin` for as long as the journal was a
 * hostname, and that comparison stopped being able to fail the day it became a folder. The registry
 * now places this surface at the APEX — `subdomain: ''`, `basePath: '/journal'` — so the origin it
 * composes is whatever apex `cloudsforgeHosts()` just derived from the page's own hostname, and a
 * preview deployment at `pr-42.example.dev` is its own apex. Origin against origin was therefore
 * comparing a value with itself: every unregistered placement in existence answered "known", which
 * is the shape of check that reads as a guard and is one only in the case it was written for.
 *
 * The PATH is what still carries the information. A correctly-placed bundle is served under
 * `/journal` — it is what `vite.config.ts`'s `base` bakes into every asset href and what the
 * Dockerfile copies the build into — so a page whose own address is not at or beneath
 * `estate.journal` is a bundle whose assets cannot resolve, whatever its hostname. `=== base` OR
 * `base + '/'`, rather than a bare `startsWith`, because `/journalism` is not inside `/journal`.
 */
export function isRegisteredPlacement(
  pageUrl: string,
  hostname: string,
  estate: CloudsForgeHosts,
): boolean {
  if (isLocal(hostname)) return true
  if (!pageUrl) return true
  const base = estate[PRODUCT]
  return pageUrl === base || pageUrl.startsWith(`${base}/`)
}

/** Every CloudsForge base URL, for the current environment. */
export function hosts(): CloudsForgeHosts {
  return cloudsforgeHosts()
}

/** The page origin, or a stable placeholder when there is no document (tests, prerender). */
export function pageOrigin(): string {
  return typeof window === 'undefined' ? 'http://localhost' : window.location.origin
}

/**
 * Whether the current address is the one the registry places this surface at. Read by the shell.
 *
 * ORIGIN AND PATHNAME, because the registry's answer for this surface is a folder rather than a
 * host — see `isRegisteredPlacement()` above. No search and no hash: neither is part of where a
 * bundle is mounted, and a reader arriving on `/journal/search?q=…` is at the right address.
 */
export function placementIsKnown(): boolean {
  if (typeof window === 'undefined') return true
  return isRegisteredPlacement(
    `${window.location.origin}${window.location.pathname}`,
    window.location.hostname,
    cloudsforgeHosts(),
  )
}

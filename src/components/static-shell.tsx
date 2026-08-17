/**
 * The shell `scripts/prerender.ts` renders. Smaller than `shell.tsx`, deliberately.
 *
 * ── WHAT IS MISSING, AND WHY EACH ONE IS MISSING ─────────────────────────────────────────────────
 *
 * `CloudsForgeBar` and `CloudsForgeFooter` compose ABSOLUTE URLs to the sibling surfaces, derived at
 * runtime from the hostname the reader is on. At build time there is no hostname. Rendering them
 * here would bake one origin into every file on disk, and that file would then be wrong on the
 * testnet host, wrong on a preview deployment and wrong on a laptop —
 * `test/no-build-time-config.test.ts` fails the build over precisely that string.
 *
 * `CookieBanner` decides what to show from a stored consent choice. A prerendered banner would be
 * markup that is already wrong for every reader who has answered it once.
 *
 * `UnregisteredNotice` asks whether THIS origin is one the registry knows, and at build time there
 * is no origin to ask about.
 *
 * All three come back a moment later, on the client, from `shell.tsx` — where they can read the
 * hostname and the stored choice and be right.
 *
 * ── WHAT IS PRESENT IS EVERYTHING A CRAWLER NEEDS ────────────────────────────────────────────────
 *
 * The skip link, the masthead — the same component the real shell renders, so the navigation cannot
 * drift between the two — and `<main>` with the page inside it. That is the headline, the
 * standfirst, the byline, the whole body, the topics, the related articles and the links between
 * every one of them, all relative and therefore all correct on any origin that serves this
 * directory.
 *
 * `MainRegion` is not used here for the same reason `BrowserRouter` is not: it comes from the
 * `@cloudsforge/ui` barrel, which touches `window` while its modules evaluate. The element it
 * renders is a `<main id="main">`, and that is what this writes.
 */
import { Outlet } from 'react-router-dom'
import { Masthead } from './masthead.tsx'

export function StaticShell() {
  return (
    <>
      {/*
        The skip link is hand-written rather than imported for the barrel reason above. `cf-skip` is
        an upstream class — the estate's stylesheet reveals it on focus — so this is the estate's
        skip link in every way that a reader can perceive.
      */}
      <a className="cf-skip" href="#main">
        Skip to the article
      </a>

      <Masthead />

      <main id="main" className="jn-main">
        <Outlet />
      </main>
    </>
  )
}

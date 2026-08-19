import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

/**
 * There is deliberately no `define`, no `envPrefix` and no `.env` file in this repository.
 *
 * A build-time constant is an environment baked into an image, and an image with an environment
 * baked into it has to be rebuilt to be promoted — which means the artefact that reaches
 * production is not the artefact that passed CI. Every host this app talks to is resolved at
 * RUNTIME from `window.location.hostname`; see `src/lib/hosts.ts`.
 * `test/no-build-time-config.test.ts` fails the build if `import.meta.env.VITE_` ever reappears.
 *
 * ── ON THIS SURFACE THE CONSTANT THAT WANTS TO EXIST IS THE ORIGIN, AND IT IS THE WORST ONE ──────
 *
 * This bundle has no service to call: an article is committed source, and `src/content/` is the
 * whole backend. So the temptation is not `VITE_API_URL` — it is `VITE_SITE_URL`, because SEO needs
 * ABSOLUTE addresses and a relative one will not do. A canonical link, an `og:url`, an RSS `<link>`
 * and the `@id` of a JSON-LD `Article` must each name a scheme and a host, and they are written into
 * static files by `scripts/prerender.ts` at build time, when no host is known.
 *
 * Baking one in fails in the direction that does not look like a failure. The page renders, the
 * card renders, and the canonical tag on `journal-testnet.cloudsforge.online` quietly tells every
 * search engine that the real copy of this article lives on the mainnet host — so the testnet
 * archive is de-indexed in favour of an origin the reader was not on, and every share link from it
 * resolves somewhere else. The same tag on a preview deployment hands a crawler the production URL
 * for a page production does not have.
 *
 * So the prerender writes the literal `__CF_ORIGIN__` wherever an absolute URL belongs, and nginx
 * replaces it with `https://$host` on the way out — per request, per hostname, with no rebuild.
 * See `nginx.conf`, and `test/seo.test.ts`, which asserts no built file carries a cloudsforge
 * hostname and that every placeholder sits in a tag nginx's `sub_filter_types` actually covers.
 */
export default defineConfig({
  plugins: [react()],
  // ── THE MOUNT, AND IT IS NOT A BUILD-TIME CONFIGURATION ─────────────────────────────────────────
  //
  // The paragraph above refuses `define` and `envPrefix` because they bake an ENVIRONMENT into an
  // image. This bakes an ADDRESS, and the distinction is the whole of it: `/journal` is the same on
  // localhost, on testnet, on mainnet and in a preview, because it is a fact about how the estate
  // composes this surface's URLs rather than about which estate is serving it. The origin is still
  // the thing that varies and is still `__CF_ORIGIN__`, filled in per request by nginx.
  //
  // It is `subdomain: ''` + `basePath: '/journal'` in `ui/packages/ui/src/surfaces.ts`, and
  // `src/lib/routes.ts` holds the copy this bundle reads — see `BASE` there for the router-path /
  // public-path distinction that the rest of the repository turns on.
  //
  // TRAILING SLASH REQUIRED. vite joins `base` to an asset name by concatenation, so `/journal`
  // emits `/journalassets/index-a1b2.js` — a 404 for the bundle on every page, with a build that
  // succeeds and a dev server that is unaffected because it serves from memory.
  base: '/journal/',
  resolve: {
    // @cloudsforge/ui is a `link:` dependency, so its own node_modules holds a second copy of
    // React. Two copies means two dispatchers, and the shared bar throws on its first useState.
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    // The linked package is edited in the same working tree until it is published; pre-bundling
    // it would freeze a stale copy.
    exclude: ['@cloudsforge/ui'],
  },
  build: {
    // The assets are immutable-cached by nginx, which is only safe when every rebuild produces a
    // new filename. Sourcemaps so a Lantern stack trace names a line somebody can find.
    sourcemap: true,
  },
  // 5196. The estate's frontends sit in 5170–5199, and this file arrived from exchange-web carrying
  // 5194 — WHICH IS EXCHANGE-WEB'S. Two frontends on one port is not a bind error you notice once
  // and fix: whichever `pnpm dev` starts second fails, and whichever started first goes on
  // answering, so the symptom is the exchange being served at the journal's address. Every sibling
  // `vite.config.ts` was read on 2026-08-17 rather than the number incremented: 5195 is taken, and
  // 5190 is taken TWICE — lantern-web and network-site both bind it, which is the defect this
  // paragraph describes, sitting in the tree right now and filed rather than fixed from here.
  //
  // It is also this surface's `devPort` in `ui/packages/ui/src/surfaces.ts`, which is unusual and
  // deliberate: a devPort is the port of the thing you CALL, and for every other surface that is a
  // service. `exchange` set the precedent for a UI-only row naming its own dev server, and the
  // reason is the same one — there is no `micro-journal` to call, and there is not going to be one,
  // because the day an archive needs a service to serve an essay is the day it acquired a database
  // that can disagree with the repository.
  server: { port: 5196 },
  preview: { port: 5196 },
})

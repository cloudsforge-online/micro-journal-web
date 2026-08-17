/**
 * ════════════════════════════════════════════════════════════════════════════════════════════════
 * THE ARTEFACT THAT PASSED CI IS THE ARTEFACT THAT REACHES PRODUCTION.
 *
 * A `VITE_` variable is read when the bundle is BUILT and frozen into the output. So a bundle built
 * for testnet cannot be promoted to mainnet — it has to be rebuilt, and the thing that reaches
 * production is then a different artefact from the one every gate in this repository examined. The
 * estate's release path pins ONE image per deployable by digest, which quietly assumes the image is
 * environment-free; a `VITE_API_URL` breaks that assumption without breaking any test.
 *
 * Everything this bundle needs to know about where it is comes from `window.location.hostname` at
 * runtime, through `src/lib/hosts.ts`. The two things that are not hosts — the release identifier
 * and the analytics measurement id — are `<meta>` tags in index.html, which the Dockerfile stamps
 * into a copy of the file rather than into the JavaScript.
 *
 * ── ON THIS SURFACE THE RULE HAS TO SURVIVE A THIRD READER: THE PRERENDER ─────────────────────
 *
 * `scripts/prerender.ts` runs at BUILD TIME, in Node, with no `window` and no request. It writes a
 * real HTML file per route, each carrying a canonical URL, an og:url and a JSON-LD `@id` — every one
 * of which has to be ABSOLUTE, because a link-preview fetcher and a search engine both need a whole
 * address. That is the exact shape of the thing this file forbids: a URL decided when the image was
 * built.
 *
 * It is resolved rather than excepted. The prerender writes the literal string `__CF_ORIGIN__`, and
 * nginx substitutes `$scheme://$host` per REQUEST. So the bytes on disk name no estate, the response
 * names exactly the one it was asked for, and one image still serves localhost, a preview, testnet
 * and mainnet. The tests below hold both halves: nothing under `src/` may name a hostname, and the
 * placeholder must survive from the prerender all the way to the file that is served.
 *
 * ── THE SECOND HALF: ONE FILE MAY HOLD A BEARER, AND NOTHING HERE CAN SIGN ───────────────────
 *
 * There is no service behind this surface — no `micro-journal`, no API base, nothing to
 * authenticate to. The one exception is the shared estate bar, which greets a reader by name and
 * therefore makes one `GET /auth/me` against identity:
 *
 *   EXACTLY ONE FILE MAY HOLD A BEARER, AND IT IS `src/lib/session.ts`.
 *
 * Everything else in `src/` is checked as an absence. There is deliberately no `src/lib/rpc.ts`
 * here and no chain call of any kind: the exchange this repository was forked from composed a
 * public JSON-RPC endpoint, and the strictest rules in its copy of this file were about keeping a
 * session away from it. This surface removed the endpoint instead, which is a stronger version of
 * the same guarantee and one that cannot be walked back by an import.
 *
 * The nginx half is UNCHANGED and unconditional: the reflex when a request is refused is to add a
 * header, and the tempting place to add it — an `Authorization` in an nginx `proxy_pass` — puts a
 * CloudsForge service credential inside an image that is built once and promoted to every
 * environment, which is a published credential.
 * ════════════════════════════════════════════════════════════════════════════════════════════════
 */
import assert from 'node:assert/strict'
import { readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { test } from 'node:test'
import { ORIGIN_PLACEHOLDER } from '../src/lib/meta.ts'
import { ROOT, read, stripComments } from './sources.ts'

/** Every source file under src/, with its comments removed. */
function sources(): { path: string; text: string }[] {
  const out: { path: string; text: string }[] = []
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry)
      if (statSync(full).isDirectory()) {
        walk(full)
        continue
      }
      if (!/\.(ts|tsx|css)$/.test(entry)) continue
      out.push({
        path: relative(ROOT, full),
        text: stripComments(read(relative(ROOT, full)), entry.endsWith('.css') ? 'css' : 'ts'),
      })
    }
  }
  walk(join(ROOT, 'src'))
  return out
}

const SRC = sources()
const INDEX_HTML = stripComments(read('index.html'), 'html')
const VITE_CONFIG = stripComments(read('vite.config.ts'), 'ts')
const NGINX = stripComments(read('nginx.conf'), 'nginx')
const DOCKERFILE = stripComments(read('Dockerfile'), 'nginx')
const PRERENDER = stripComments(read('scripts/prerender.ts'), 'ts')

test('NO BUILD-TIME ENVIRONMENT REACHES THIS BUNDLE', () => {
  for (const { path, text } of [...SRC, { path: 'index.html', text: INDEX_HTML }]) {
    for (const forbidden of [/import\.meta\.env/, /\bVITE_[A-Z]/, /\bprocess\.env\b/]) {
      const hit = text.match(forbidden)
      assert.equal(
        hit,
        null,
        `${path} reads ${JSON.stringify(hit?.[0])}. That value is frozen into the artefact at ` +
          `build time, so the image cannot be promoted between environments — the thing that ` +
          `reaches production stops being the thing that passed CI. Derive it from ` +
          `window.location at runtime, in src/lib/hosts.ts.`,
      )
    }
  }
})

test('vite is not configured to inject one either', () => {
  // `define` and `envPrefix` are the two ways to smuggle a build-time constant past the grep above:
  // `define` replaces an arbitrary identifier at transform time, and `envPrefix` widens which
  // variables `import.meta.env` exposes. Neither leaves a `VITE_` in src.
  assert.doesNotMatch(VITE_CONFIG, /\bdefine\s*:/)
  assert.doesNotMatch(VITE_CONFIG, /\benvPrefix\b/)
  assert.doesNotMatch(VITE_CONFIG, /\bloadEnv\b/)
})

test('NO CLOUDSFORGE HOSTNAME IS WRITTEN DOWN IN THIS BUNDLE', () => {
  // A literal hostname is a second, unversioned copy of the surface registry, and the copy is the
  // one that will be wrong. It is also a build-time environment wearing a different hat: an image
  // naming `journal.cloudsforge.online` is an image that only works on one estate.
  //
  // On this surface the rule reaches further than usual, because it covers PROSE. `src/content/`
  // holds five articles that link readers to the faucet, the explorer and their account, and a
  // hostname typed into one of those is a testnet reader sent to mainnet — see `test/inline.test.ts`
  // for the mechanism that keeps them composed instead.
  for (const { path, text } of SRC) {
    const hit = text.match(/[a-z0-9-]+\.cloudsforge\.(online|dev|test)/i)
    assert.equal(
      hit,
      null,
      `${path} names ${JSON.stringify(hit?.[0])}. Hosts are derived from window.location.hostname ` +
        `through src/lib/hosts.ts, so one image serves localhost, a preview and both estates.`,
    )
  }
})

test('THE PRERENDER WRITES A PLACEHOLDER, NOT AN ORIGIN', () => {
  // ══════════════════════════════════════════════════════════════════════════════════════════════
  // The build-time-configuration defect this surface is uniquely exposed to, and the only one that
  // would be invisible on the estate that built the image.
  //
  // Every prerendered file needs absolute URLs — a canonical tag, an og:url, a JSON-LD @id, the
  // feed's <link>, every <loc> in the sitemap. The obvious way to write them is to read an origin
  // when the build runs. Do that and the image is welded to one estate: promoted to testnet it
  // serves pages whose canonical tag points at mainnet, which is not a broken link but something
  // worse — an instruction to a search engine to attribute this page to a different host, and to
  // drop this one from the index as a duplicate.
  //
  // So the prerender writes a LITERAL, and the substitution happens per request in nginx. The rule
  // is mechanical: this script may not read an origin from anywhere, because there is nowhere
  // correct to read one from at the time it runs.
  // ══════════════════════════════════════════════════════════════════════════════════════════════
  assert.equal(ORIGIN_PLACEHOLDER, '__CF_ORIGIN__')
  assert.match(PRERENDER, /ORIGIN_PLACEHOLDER/)
  for (const forbidden of [/process\.env/, /\bhostname\b/, /cloudsforge\.online/, /localhost/]) {
    assert.doesNotMatch(
      PRERENDER,
      forbidden,
      `scripts/prerender.ts reads an origin. It runs once, at build time, for every estate this ` +
        `image will ever be promoted to — write ${ORIGIN_PLACEHOLDER} and let nginx fill it in.`,
    )
  }

  // And the substitution exists on the other side. Three lines make it work and each one is a
  // separate way to ship a page with `__CF_ORIGIN__` visible in its markup; `test/routes.test.ts`
  // holds all three. This is the coarse check that the rule is present at all.
  assert.match(NGINX, /sub_filter\s+'__CF_ORIGIN__'\s+'\$scheme:\/\/\$host'/)
  assert.match(NGINX, /sub_filter_once\s+off/)
})

test('THERE IS NO CHAIN CALL IN HERE, AND NO SIGNER, AND NO KEY FOR ONE TO USE', () => {
  // ══════════════════════════════════════════════════════════════════════════════════════════════
  // The exchange's copy of this test policed a bundle that DID reach a chain: it built transactions,
  // handed them to the reader's wallet, and the rules were about which of those powers it must not
  // acquire. This surface has none of them, and the check is correspondingly simpler and stricter —
  // not "it may not sign" but "it may not talk to a chain at all".
  //
  // That matters because an archive is the softest target in the estate: it is the surface a
  // stranger arrives at, it has no login and no confirmation step, and an article is a very
  // plausible place to put a "connect your wallet to try this" button. The first such button turns
  // a page anyone can link to into a page that can ask for money, and the whole argument of this
  // publication — nothing to sign up for, nothing to sign — goes with it.
  //
  // `@cloudsforge/hearth-wallet-core` is a real package and importing it here would work. It must
  // not be.
  // ══════════════════════════════════════════════════════════════════════════════════════════════
  for (const { path, text } of SRC) {
    for (const forbidden of [
      /eth_sendTransaction/,
      /eth_sendRawTransaction/,
      /eth_call/,
      /window\.ethereum/,
      /\bprivateKey\b/i,
      /\bmnemonic\b/i,
      /hearth-wallet-core/,
      /\bsecp256k1\b/i,
    ]) {
      const hit = text.match(forbidden)
      assert.equal(
        hit,
        null,
        `${path} names ${JSON.stringify(hit?.[0])}. This surface does not reach a chain and does ` +
          `not ask a reader to. It is where people ARRIVE — link them at the product that does ` +
          `the thing, and let them decide there.`,
      )
    }
  }

  // Asserted as a missing FILE as well as a missing string, because the module is what an import
  // would reach for and its absence is what makes the reach fail at the point somebody writes it.
  assert.equal(
    SRC.some((s) => s.path === 'src/lib/rpc.ts'),
    false,
    'src/lib/rpc.ts is back. There is no chain endpoint on this surface — see src/lib/hosts.ts.',
  )
})

/**
 * The ONE module in `src/` allowed to know what a CloudsForge session is.
 *
 * Named here rather than matched by a pattern, so that a second file growing a bearer is a failure
 * rather than a rename away from passing.
 */
const SESSION = 'src/lib/session.ts'

test('ONE FILE HOLDS THE SESSION, AND NOTHING ELSE IN THIS BUNDLE HAS HEARD OF ONE', () => {
  for (const { path, text } of SRC) {
    if (path === SESSION) continue
    for (const forbidden of [/\bAuthorization\b/i, /\bBearer\b/, /localStorage/, /document\.cookie/]) {
      const hit = text.match(forbidden)
      assert.equal(
        hit,
        null,
        `${path} uses ${JSON.stringify(hit?.[0])}. Nothing on this surface is behind a login and ` +
          `no page here reads anything but committed files, so a credential would be a secret ` +
          `shipped in a public bundle to authenticate nothing. The one exception is ${SESSION}, ` +
          `which the shared bar reads so it can greet a reader by name.`,
      )
    }
  }

  // The exception is real, so it is asserted rather than assumed: if the session module ever stops
  // holding a bearer, the `continue` above is silently forgiving a file that no longer needs it.
  const session = SRC.find((s) => s.path === SESSION)
  assert.ok(session, `${SESSION} has moved; this check reads it by name`)
  assert.match(session.text, /\bBearer\b/)
  // It names identity, and identity is the only host it may name.
  assert.match(session.text, /hosts\(\)\.nimbus/)

  // sessionStorage IS used, once, for the pseudonymous per-tab observability id. It dies with the
  // tab, it says nothing about who the reader is, and Lantern has no user column to put it in.
  // `session.ts` deliberately does NOT appear here: the once-per-tab silent sign-in probe keeps its
  // own mark under `cf.ssoProbed`, but it keeps it inside `@cloudsforge/ui`, not in this bundle.
  const withSession = SRC.filter((s) => /sessionStorage/.test(s.text)).map((s) => s.path)
  assert.deepEqual(withSession, ['src/lib/obs.ts'])
})

test('READING A PAGE HERE SENDS NOTHING ANYWHERE, WHICH IS A CLAIM THE ARTICLES MAKE', () => {
  // ══════════════════════════════════════════════════════════════════════════════════════════════
  // "No jargon, no price talk, nothing to sign up for" is in the description a search result shows,
  // and `about.tsx` says it at more length: this publication does not track you and has no mailing
  // list. That is a promise about network behaviour, so it is tested as one.
  //
  // The permitted calls are exactly two, and both are the estate's own shared plumbing rather than
  // this bundle's: `session.ts` asks identity who the reader is so the bar can say their name, and
  // `obs.ts` posts to Lantern. Everything else — an analytics beacon, a font from a CDN, a
  // newsletter POST, an embedded tweet — is a third party watching somebody read an article about
  // how to not get scammed.
  // ══════════════════════════════════════════════════════════════════════════════════════════════
  const callers = SRC.filter((s) => /\bfetch\s*\(|navigator\.sendBeacon/.test(s.text)).map((s) => s.path)
  assert.deepEqual(callers.sort(), [SESSION, 'src/lib/obs.ts'].sort())

  // No third-party origin in the markup either: no font CDN, no embed, no pixel. The fonts are the
  // design system's, served from this origin, which is also why this page renders with no
  // render-blocking request to anybody.
  assert.doesNotMatch(INDEX_HTML, /<script[^>]+src="https?:\/\//)
  assert.doesNotMatch(INDEX_HTML, /<link[^>]+href="https?:\/\/(?!schema\.org)/)
  for (const { path, text } of SRC) {
    assert.doesNotMatch(
      text,
      /https:\/\/(?:fonts|www)\.(?:googleapis|gstatic|google-analytics)\.com/,
      `${path} loads a third-party asset`,
    )
  }
})

test('the image proxies nothing, so no credential can be added to it later', () => {
  // The tempting fix for an authority gap is an nginx proxy with a header on it. An image is built
  // once and promoted; a credential inside one is compromised on the first deploy.
  assert.doesNotMatch(NGINX, /proxy_pass/i)
  assert.doesNotMatch(NGINX, /Authorization|Bearer/i)
  assert.doesNotMatch(DOCKERFILE, /TOKEN|SECRET|PASSWORD/i)
})

test('the release and the analytics id are identities, not configuration', () => {
  // Both are meta tags rather than build-time constants: they NAME the artefact and the property it
  // reports to, they do not tell it where it is running. The Dockerfile stamps the release into a
  // copy of index.html, which is why an image can be promoted and still be traceable.
  assert.match(INDEX_HTML, /<meta name="cf-release" content="dev" \/>/)
  assert.match(DOCKERFILE, /ARG RELEASE/)
  assert.match(DOCKERFILE, /cf-release/)
  // And no third-party analytics script tag: `@cloudsforge/ui/consent` injects the tag from exactly
  // one place, the Accept button. A cookie set before consent is not cured by a banner under it.
  assert.doesNotMatch(INDEX_HTML, /<script[^>]+src="https?:\/\//)
})

/**
 * Pressing Testnet keeps the reader on this page, and moves every link on it.
 *
 *     "i see basically that in every page when you press testnet it take you to network page
 *      testet and if you switch product its reset to mainnet"
 *
 * The report that made this a defect in every bundle rather than in three of them (micro-org#459).
 *
 * ════════════════════════════════════════════════════════════════════════════════════════════════
 * ON THIS SURFACE THE SWITCH MOVES EVERY LINK, AND NO DATA AT ALL.
 *
 * Everywhere else it moves an API base or a chain endpoint: a different database, or two chains
 * with different contracts and coins worth different amounts. Here it moves nothing behind the
 * page. An article is committed source, `src/content/` is the whole backend, and the words are
 * byte-identical on both networks — which is exactly the argument I first used for leaving
 * `viewsAnyNetwork` OFF, and it was wrong.
 *
 * It was wrong because the flag is not about the data behind the page. It is about what the estate
 * bar's Testnet button DOES. Unflagged, the switcher's answer for this surface is "leave" — a reader
 * three paragraphs into an essay presses Testnet and is thrown out of the essay and onto Forge
 * Network, which is the defect the report above describes in the reporter's own words.
 *
 * And there IS something for the switch to move, even here. Every article in this publication sends
 * readers somewhere: try the faucet, look at the explorer, open your account. A testnet reader
 * following a mainnet link lands on the network they were not looking at — and on the faucet, on the
 * one where the thing the article just told them to do costs real money. Those links come from
 * `viewedHosts()`, so they follow the switch, and that is what this file pins.
 * ════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * There is deliberately no `rpcUrl()` here and no `apiBase()` to assert against: this bundle
 * composes no remote address of its own at all. `test/hosts.test.ts` pins that absence directly.
 *
 * No DOM. `lib/viewed.ts` holds the choice in module memory, so a stub window at a hostname is the
 * entire environment this needs. The state is a MODULE's, so it outlives the test that set it —
 * hence the reset in `afterEach`, performed through the public setter with a window installed,
 * because `setViewedNetwork` normalises its argument against the hostname's own network.
 */
import assert from 'node:assert/strict'
import { afterEach, describe, it } from 'node:test'
import { installWindow, removeWindow } from './browser-stubs.ts'
import { setViewedNetwork, viewedHosts, viewedNetwork, viewedSurfaceUrl } from '../src/lib/viewed.ts'

/** A real address on this surface, on the mainnet estate. */
const PAGE = 'https://journal.cloudsforge.online/'
/** A development address. The registry resolves every surface to a localhost port from here. */
const DEV = 'http://localhost:5196/'

/** Run `body` with a window at `url`, and take the window away again whatever happens. */
function at<T>(url: string, body: () => T): T {
  installWindow(url)
  try {
    return body()
  } finally {
    removeWindow()
  }
}

describe('the in-place network view', () => {
  afterEach(() => at(PAGE, () => setViewedNetwork('mainnet')))

  it('starts on the network the hostname names', () => {
    at(PAGE, () => {
      assert.equal(viewedNetwork(), 'mainnet')
      assert.ok(!viewedHosts().explorer.includes('testnet'))
    })
  })

  it('moves every estate link to testnet WITHOUT navigating anywhere', () => {
    at(PAGE, () => {
      setViewedNetwork('testnet')
      assert.equal(viewedNetwork(), 'testnet')
      // ══════════════════════════════════════════════════════════════════════════════════════════
      // THE FAUCET IS NOT A HOSTNAME. It is a `basePath` row — subdomain `network`, path
      // `/faucet` — so its URL is Forge Network's hostname with a path on the end, and the
      // environment suffix lands on `network` rather than on `faucet`.
      //
      // This assertion was written the other way round first, against
      // `https://faucet-testnet.cloudsforge.online`, and it failed. That is worth leaving on the
      // record because the same mistake in an ARTICLE ships: an essay that tells a reader to go
      // and get some test EMBER, linking them at a hostname with no DNS record. Every estate link
      // in `src/content/` therefore comes from `viewedHosts()` and never from a string, and this
      // is the test that says the composition — not my memory of it — is what produces them.
      // ══════════════════════════════════════════════════════════════════════════════════════════
      assert.equal(viewedHosts().faucet, 'https://network-testnet.cloudsforge.online/faucet')
      // And the environment is a SUFFIX on the first label rather than a second label: Cloudflare's
      // Universal SSL wildcard matches exactly one, so `explorer.testnet.<apex>` would fail the TLS
      // handshake at the edge before anything in this estate saw the request.
      assert.equal(viewedHosts().explorer, 'https://explorer-testnet.cloudsforge.online')
    })
  })

  it('LEAVES THE READER WHERE THEY WERE, which is the whole point of the flag', () => {
    // `viewedSurfaceUrl` composes an address for a surface on the viewed network. Asked for its
    // OWN, it must produce this hostname's testnet twin — an address that serves the same article —
    // and not Forge Network's.
    //
    // This is the assertion that says the surface views IN PLACE, and it is invisible in every
    // other test here because every other test is about a link to somewhere else.
    at(PAGE, () => {
      setViewedNetwork('testnet')
      assert.equal(viewedSurfaceUrl('journal'), 'https://journal-testnet.cloudsforge.online')
      assert.ok(!viewedSurfaceUrl('journal').includes('network'))
    })
  })

  it('goes back to the serving estate when the reader switches back', () => {
    at(PAGE, () => {
      setViewedNetwork('testnet')
      setViewedNetwork('mainnet')
      assert.equal(viewedNetwork(), 'mainnet')
      assert.equal(viewedHosts().faucet, 'https://network.cloudsforge.online/faucet')
    })
  })

  it('THE APEX COMES OFF THE PAGE, so another estate links within itself', () => {
    // Nothing in `src/` names a CloudsForge hostname — one image is served from localhost, from a
    // preview and from two production estates. Every link is therefore composed, and this is the
    // assertion that it is composed rather than merely correct on the estate it was written on.
    at('https://journal.example.test/', () => {
      assert.equal(viewedHosts().faucet, 'https://network.example.test/faucet')
      setViewedNetwork('testnet')
      assert.equal(viewedHosts().faucet, 'https://network-testnet.example.test/faucet')
    })
  })

  it('a local checkout links to local ports, and a stray ?net= cannot point it at production', () => {
    at(DEV, () => {
      // The registry resolves every surface to a localhost port in development, so the links work
      // without a tunnel and without an estate. The faucet keeps its `/faucet` path here too — it
      // is one route inside network-site's dev server rather than a server of its own.
      assert.match(viewedHosts().faucet, /^http:\/\/localhost:\d+\/faucet$/)
      // `NetworkSwitcher` hides itself off-registry, so no click can produce this; the assertion is
      // that a stale module state or a hand-typed `?net=` cannot send a developer's links at the
      // live testnet estate, where the faucet is real and the account is somebody's.
      setViewedNetwork('testnet')
      assert.match(viewedHosts().faucet, /^http:\/\/localhost:\d+\/faucet$/)
    })
  })
})

/**
 * The chrome: the estate's bar, the publication's own masthead, the page, the footer.
 *
 * ── THE BAR IS HERE FOR THE REASON THE EXCHANGE LEARNED THE HARD WAY ─────────────────────────────
 *
 * `exchange-web/src/components/shell.tsx` carries the full argument and the owner's report that
 * produced it: a surface that drops the estate's bar does not read as "this page needs no account",
 * it reads as a page that fell off the estate. That is worse here than anywhere, because this is the
 * surface strangers arrive on FIRST — from a search result, from a link somebody sent them — and the
 * bar is the only thing on the page that tells them the other twelve surfaces exist.
 *
 * So the bar carries the product switcher, the CloudsForge home link, the network switcher and the
 * reader's account, and the masthead below it carries only what is this publication's own: its name,
 * its four pages and its feed.
 *
 * ── THE NETWORK SWITCHER SWITCHES NOTHING HERE, AND IT STAYS ─────────────────────────────────────
 *
 * An article is byte-identical on both networks; there is no read to redo. What the switch does on
 * this surface is set the network every OTHER surface will be entered at — the footer's links, the
 * bar's switcher, the estate the reader goes back to. `lib/hosts.ts` records the reversal in full:
 * without `viewsAnyNetwork` on the registry row, pressing Testnet halfway through an article throws
 * the reader out of the article and onto Forge Network, which is the exact defect task #136 exists
 * to remove. The `key` on the Outlet that every other surface needs is absent for the same reason
 * the switch is cheap here: there is nothing to re-read, and remounting would only lose the reader's
 * scroll position mid-article.
 */
import {
  CloudsForgeBar,
  CloudsForgeFooter,
  CookieBanner,
  MainRegion,
  SkipLink,
  miningOnHub,
} from '@cloudsforge/ui'
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useSession } from '../lib/auth.tsx'
import { hosts, placementIsKnown, PRODUCT } from '../lib/hosts.ts'
import { PUBLICATION } from '../lib/meta.ts'
import { Masthead } from './masthead.tsx'
import { UnregisteredNotice } from './notices.tsx'
import { setViewedNetwork, viewedNetwork, type ViewedNetwork } from '../lib/viewed.ts'

/** Re-exported so the chrome tests have one import for the chrome. Defined in `masthead.tsx`. */
export { SURFACE_NAME } from './masthead.tsx'

export function AppShell() {
  const [viewed, setViewed] = useState<ViewedNetwork>(viewedNetwork())
  const { account, signIn, signOut } = useSession()
  const known = placementIsKnown()
  const estate = hosts()

  return (
    <>
      <SkipLink>Skip to the article</SkipLink>

      <CloudsForgeBar
        current={PRODUCT}
        account={account}
        onSignIn={() => signIn()}
        onSignOut={signOut}
        mining={miningOnHub(estate.hub)}
        networkSwitch={{
          selected: viewed,
          onSelect: (n) => {
            setViewedNetwork(n)
            setViewed(n)
          },
        }}
      />

      <Masthead />

      <MainRegion className="jn-main">
        {!known && <UnregisteredNotice />}
        <Outlet />
      </MainRegion>

      {/*
        THE SHARED FOOTER. `note` says the two things a reader of a company's publication is owed:
        who wrote it and what it is not. Neither can go stale — a footer is exactly where a claim
        outlives its own truth, so the only claims that belong in one are the ones that cannot.
      */}
      <CloudsForgeFooter
        current={PRODUCT}
        account={account}
        note={
          <>
            {PUBLICATION} is written by the people who build CloudsForge, about the things they
            build and the subject those things sit in. We are not neutral about our own products and
            have tried to be specific instead. Nothing here is financial advice, an offer, or a
            promise of return.
          </>
        }
      />

      <CookieBanner />
    </>
  )
}

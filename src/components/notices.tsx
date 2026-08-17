/**
 * The one standing notice — the one the shell renders above every page rather than leaving to a page
 * to remember.
 *
 * A notice earns a place here by being true on EVERY route and by being something a reader would act
 * differently for if they had not read it. Everything else belongs on the page it is about, because
 * a banner that is always there is a banner nobody reads by the third visit.
 *
 * This surface arrived from `exchange-web` with two, and the second — "your coins stay in your own
 * wallet" — is deleted rather than reworded. It is the sentence that surface must not let a stranger
 * miss, because a reader is about to sign a transaction on it. Nothing on this one takes a deposit,
 * quotes a price or offers a trade, so the same banner here would be a warning about a risk the page
 * does not carry, sitting above every article forever. That is how a standing notice becomes
 * furniture, and the notice below is the one that then stops being read.
 */

/**
 * "You are not where you think you are."
 *
 * Smaller here than on any other surface and kept anyway, for the reason `lib/hosts.ts` gives: an
 * article is readable from any hostname, but an unregistered placement is also the placement whose
 * `__CF_ORIGIN__` substitution nginx never ran — so the canonical tag on this page may still be
 * carrying a literal placeholder, and the person who needs to know that is whoever put the bundle
 * there.
 */
export function UnregisteredNotice() {
  return (
    <aside className="jn-notice" role="note">
      <p className="jn-notice__title">This is not a CloudsForge address</p>
      <p className="jn-notice__body">
        This page is being served from a hostname the surface registry does not know. Everything is
        readable — no article needs a host to be read — but the links out to the rest of the
        ecosystem may point one level too deep, and the addresses this page publishes to search
        engines were never substituted for a real one.
      </p>
    </aside>
  )
}

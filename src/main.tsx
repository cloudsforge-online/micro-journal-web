/**
 * The boot sequence. The order is not arbitrary.
 *
 *   1. Observability first, so an exception thrown by anything below is reported rather than lost.
 *   2. `initAnalytics()` second — see the note beside the call.
 *   3. `bootstrapSession()` third, awaited, so the chrome never flashes signed-out then signed-in.
 *   4. Render last.
 *
 * ════════════════════════════════════════════════════════════════════════════════════════════════
 * `createRoot`, NOT `hydrateRoot`, AND THAT IS A DECISION RATHER THAN AN OVERSIGHT.
 *
 * Every route on this surface is already a complete HTML file on disk — `scripts/prerender.ts` walks
 * the same components under Node and writes the markup out. The obvious next step is to hydrate it,
 * and it is wrong here for two reasons that compound.
 *
 * The first is mechanical. The prerender uses `renderToStaticMarkup`, which deliberately emits NO
 * hydration markers: it is the "this will never be hydrated" renderer. `hydrateRoot` against its
 * output does not fail loudly — it walks the tree, disagrees, and silently falls back to a client
 * render, having first spent the reconciliation. The only honest options are `renderToString` plus
 * `hydrateRoot`, or `renderToStaticMarkup` plus `createRoot`.
 *
 * The second is what the two renders are FOR, and it decides between those options. The file on disk
 * exists for a reader with no JavaScript yet and for a crawler that runs none: the words, the
 * headline, the images, the links. The browser render exists for a reader who has the bundle: the
 * contents highlight that tracks their scroll, the share sheet their device actually has, the search
 * box. Those trees are not the same tree and are not meant to be — `components/share.tsx` reads
 * `navigator.share` in an effect precisely so the static file does not claim a capability the
 * reader's browser may not have. Hydration's contract is that the two match exactly; asking for it
 * here would mean giving up the difference that makes both renders worth doing.
 *
 * The cost is one extra render of a page whose content is already painted, on a bundle this size.
 * The benefit is that the file a stranger's crawler reads and the page a reader interacts with can
 * each be exactly right, and neither has to be a compromise for the other.
 * ════════════════════════════════════════════════════════════════════════════════════════════════
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@cloudsforge/ui/tokens.css'
import '@cloudsforge/ui/ui.css'
import './styles.css'
import { initAnalytics } from '@cloudsforge/ui/consent'
import { App } from './app.tsx'
import { initObs } from './lib/obs.ts'
import { bootstrapSession } from './lib/session.ts'

initObs()

/*
 * Consent Mode is primed with every category DENIED before anything else runs — two pushes onto a
 * plain array, no request, no cookie — and the analytics tag is loaded ONLY if this reader granted
 * consent on a previous visit. A first-time reader gets nothing until they press Accept.
 *
 * This surface is the one where that ordering is most likely to be tested, because it is the one
 * strangers arrive on from a search result having never seen a CloudsForge page before.
 */
initAnalytics()

const container = document.getElementById('root')
if (!container) throw new Error('#root is missing from index.html')

void bootstrapSession().finally(() => {
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})

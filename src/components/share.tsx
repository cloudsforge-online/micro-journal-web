/**
 * Sharing an article, without giving anybody a beacon.
 *
 * ════════════════════════════════════════════════════════════════════════════════════════════════
 * THERE ARE NO SOCIAL BUTTONS HERE, AND THE ABSENCE IS THE FEATURE.
 *
 * The standard row of share buttons is not a row of links. Each one is a script from a company that
 * is not us, loaded on page view rather than on click, which sets a cookie and records that this
 * reader read this article — before they have touched anything. The estate's own analytics do not
 * report until a reader has consented (`@cloudsforge/ui/consent`, and the banner in the shell), and
 * a publication that asks permission for its own counter while silently handing the same visit to
 * three advertising networks is not making a privacy argument, it is making a legal one.
 *
 * So there are two controls and both are inert until pressed:
 *
 *   - The system share sheet, where the browser has one. `navigator.share` opens the reader's OWN
 *     list of applications; nothing here learns which one they picked, or whether they shared at all.
 *   - Copy the link, everywhere else. A string in a clipboard, which is what a share button was
 *     always standing in for.
 * ════════════════════════════════════════════════════════════════════════════════════════════════
 */
import { useEffect, useState } from 'react'

type Outcome = 'idle' | 'copied' | 'failed'

export function ShareRow({ title, path }: { title: string; path: string }) {
  const [outcome, setOutcome] = useState<Outcome>('idle')
  const [canShare, setCanShare] = useState(false)

  // Read in an effect rather than during render: the prerender has no `navigator`, and a value
  // read during render would put the build machine's answer into the static file, where it would
  // be wrong for most readers until the bundle arrived and corrected it.
  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function')
  }, [])

  useEffect(() => {
    if (outcome === 'idle') return
    const timer = setTimeout(() => setOutcome('idle'), 2500)
    return () => clearTimeout(timer)
  }, [outcome])

  const url = (): string =>
    typeof window === 'undefined' ? path : new URL(path, window.location.origin).toString()

  return (
    <div className="jn-share">
      <span className="jn-share__label">Share this</span>
      {canShare && (
        <button
          type="button"
          className="cf-btn jn-share__btn"
          onClick={() => {
            // A rejected share is the reader closing the sheet, which is not an error and must not
            // be reported as one. The promise is deliberately swallowed.
            void navigator.share({ title, url: url() }).catch(() => undefined)
          }}
        >
          Share
        </button>
      )}
      <button
        type="button"
        className="cf-btn jn-share__btn"
        onClick={() => {
          const write = navigator.clipboard?.writeText(url())
          if (!write) {
            setOutcome('failed')
            return
          }
          void write.then(
            () => setOutcome('copied'),
            () => setOutcome('failed'),
          )
        }}
      >
        Copy link
      </button>
      {/*
        `role="status"` rather than a bare span: the confirmation is the entire feedback for the
        action, and a sighted reader gets it from the text appearing. Without the live region a
        screen-reader user presses the button and is told nothing at all.
      */}
      <span className="jn-share__said" role="status">
        {outcome === 'copied' && 'Link copied'}
        {outcome === 'failed' && 'Could not copy — the address is in the bar above'}
      </span>
    </div>
  )
}

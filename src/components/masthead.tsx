/**
 * The publication's own masthead: its name, its four pages, its search and its feed.
 *
 * It is a component of its own rather than markup inside `shell.tsx` because TWO shells render it —
 * the real one, and the reduced one `scripts/prerender.ts` uses to write the files on disk (see
 * `static-shell.tsx` for why the reduced one exists). A crawler that runs no JavaScript should get
 * the same navigation a reader gets, and the only way to be sure of that is for there to be one
 * copy of it.
 *
 * Everything here is a relative link. That is what makes the shared rendering possible at all: the
 * estate's bar and footer compose absolute URLs from a hostname, and at build time there is no
 * hostname. This has no such dependency and never should acquire one.
 */
import { surface } from '@cloudsforge/ui/surfaces'
import { Link, NavLink } from 'react-router-dom'
import { PRODUCT } from '../lib/hosts.ts'
import { FEED_PATH, NAV, searchPath } from '../lib/routes.ts'

/**
 * The surface's own name, READ OFF THE REGISTRY rather than typed here.
 *
 * `PUBLICATION` in `lib/meta.ts` is the same words and is NOT the same thing: that constant is what
 * the publication calls itself inside a feed and a JSON-LD block, where the company's registry has
 * no standing. `test/brand-chrome.test.ts` asserts the two agree, which is the check that catches a
 * rename in either place.
 */
export const SURFACE_NAME = surface(PRODUCT).name

export function Masthead() {
  return (
    <header className="jn-masthead">
      <div className="jn-masthead__inner">
        <Link className="jn-masthead__name" to="/">
          {SURFACE_NAME}
        </Link>
        <nav className="jn-nav" aria-label="Journal sections">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `jn-nav__link${isActive ? ' jn-nav__link--current' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <span className="jn-masthead__spacer" />
        <Link className="jn-masthead__action" to={searchPath('')}>
          Search
        </Link>
        {/*
          A PLAIN `<a>`, not a `<Link>`. `/feed.xml` is a file nginx serves; routing it through the
          client router would render the 404 page at an address that has a perfectly good document
          behind it. `download` is deliberately absent — a feed reader wants the URL, and a browser
          that renders XML badly is still showing the reader the thing they asked for.
        */}
        <a className="jn-masthead__action" href={FEED_PATH}>
          RSS
        </a>
      </div>
    </header>
  )
}

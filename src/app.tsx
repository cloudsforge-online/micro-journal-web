/**
 * The application, in the browser.
 *
 * The route table itself is in `routes-tree.tsx`, which carries the argument for the split: this
 * module reaches `components/shell.tsx` and therefore the estate's bar, and those modules touch
 * `window` as they evaluate, so `scripts/prerender.ts` cannot import this file at all. It imports
 * the route table directly and passes its own smaller shell.
 *
 * ── THERE IS AN `AuthProvider` AND THERE IS NO GUARD ─────────────────────────────────────────────
 *
 * Not one route is gated and none may be. Everything here is public writing; a sign-in wall in front
 * of an article would be a wall in front of the only thing this surface has. The provider's entire
 * consumer is the chrome — a handle in the bar, and the operator entries the switcher shows an
 * operator — so it wraps outside the router and inside nothing.
 */
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ScrollToTop } from './components/scroll-to-top.tsx'
import { AppShell } from './components/shell.tsx'
import { AuthProvider } from './lib/auth.tsx'
import { BASE } from './lib/routes.ts'
import { routeChildren } from './routes-tree.tsx'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>{routeChildren()}</Route>
    </Routes>
  )
}

/**
 * ── `basename`, WHICH IS WHAT MAKES THIS SURFACE A FOLDER RATHER THAN A HOST ─────────────────────
 *
 * Every path in `src/lib/routes.ts` is relative to the mount, so `<Route path="topics">` and
 * `<Link to="/about">` are written exactly as they were when this was a hostname of its own. This
 * one property is what puts `/journal` in front of them: matching strips it before the router sees
 * the location, and `<Link>` puts it back when it renders an `href`.
 *
 * It is the SAME constant `scripts/prerender.ts` gives `StaticRouter`, and the two must agree or
 * the markup on disk links somewhere the running bundle does not — an anchor a crawler follows to
 * the marketing site's 404 while a reader clicking the same word in a browser goes to the article.
 */
export function App() {
  return (
    <BrowserRouter basename={BASE}>
      <ScrollToTop />
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

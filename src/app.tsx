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
import { routeChildren } from './routes-tree.tsx'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>{routeChildren()}</Route>
    </Routes>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

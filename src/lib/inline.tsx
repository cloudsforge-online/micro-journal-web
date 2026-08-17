/**
 * The inline markup: tokenised once, rendered two ways.
 *
 * ── THE WHOLE LANGUAGE IS FOUR THINGS AND IT DOES NOT GROW WITHOUT AN ARGUMENT ───────────────────
 *
 *   `**bold**`  `*italic*`  `` `code` ``  `[text](href)`
 *
 * That is all of it. The temptation at every point is to reach for a markdown library, and the
 * reason not to is that every markdown implementation has an HTML escape hatch — by design, it is
 * in the specification — and the moment one is in the pipeline, a content file becomes a place
 * where somebody can write a `<script>` and have it rendered. Nothing in this repository is passed
 * to `dangerouslySetInnerHTML`, and this function is what makes that possible rather than merely
 * intended: it returns ELEMENTS, and React escapes every string it puts in one.
 *
 * ── ONE TOKENISER, BECAUSE THERE ARE TWO RENDERERS ───────────────────────────────────────────────
 *
 * The page renders through React. The RSS feed cannot — a feed item's body is a STRING of HTML, and
 * `src/lib/syndication.ts` composes it. Two renderers reading the same markup with two parsers is
 * how a feed ends up showing asterisks in the middle of a sentence six months after somebody
 * changed the emphasis rule on the page. So the parse happens once, here, and both renderers walk
 * the same tokens. The string renderer does its own escaping and is the only place in the
 * repository that composes markup by hand; it lives next to a test that feeds it every article.
 *
 * ── LINK HREFS ARE CHECKED, NOT TRUSTED ──────────────────────────────────────────────────────────
 *
 * `[text](javascript:…)` is the oldest injection in the book and it survives an HTML-escaping
 * renderer untouched, because the string never becomes markup — it becomes an attribute. So a href
 * is accepted only in the three shapes an article can legitimately need: a site-relative path, an
 * `https://` URL, or a `#fragment`. Anything else renders as plain text with the link dropped,
 * which is loud in review and harmless in production. `test/inline.test.ts` holds the list.
 *
 * ── THE PARSER IS ONE PASS AND IT DOES NOT NEST ──────────────────────────────────────────────────
 *
 * `**bold with *italic* inside**` renders as bold text containing literal asterisks. That is a real
 * limitation and it is chosen: a nesting parser is where the bugs are, the archive has never wanted
 * it, and prose that needs two levels of emphasis usually wants rewriting instead.
 */
import { Fragment, type ReactNode } from 'react'

/**
 * The one place a href is judged.
 *
 * Exported because `test/inline.test.ts` walks every link in every article through it, so a bad
 * href in a content file fails the build rather than silently rendering as text on the live page.
 */
export function isAllowedHref(href: string): boolean {
  if (href.startsWith('#')) return true
  // A single leading slash. `//evil.example` is a protocol-relative URL and is NOT a path.
  if (href.startsWith('/') && !href.startsWith('//')) return true
  return href.startsWith('https://')
}

/** Whether a link leaves this surface, and therefore needs `rel` and a new tab. */
export function isExternal(href: string): boolean {
  return href.startsWith('https://')
}

export type InlineToken =
  | { readonly kind: 'text'; readonly text: string }
  | { readonly kind: 'strong'; readonly text: string }
  | { readonly kind: 'em'; readonly text: string }
  | { readonly kind: 'code'; readonly text: string }
  | { readonly kind: 'link'; readonly text: string; readonly href: string }

/**
 * One regular expression, alternating over the four forms.
 *
 * The order matters: `**` has to be tried before `*`, or every bold run is read as an italic run
 * containing an asterisk. Written as one alternation rather than four passes so that a `*` inside
 * a code span is not re-read as emphasis on the second pass — one pass, left to right, first match
 * wins, which is the only version of this that is obviously correct.
 */
const INLINE = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g

/**
 * The markup, as a flat list.
 *
 * A rejected href collapses to a `text` token carrying the LABEL, not the whole `[text](href)`
 * source: the reader gets the sentence they were meant to read, minus a link that was never going
 * to be followed. Both renderers therefore get the same fallback without either implementing it.
 */
export function tokenizeInline(text: string): readonly InlineToken[] {
  return text.split(INLINE).map((part): InlineToken => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return { kind: 'strong', text: part.slice(2, -2) }
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return { kind: 'em', text: part.slice(1, -1) }
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return { kind: 'code', text: part.slice(1, -1) }
    }
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part)
    if (link) {
      const [, label, href] = link as unknown as [string, string, string]
      if (!isAllowedHref(href)) return { kind: 'text', text: label }
      return { kind: 'link', text: label, href }
    }
    return { kind: 'text', text: part }
  })
}

export function renderInline(text: string): ReactNode {
  return tokenizeInline(text).map((token, index) => {
    const key = `${index}`
    switch (token.kind) {
      case 'strong':
        return <strong key={key}>{token.text}</strong>
      case 'em':
        return <em key={key}>{token.text}</em>
      case 'code':
        return <code key={key}>{token.text}</code>
      case 'link':
        // `noopener` is not optional on a `_blank`: without it the opened page gets a handle on
        // this one through `window.opener` and can navigate it somewhere else.
        return isExternal(token.href) ? (
          <a key={key} href={token.href} target="_blank" rel="noopener noreferrer">
            {token.text}
          </a>
        ) : (
          <a key={key} href={token.href}>
            {token.text}
          </a>
        )
      default:
        return <Fragment key={key}>{token.text}</Fragment>
    }
  })
}

/**
 * The same text with the markup taken off, for the places that cannot take elements.
 *
 * Three of them: a `<meta>` attribute, the plain-text excerpt in a search result, and the word
 * count. All three would otherwise show a reader the asterisks.
 */
export function stripInline(text: string): string {
  return tokenizeInline(text)
    .map((token) => token.text)
    .join('')
}

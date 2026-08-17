/**
 * Every fact about this estate an article is allowed to state, and where each one comes from.
 *
 * ── WHY A BLOG NEEDS ONE OF THESE, AND WHY IT IS NARROWER THAN THE SITE'S ────────────────────────
 *
 * `micro-site` carries a register with an absolute rule: a digit may not appear in that site's copy
 * unless it appears in the register. That rule is right for a marketing page, where nearly every
 * number is a promise about somebody's money, and it is wrong here — an article says "the 1980s"
 * and "a third of its value" and "nine ways", and a register that has to hold those becomes a list
 * of arbitrary integers with no provenance to record, which is worse than no register at all,
 * because it teaches the next person that adding a row is a formality.
 *
 * So the guard is aimed at the thing actually worth guarding. `test/content.test.ts` splits every
 * article into sentences, finds each sentence naming this estate — CloudsForge, Hearth, EMBER,
 * Spark, Forge <anything> — and fails if that sentence carries a digit-run that is not the
 * `rendered` form of an entry below. A number about the world is prose. A number about our own
 * chain, in the same breath as its name, is a claim, and a claim needs a source.
 *
 * ── THE SOURCE IS A PATH AND A SYMBOL, NEVER A LINE ──────────────────────────────────────────────
 *
 * `micro-site`'s header records four separate red builds caused by citations that named a LINE in
 * a file this estate owns but that repository does not watch. Every one of them was a stale
 * position rather than a wrong value. The rule is inherited whole: name the file and the constant,
 * heading or sentence in it. A search survives a file growing; a line number does not.
 *
 * These entries are deliberately a subset of `site/src/content/claims.ts`, cited to the same
 * upstream symbols, so that the blog and the marketing site cannot state the same fact two ways.
 * Nothing is registered here that no article uses — an orphan row is the most plausible-looking
 * wrong value the next writer could reach for.
 */

/** One published fact, with its provenance. */
export interface Claim {
  /** Exactly how it appears in an article. This is what the content scan matches against. */
  readonly rendered: string
  /** What it means, for a reader of this file rather than of the article. */
  readonly meaning: string
  /** Where the value comes from: a path in this estate, and the NAME of the thing at it. */
  readonly source: string
}

export const CLAIMS = {
  emberChainId: {
    rendered: '7411',
    meaning:
      "Hearth's main network chain id. Published because 'EVM-compatible' is a claim a reader cannot check and a chain id is one they can: add the network, send a transaction, find out.",
    source: 'contracts/packages/chain/src/index.ts — CHAINS.EMBER.chainId.mainnet',
  },
  emberTestnetChainId: {
    rendered: '7412',
    meaning:
      'Hearth test network chain id. Separate by requirement rather than convention: one id shared between the two would make every test transaction replayable on the main network.',
    source: 'contracts/packages/chain/src/index.ts — CHAINS.EMBER.chainId.testnet',
  },
  emberBlockSeconds: {
    rendered: '15',
    meaning:
      'Seconds between Hearth blocks. Also the minutes in emberConfirmationMinutes, which is a coincidence rather than a relationship, so an article must never derive one from the other in prose.',
    source:
      'contracts/packages/chain/src/index.ts — "~15 minutes at a 15-second block time", the depth Hearth publishes in docs/exchange-integration.md §4',
  },
  emberConfirmations: {
    rendered: '60',
    meaning: 'Blocks an EMBER deposit waits before it is spendable.',
    source: 'contracts/packages/chain/src/index.ts — CHAINS.EMBER.confirmations',
  },
  sparksPerEmber: {
    rendered: '1,000,000',
    meaning:
      'Sparks in one EMBER. A Spark is a DISPLAY DENOMINATION and never a second asset code, so one balance is never two numbers that can drift apart.',
    source:
      'docs/ecosystem/23-tessera.md — "Sparks is a display denomination of EMBER. It is not a second assetCode, and it must never become one."',
  },
  creditableChainNames: {
    rendered: 'EMBER, Bitcoin, Litecoin',
    meaning:
      'The assets a deposit can actually arrive in — the chains this estate runs a follower for and will credit. Deliberately NOT the list of chains the estate can model, which is longer and has been mistaken for this one three times.',
    source: 'contracts/packages/chain/src/index.ts — CREDITABLE_ASSETS',
  },
  products: {
    rendered: '6',
    meaning:
      'Products in the surface registry. An article spells it as a word, so a seventh product is a registry entry rather than a copy-editing pass across five years of archive.',
    source: '@cloudsforge/ui — PRODUCTS, derived from SURFACES in ui/packages/ui/src/surfaces.ts',
  },
} as const satisfies Record<string, Claim>

export type ClaimKey = keyof typeof CLAIMS

/** The rendered form, for interpolation into an article's prose. */
export function claim(key: ClaimKey): string {
  return CLAIMS[key].rendered
}

/** Every digit-run an article may print in a sentence that names this estate. */
export function allowedNumbers(): ReadonlySet<string> {
  return new Set(Object.values(CLAIMS).map((c) => c.rendered))
}

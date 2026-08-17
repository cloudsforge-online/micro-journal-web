/**
 * Who signs an article.
 *
 * ── THERE IS ONE AUTHOR AND IT IS NOT A PERSON, WHICH IS A DECISION RATHER THAN A PLACEHOLDER ────
 *
 * The obvious way to make a blog feel human is to invent a few writers, give them faces and short
 * biographies, and put a different name on each piece. It works — that is the problem with it. A
 * byline is a claim that a named person stands behind what is written, and a search result, a
 * link preview and an `Article` JSON-LD `author` field all carry that claim outward. Inventing four
 * of them to make a page feel warmer is a lie told in the one field a reader has no way to check.
 *
 * So there is one signature, it is the company's, and its biography says plainly who writes these:
 * the people who build the thing being written about. That is both true and, as it happens, the
 * more interesting position — an article about why we chose to run our own chain is worth more from
 * the people who ran it than from a persona invented to deliver it.
 *
 * If a named writer ever joins, this file grows a row with their real name and `authorId` on their
 * own pieces. The shape is already here; what is refused is filling it with fiction.
 */
import type { Author } from './types.ts'

export const AUTHORS: readonly Author[] = [
  {
    id: 'cloudsforge',
    name: 'The CloudsForge desk',
    bio: 'Written and edited by the people who build CloudsForge. We run the chain, the wallets and the products described here, which means we are not neutral about them — so we have tried to be specific instead.',
  },
]

export function authorById(id: string): Author {
  const found = AUTHORS.find((author) => author.id === id)
  if (!found) throw new Error(`unknown author: ${id}`)
  return found
}

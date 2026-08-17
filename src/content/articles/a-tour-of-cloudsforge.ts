import { claim } from '../claims.ts'
import type { Article } from '../types.ts'

export const article: Article = {
  slug: 'a-tour-of-cloudsforge',
  title: 'A tour of CloudsForge, for people who have not been here before',
  dek: 'Six products, one account, and a chain underneath. What each part is for, in the order you would actually meet them — including which ones are finished and which are not.',
  description:
    'A plain tour of the CloudsForge products: what each one does, how they fit together, and which parts are still being built.',
  authorId: 'cloudsforge',
  publishedAt: '2026-08-11',
  updatedAt: null,
  tags: ['ecosystem', 'starting-out'],
  hero: {
    src: '/articles/a-tour-of-cloudsforge/hero.png',
    alt: 'A drawing of six tools standing in a row on one bronze rule, each a different colour, each labelled with the name of a CloudsForge product.',
  },
  card: '/articles/a-tour-of-cloudsforge/card.png',
  body: [
    {
      kind: 'lead',
      text: 'A product tour written by the people who make the product is usually a list of adjectives. We are going to try something else: what each part of CloudsForge is for, what you would actually do with it on a Tuesday evening, and where it is still unfinished. The last of those is the only part of this you cannot get from the homepage.',
    },
    { kind: 'h2', text: 'The thing underneath: one account', id: 'one-account' },
    {
      kind: 'p',
      text: 'Start here, because it explains the shape of everything else.',
    },
    {
      kind: 'p',
      text: 'There is one account. You sign in once and every product knows who you are, which sounds unremarkable until you notice how rare it is in this field — most crypto applications ask you to connect a wallet again, per site, per session, forever.',
    },
    {
      kind: 'p',
      text: 'Behind that account is one balance. Money you put in arrives as ' +
        claim('creditableChainNames') +
        ', and Dogecoin is coming as soon as its node has finished catching up with its own history, which takes weeks and cannot be hurried. The important part is that a game, a marketplace listing and a bet all draw on the same balance instead of each keeping its own float that you have to top up separately.',
    },
    {
      kind: 'p',
      text: 'And behind the balance is Hearth, our own chain, which exists so that the very small transactions all of this generates cost approximately nothing. We wrote separately about why that was worth building rather than borrowing.',
    },
    { kind: 'h2', text: 'Forge Network — mine', id: 'network' },
    {
      kind: 'p',
      text: 'The unusual front door. Open a page, let it work, and you are mining EMBER on Hearth. No hardware, no purchase, no waiting for a bank transfer to clear.',
    },
    {
      kind: 'p',
      text: 'Being direct about expectations: this will not make you money. A browser tab is a rounding error against a real mining operation and we would be embarrassed to imply otherwise. What it does is let you hold your first coin because you produced it, which is a genuinely different way to start than buying one, and it means the network is partly held by the people who use it.',
    },
    {
      kind: 'p',
      text: 'The same surface is where you go to look at the chain itself — blocks arriving, what is in them, what your address has done. It is the most honest page we have, because it is just showing you what happened.',
    },
    { kind: 'h2', text: 'Forge Worlds — play', id: 'worlds' },
    {
      kind: 'p',
      text: 'Browser games where the things you win are actually yours.',
    },
    {
      kind: 'p',
      text: 'The distinction is worth being precise about, because "own your items" has been said so often that it has stopped meaning anything. In an ordinary game, an item is a row in the developer\'s database. They can change it, remove it, or shut the servers down, and your only recourse is a strongly worded post. Here the item is on the chain: transferable, sellable, and outside our reach. We could delete our own game and the item would still exist.',
    },
    {
      kind: 'p',
      text: 'That is the whole claim. It is a smaller claim than the marketing in this space usually makes, and unlike most of that marketing it is checkable.',
    },
    { kind: 'h2', text: 'Forge Market — buy and sell', id: 'market' },
    {
      kind: 'p',
      text: 'A marketplace where the money is held until the thing arrives.',
    },
    {
      kind: 'p',
      text: 'Selling to a stranger has one hard problem and it is not payments: it is who moves first. Send the goods and hope, or send the money and hope. Every marketplace solves this by being trusted with the money in the middle, which works and requires you to trust the marketplace.',
    },
    {
      kind: 'p',
      text: 'Ours holds it in escrow on chain instead. The buyer\'s money is committed and the seller can see that it is committed, but neither party — and, importantly, not us either — can simply take it. It releases when the sale completes. The interesting part is not that it is on a blockchain; it is that the escrow\'s rules are published and identical for everybody, including us.',
    },
    { kind: 'h2', text: 'Forge Create — make a token', id: 'create' },
    {
      kind: 'p',
      text: 'Launch your own coin, on Hearth or on Ethereum or on Solana. It takes a few minutes and no code.',
    },
    {
      kind: 'p',
      text: 'This one deserves a warning label more than a pitch, so here it is. Creating a token is easy. Creating a token anyone should want is not, and the ease of the first has produced an enormous quantity of the second. If you are making one for a community, a game, an event, a club — good, this is exactly the boring useful case. If you are making one because you have seen what happens when a token goes up, please read the article about how people lose money first.',
    },
    {
      kind: 'p',
      text: 'We would rather say that on our own product page than have it be the thing everybody knows and nobody prints.',
    },
    { kind: 'h2', text: 'Forge Foresight — put a small stake on an outcome', id: 'foresight' },
    {
      kind: 'p',
      text: 'Say what you think will happen, back it with a stake, and be right or wrong in public.',
    },
    {
      kind: 'p',
      text: 'Prediction markets are more interesting than they look. When people have to put something behind an opinion, the aggregate of those opinions turns out to be a decent forecast — better, often, than the confident people on television. That is the appeal: not the gambling, the fact that a price is a group of people\'s real belief rather than their stated one.',
    },
    {
      kind: 'p',
      text: 'It is still betting, and it should be treated as betting: an amount you would spend on an evening out, not an amount that matters. If you find yourself checking a position at two in the morning, that is information about you rather than about the market.',
    },
    { kind: 'h2', text: 'Forge Trade — trade on chain', id: 'trade' },
    {
      kind: 'p',
      text: 'The sixth product, and the one where we have to be careful, because it is not finished.',
    },
    {
      kind: 'p',
      text: 'The intent is trading that settles on chain, with no exchange holding your coins in the middle. The pages exist and are marked as incomplete where they are incomplete, which is a policy we adopted after realising how much of this industry ships a page that looks live and does nothing. A product you can open and find nothing to do in is annoying; a product you can open and not realise you have found nothing to do in is dishonest.',
    },
    {
      kind: 'p',
      text: 'When it works, it will say so here. Until then it is listed last and labelled.',
    },
    { kind: 'h2', text: 'Forge Exchange — swap without an order book', id: 'exchange' },
    {
      kind: 'p',
      text: 'A newer surface, and mechanically the most interesting thing we run.',
    },
    {
      kind: 'p',
      text: 'A traditional exchange matches your buy against somebody else\'s sell. If nobody is selling, you wait. Forge Exchange instead trades against a pool of both assets, at a price set by the ratio between them — a formula rather than a counterparty. There is always something to trade against, at some price, and the price gets worse as you take more of one side, which is exactly the discipline you want.',
    },
    {
      kind: 'p',
      text: 'It runs on Hearth, the code is published, and it does not hold your coins: the pool is a program, not an account somebody controls.',
    },
    { kind: 'h2', text: 'The parts you do not think of as products', id: 'the-plumbing' },
    {
      kind: 'p',
      text: 'Three more things exist and are worth knowing about.',
    },
    {
      kind: 'p',
      text: '**The wallet.** In a browser, on a phone, on a desktop. It holds keys and signs things; it does not hold your coins, for the reason explained at length elsewhere. You can use somebody else\'s instead, and nothing breaks, which is the point.',
    },
    {
      kind: 'p',
      text: '**The pool.** For people who do want to mine seriously, with real hardware, including a mode where mining one chain earns another at the same time. It is the least glamorous surface we run and probably the most technically satisfying.',
    },
    {
      kind: 'p',
      text: '**The test network.** A complete second copy of everything, running on chain id ' +
        claim('emberTestnetChainId') +
        ' instead of ' +
        claim('emberChainId') +
        ', where the coins are worthless on purpose. If you want to try any of the above without money involved, that is what it is for, and there is a faucet that will hand you some to play with.',
    },
    { kind: 'h2', text: 'What we would suggest', id: 'where-to-start' },
    {
      kind: 'p',
      text: 'If you are new to all of it: mine for an evening, then send what you mined to a friend. Those two things together teach you more about how this works than any amount of reading, including this.',
    },
    {
      kind: 'p',
      text: 'If you already hold crypto: put a small amount in and buy something in the marketplace. The escrow is the piece we are proudest of and it is the piece that is impossible to appreciate in the abstract.',
    },
    {
      kind: 'p',
      text: 'And if you are a developer, everything above has an API, the chain takes the same tools as Ethereum, and there is a test network waiting. We did not build anything you need our permission to use, which was a deliberate decision and one we intend to keep.',
    },
  ],
}

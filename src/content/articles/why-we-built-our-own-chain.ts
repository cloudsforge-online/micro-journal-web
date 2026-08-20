import { claim } from '../claims.ts'
import type { Article } from '../types.ts'

export const article: Article = {
  slug: 'why-we-built-our-own-chain',
  title: 'Why we built our own chain, and what it is actually for',
  dek: 'There are already plenty of blockchains. Building another one is either a very good decision or a very expensive hobby, so here is the honest reasoning, including the parts that argue against it.',
  description:
    'Why CloudsForge runs Hearth, its own blockchain, instead of building on an existing one — and the honest case against doing it.',
  authorId: 'cloudsforge',
  publishedAt: '2026-08-04',
  updatedAt: null,
  tags: ['how-things-work', 'what-we-build'],
  hero: {
    src: '/articles/why-we-built-our-own-chain/hero.png',
    alt: 'A drawing of thirteen identical blocks standing at even spacing on one line, each throwing a single spark upward, brightening from left to right.',
  },
  card: '/articles/why-we-built-our-own-chain/card.png',
  body: [
    {
      kind: 'lead',
      text: 'Whenever anybody announces a new blockchain, the correct first reaction is suspicion. The world does not obviously need more of them, most of the ones that exist are underused, and "we made our own chain" has been the setup line for a great many disappointing stories. So rather than announce ours, we would like to explain the argument we had with ourselves about it, and let you decide whether we won.',
    },
    { kind: 'h2', text: 'What we were trying to do', id: 'what-we-wanted' },
    {
      kind: 'p',
      text: 'CloudsForge is a set of things you can do with crypto that are not trading it. Play a game and keep what you win. Sell something to a stranger with the money held safely until it arrives. Put a small stake on what you think will happen. Launch a token. Mine, in a browser tab, on a laptop, without buying hardware.',
    },
    {
      kind: 'p',
      text: 'Every one of those has the same shape underneath: a lot of very small transactions, made by people who are not going to think of themselves as crypto users, several times a session. A player picking up an item. A bid. A stake of pocket change.',
    },
    {
      kind: 'p',
      text: 'That shape is exactly the one existing chains handle worst, and the reason is not technical incompetence — it is economics. A public chain has finite space in each block, and that space is auctioned. When demand rises, the price rises, and it rises for everyone equally: your five-cent in-game pickup bids against a million-dollar transfer for the same slot. There is no mechanism by which the small transaction wins that auction, and no amount of engineering enthusiasm changes it.',
    },
    {
      kind: 'p',
      text: 'You can watch this happen on any busy chain. The applications that survive a fee spike are the ones where the amounts are large. Everything small quietly stops, and the people running it explain that usage is seasonal.',
    },
    { kind: 'h2', text: 'The three options', id: 'the-three-options' },
    {
      kind: 'p',
      text: 'There were only ever three ways to handle that, and we considered all of them for longer than it probably sounds.',
    },
    {
      kind: 'p',
      text: '**Build on an existing chain and accept the fees.** Simplest, and it is what most people should do. It fails specifically when the median transaction is worth less than the fee to make it, which for a game is most of them. We would have spent years building products whose economics depended on somebody else\'s congestion.',
    },
    {
      kind: 'p',
      text: '**Keep it all in a database and settle occasionally.** Also viable, and much cheaper. But then the item you won in a game is a row in our database that we could edit, and the whole point of the sentence "you really own what you win" evaporates. If the answer to "what if you change it?" is "we promise not to", you have built a normal web application with extra vocabulary.',
    },
    {
      kind: 'p',
      text: '**Run a chain where the small transaction is the normal case.** More work than either. It is what we did, and the reason is the one above: it was the only option that let the ownership claim be literally true while the fees stayed near nothing.',
    },
    {
      kind: 'callout',
      title: 'The part that argues against us',
      text: 'A small chain is a less secure chain. Security here means the cost of rewriting history, and that cost is proportional to how much work is going into it. Ours is a fraction of Bitcoin\'s and will be for a long time. Anyone who tells you their new network is as safe as the big ones is either confused or hoping you are.',
    },
    { kind: 'h2', text: 'So what Hearth is', id: 'what-hearth-is' },
    {
      kind: 'p',
      text: 'Hearth is the network. EMBER is what you hold on it. A Spark is a convenient way to say a very small amount of EMBER — there are ' +
        claim('sparksPerEmber') +
        ' of them in one — and it is a way of writing the number rather than a second currency, which matters more than it sounds like it should. A great many projects have ended up with two units that were supposed to be the same thing and gradually were not.',
    },
    {
      kind: 'p',
      text: 'A block arrives every ' +
        claim('emberBlockSeconds') +
        ' seconds. Deposits wait ' +
        claim('emberConfirmations') +
        ' blocks before you can spend them, which is a wait of about a quarter of an hour and is a deliberate piece of caution rather than a limitation: a payment that becomes spendable instantly is a payment that can be undone underneath you.',
    },
    {
      kind: 'p',
      text: 'The main network answers to chain id ' +
        claim('emberChainId') +
        ' and the test network to ' +
        claim('emberTestnetChainId') +
        '. We publish both because "it works with your existing wallet" is a claim you cannot check, and a chain id is one you can: add the network, send something, see for yourself. Two different ids rather than one is not tidiness — a single shared id would make every transaction on the test network replayable on the real one.',
    },
    { kind: 'h2', text: 'What we deliberately did not invent', id: 'what-we-didnt-invent' },
    {
      kind: 'p',
      text: 'This is the decision we are most confident about.',
    },
    {
      kind: 'p',
      text: 'Hearth speaks the same language as Ethereum. The same wallet formats, the same address format, the same way of writing programs that run on it. We wrote none of that and we changed none of it, which was tempting in about a dozen places where we thought we could do slightly better.',
    },
    {
      kind: 'p',
      text: 'The reason is a lesson the field has learned expensively and repeatedly. Every clever incompatibility is a wall between your users and every tool that already exists — every wallet, every library, every piece of documentation, every developer who already knows how. A chain that requires new tooling gets the tooling its own team writes, and no more. We would rather be boring and reachable than novel and alone.',
    },
    {
      kind: 'p',
      text: 'The consequence, which we like: if you decide tomorrow that you would rather use a different wallet, you can. Nothing about Hearth requires our software. That is not generosity, it is the only arrangement in which "you own this" is a statement about the asset rather than about our goodwill.',
    },
    { kind: 'h2', text: 'Mining, and why it is a browser tab', id: 'mining' },
    {
      kind: 'p',
      text: 'Most people encounter mining as a photograph of a warehouse. That version is real, and it is not the only version.',
    },
    {
      kind: 'p',
      text: 'A young chain has a genuine chicken-and-egg problem: it needs people running it to be worth using, and it needs to be worth using for people to run it. The usual answer is to sell tokens to investors first. We would rather the coin arrived the way it is supposed to — by somebody doing the work that keeps the network going — which meant making that work available to a person with a laptop and no particular interest in hardware.',
    },
    {
      kind: 'p',
      text: 'So mining Hearth is a page you open. It will not make you rich, and we would think less of ourselves for implying otherwise. What it does is let somebody hold their first coin without buying it, which is a materially different first experience from typing a card number into an exchange, and it puts the network in the hands of the people who use it rather than the people who funded it.',
    },
    { kind: 'h2', text: 'What Hearth is not for', id: 'what-its-not-for' },
    {
      kind: 'p',
      text: 'Not for holding your savings. It is young, thinly traded, and the honest expected value of any young coin is a wide distribution with a lot of mass near zero. If you want the durable thing, hold the durable thing — deposits into CloudsForge can arrive as ' +
        claim('creditableChainNames') +
        ', and that is not an accident of what we happened to build.',
    },
    {
      kind: 'p',
      text: 'Not a replacement for the chains that already work. Bitcoin is extraordinarily good at being expensive to rewrite. Ethereum is extraordinarily good at being where everything already is. Neither of those is a problem we tried to solve, and a project claiming to solve all three at once is describing a wish.',
    },
    {
      kind: 'p',
      text: 'Not permanent by assertion. A chain lasts as long as somebody keeps running it. Ours is run by us and by anybody who joins, which is a real answer but not an unconditional one, and we would rather say so than imply an eternity we cannot underwrite.',
    },
    { kind: 'h2', text: 'The honest summary', id: 'the-summary' },
    {
      kind: 'p',
      text: 'We built a chain because the products we wanted to build needed transactions to cost approximately nothing, and because the alternative to that was a database with a promise attached. We kept it compatible with everything so that using it would never trap anyone. We made the coin mineable in a browser so the first one you hold is one you earned.',
    },
    {
      kind: 'p',
      text: 'And it is smaller and less battle-tested than the networks it sits next to, which is a real cost and not one we are going to bury in a footnote. Whether the trade was worth it is a question that gets answered by whether the things built on top turn out to be worth using — which is, appropriately, not a question we get to decide.',
    },
  ],
}

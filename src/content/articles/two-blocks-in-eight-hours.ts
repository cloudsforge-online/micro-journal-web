import type { Article } from '../types.ts'

export const article: Article = {
  slug: 'two-blocks-in-eight-hours',
  title: 'Two blocks in eight hours',
  dek: 'A soft fork carrying 2.53 per cent of the hashrate split Bitcoin on 8 August, and the chain it created almost immediately stopped moving. Both sides are calling that a vindication. Both are reading it wrong.',
  description:
    'BIP-110 split Bitcoin on 8 August and the breakaway chain managed two blocks in eight hours. What that actually settles about who writes the rules.',
  authorId: 'cloudsforge',
  publishedAt: '2026-08-18',
  updatedAt: null,
  tags: ['the-wider-world'],
  hero: {
    src: '/articles/two-blocks-in-eight-hours/hero.png',
    alt: 'A drawing of one line of blocks branching in two: the upper branch continues at even spacing, the lower one stops after two and fades.',
  },
  card: '/articles/two-blocks-in-eight-hours/card.png',
  body: [
    {
      kind: 'lead',
      text: 'On Saturday 8 August, at block 961,632, a piece of Bitcoin software started refusing any block that did not carry a particular flag. AntPool mined a block without it. Most of the network accepted that block; the nodes running this software threw it away and waited for one they liked, which a miner on Ocean eventually produced. From that moment there were two Bitcoins. By six the following morning the breakaway had managed two blocks in roughly eight hours, against forty-eight on the chain it left. On 9 August the proposal\'s own document was marked Closed.',
    },
    { kind: 'h2', text: 'What BIP-110 was', id: 'what-it-was' },
    {
      kind: 'p',
      text: 'The Reduced Data Temporary Softfork, authored by Dathon Ohm, first drafted in October 2025 and given its number that December. Seven consensus restrictions, imposed for 52,416 blocks — about a year — and then automatically expiring: output scripts longer than 34 bytes invalid, except OP_RETURN outputs up to 83; script pushes and witness items over 256 bytes invalid; undefined witness and tapleaf versions unspendable; the taproot annex banned; control blocks over 257 bytes invalid; OP_SUCCESS invalid anywhere in a tapscript even unexecuted; and no tapscript allowed to execute OP_IF or OP_NOTIF. Coins confirmed before activation were grandfathered, so nothing already in existence could be frozen.',
    },
    {
      kind: 'p',
      text: 'The target was arbitrary data — images, text, whatever somebody wanted to commit — stored inside Bitcoin transactions. The immediate grievance was Bitcoin Core 30.0, published on 10 October 2025, which raised the default `-datacarriersize` from 83 bytes to 100,000, permitted multiple OP_RETURN outputs in one transaction, and thereby retired a relay limit that had stood for nine years. Node operators who disagreed moved to Bitcoin Knots, which by last summer was running on roughly a fifth of the public network.',
    },
    { kind: 'h2', text: 'The mechanism, which is the actual story', id: 'the-mechanism' },
    {
      kind: 'p',
      text: 'Activation used a modified version-bits deployment on bit 4, with a threshold of 1,109 signalling blocks out of 2,016 — 55 per cent, chosen deliberately below the 1,916 of 2,016 that every previous soft fork required, on the argument that a rule which expires by itself deserves a lower bar. That threshold was never approached. What happened instead was the fallback: at block 961,632 the software entered mandatory signalling, in which any block not carrying bit 4 is rejected outright.',
    },
    {
      kind: 'p',
      text: 'This is a user-activated soft fork, and the pattern is the one from 2017. Miners produce blocks; users decide which blocks count; a sufficiently determined set of economic nodes can therefore make a non-signalling block worthless, and miners who like being paid will fall into line before the deadline rather than after it. That is the theory in full, and it is not an unreasonable one.',
    },
    {
      kind: 'p',
      text: 'The signalling never came close. In late June, mining support stood at 0.31 per cent of hashrate — about 5 exahashes a second out of something near 940. Jason Hughes of Ocean, whose pool was the only one signalling at all, measured 0.6 per cent of blocks over the preceding sixty days in July and reported that every other major pool he monitored was running Bitcoin Core v30 or v31: "the pools are aware but ignoring." In the fortnight before mandatory signalling began, the figure reached 2.53 per cent — 51 blocks out of 2,016, against the 1,109 the proposal asked for.',
    },
    { kind: 'h2', text: 'Why the fork stopped moving', id: 'why-it-stalled' },
    {
      kind: 'p',
      text: 'Here is the part that decided the outcome, and it has nothing to do with anybody\'s opinion of data in the chain.',
    },
    {
      kind: 'p',
      text: 'A chain that soft-forks away inherits the difficulty of the chain it left. On 8 August the breakaway needed exactly as much work per block as Bitcoin did, with a fortieth of the machines available to produce it. And difficulty does not retarget on a clock — it retargets every 2,016 blocks. At Bitcoin\'s rate that is a fortnight. At the fork\'s rate, the monitor tracking it estimated the next adjustment was 350 days away.',
    },
    {
      kind: 'p',
      text: 'So the penalty for a minority soft fork is not unpopularity. It is that the mechanism which would rescue it is denominated in the single resource it does not have: a chain that cannot produce blocks cannot reach the retarget that would let it produce blocks. That is arithmetic, and it would have been just as true of a rule everybody agreed was excellent. It is the same machine described in [our piece on the difficulty adjustment](/a/the-difficulty-adjustment-is-not-a-safety-net), seen from the side where it does the killing.',
    },
    {
      kind: 'p',
      text: 'None of this was a surprise to the people who work on this for a living. Bitcoin Optech\'s newsletter of 26 June — six weeks before the split — carried Murch walking through why a mandatory-signalling fork behind minority hashrate falls behind on proof of work and stalls, rather than coercing anybody. In the same discussion Antoine Poinsot pointed out that Bitcoin Core cannot construct a block template that satisfies BIP-110 at all, so a miner wanting to support it needed external template software or had to mine empty blocks. The prediction was published, in public, with a date on it, and then it came true to the block.',
    },
    { kind: 'h2', text: 'What both sides are saying', id: 'both-sides' },
    {
      kind: 'p',
      text: 'The proposal\'s own site still reports that the soft fork "has been activated at the block height 961632 ... successfully", underneath a banner saying the mandatory signalling period is still running. It describes Bitcoin as "alive albeit low hash-powered" with blocks arriving "albeit at a slower rate than usual" — which is an accurate description of their chain and not of the one with all the hashrate on it. That is the sentence a project writes when the plan and the outcome have parted company and nobody has gone back to update the copy.',
    },
    {
      kind: 'p',
      text: 'On the other side, Michael Saylor published "110 Reasons BIP 110 Is a Bad Idea" over the weekend of 18 and 19 July, arguing that Bitcoin "cannot read intent", that "spam is not a consensus primitive", and closing with "Bitcoin does not need guardians of purity. It needs guardians of neutrality." He also made the point that the restrictions lapse in about a year "but the precedent does not". Adam Back objected on the same structural ground: that using consensus to distinguish acceptable content from unacceptable content crosses a line the design has never crossed. Their reading of the split is that it proves how dangerous it is to legislate what the chain may be used for.',
    },
    { kind: 'p', text: 'Both readings are too flattering to the people making them.' },
    { kind: 'h2', text: 'What it actually settled', id: 'what-it-settled' },
    {
      kind: 'p',
      text: 'The user-activated soft fork did not fail. It worked precisely as designed. The nodes enforced the rule. They rejected the non-signalling block. They followed the chain that obeyed. Every component behaved to specification, and anybody who wanted proof that a determined minority of node operators can refuse a miner has it, timestamped.',
    },
    {
      kind: 'p',
      text: 'What failed is the assumption the theory has always rested on and never once had to demonstrate: that a chain enforcing a rule the miners reject is worth something anyway. That was never tested in 2017. Hughes, who supported this fork, put the comparison most usefully himself — SegWit went into its UASF window with roughly a third of the hashrate already behind it, and BIP-110 went into its window with two and a half per cent. In 2017 the pools moved before the deadline arrived and the threat was never called. A threat that is never called is not evidence that it works.',
    },
    { kind: 'p', text: 'This time it was called. The answer took eight hours.' },
    {
      kind: 'p',
      text: 'The honest lesson is therefore narrower and considerably less comfortable than either camp would like. A user-activated soft fork is credible in inverse proportion to how badly you need one. Where most of the hashrate already agrees, it is a scheduling device that saves everybody an argument. Where it does not, it is a chain that produces two blocks between midnight and dawn. There is no configuration in between where it functions as a lever ordinary users can pull against miners who have made up their minds.',
    },
    {
      kind: 'p',
      text: 'Which lands on a claim about Bitcoin governance that both camps have spent a decade stepping around. Economic nodes hold a veto over changes miners *want*, and hold nothing at all over changes miners *refuse*. Those are not two applications of one power. They were never the same power, and this month is the first time the difference has been measured in public.',
    },
    {
      kind: 'callout',
      title: 'The grievance was not silly',
      text: 'It is easy to write this up as a rout and skip what drove it. Node operators store whatever the chain commits to, and "do not look at it" is not much of an answer for somebody in a jurisdiction where possession is decided without reference to intent. That is a real problem with no clean technical fix. It is also worth noting that mempool.space research published in February found nonstandard OP_RETURN usage extremely low and unchanged after Core 30.0, which suggests the lever being pulled was not attached to the thing people were angry about.',
    },
    { kind: 'h2', text: 'A note from somebody who had to choose', id: 'the-operator-bit' },
    {
      kind: 'p',
      text: 'Running a node is not a spectator activity, which is easy to forget until a fork date turns your configuration file into a ballot. Every operator running bitcoind had to decide, before 8 August, which implementation to run and what to set the data-carrier limit to, and there was no neutral option available. Running Core was a choice. Running Knots was a choice. Not upgrading was a choice with a date attached.',
    },
    {
      kind: 'p',
      text: 'The second-order problem is worse for anybody who credits incoming payments. Both chains accepted the same signed transactions, so a payment made on one could be rebroadcast on the other — replay, in the polite term — which turns "we have seen the money" into a question about which history you happened to be watching. CloudsForge holds a deposit for a fixed number of confirmations before it becomes spendable, and most of the time that is ordinary caution about small reorganisations. During a split it is the only thing between a credited balance and a payment that exists solely on a chain nobody uses.',
    },
    {
      kind: 'p',
      text: 'The practical advice for a small operator through a fork is dull and correct: increase your confirmation depth, watch both tips rather than one, and stop treating "confirmed" as a property of a transaction. It is a property of a chain, and during a split there is more than one.',
    },
    { kind: 'h2', text: 'What did not expire', id: 'what-did-not-expire' },
    {
      kind: 'p',
      text: 'The restrictions were built to lapse on their own after about a year, which was the cleverest thing in the design and the part that never got used. The demonstration is what remains. Anybody who wants to change Bitcoin against the miners\' preference now has a public, dated measurement of the price: two blocks, eight hours, and a difficulty adjustment 350 days out.',
    },
    {
      kind: 'p',
      text: 'The next proposal will be written by people who have read that number. Whether that leaves Bitcoin more stable or simply more captured is not a question the chain is capable of answering about itself.',
    },
    { kind: 'h2', text: 'Sources', id: 'sources' },
    {
      kind: 'ul',
      items: [
        '[BIP-110 in the BIPs repository](https://github.com/bitcoin/bips/blob/master/bip-0110.mediawiki) — the seven rules, the 1,109-of-2,016 threshold, the mandatory signalling window, and the status change to Closed on 9 August 2026.',
        '[CoinDesk, on the split](https://www.coindesk.com/tech/2026/08/09/controversial-bitcoin-fork-bip-110-mines-two-blocks-then-stops) — block 961,632, the two blocks in eight hours, the 48-block gap, AntPool and Ocean, and the 350-day retarget estimate.',
        '[CoinDesk, entering mandatory signalling](https://www.coindesk.com/tech/2026/08/07/frame-bitcoin-s-bip-110-enters-mandatory-signaling-with-less-than-3-miner-support) — signalling "seldom exceeding 2.5%" against the 55 per cent threshold.',
        '[Jason Hughes in Bitcoin Magazine](https://bitcoinmagazine.com/bitcoin-mining/ocean-mining-vp-jason-hughes-bip-110-on-track-to-fail-as-miner-signaling-stays-below-1) — 0.6 per cent of blocks over sixty days, the pools running Core v30, and the comparison with SegWit\'s third of the hashrate, from the only pool that was signalling.',
        '[Bitcoin Optech newsletter 411](https://bitcoinops.org/en/newsletters/2026/06/26/) — Murch on why a minority-hashrate mandatory-signalling fork stalls, and Poinsot on Core being unable to build a compliant template, both six weeks before the split.',
        '[Bitcoin Core 30.0 release notes](https://bitcoincore.org/en/releases/30.0/) — the data-carrier default raised to 100,000 and multiple OP_RETURN outputs made standard.',
        '[Decrypt on Saylor\'s essay](https://decrypt.co/373819/strategys-michael-saylor-makes-110-point-case-against-bitcoins-bip-110) — the quotations, and the 55 versus 95 per cent comparison.',
        '[mempool.space OP_RETURN research](https://research.mempool.space/opreturn-report/) — the measurement of what the policy change did and did not change.',
      ],
    },
  ],
}

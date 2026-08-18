import type { Article } from '../types.ts'

export const article: Article = {
  slug: 'the-difficulty-adjustment-is-not-a-safety-net',
  title: 'The difficulty adjustment is not a safety net',
  dek: 'Twice in Bitcoin\'s history has difficulty been lower than it was a year earlier. The first time, a government banned mining. The second time is happening now, and the cause is a better tenant.',
  description:
    'Bitcoin difficulty has fallen year on year for only the second time ever. The first was a ban; this one is a landlord taking a better offer.',
  authorId: 'cloudsforge',
  publishedAt: '2026-08-18',
  updatedAt: null,
  tags: ['hearth', 'the-wider-world'],
  hero: {
    src: '/articles/the-difficulty-adjustment-is-not-a-safety-net/hero.png',
    alt: 'A drawing of evenly spaced block marks along a rule, above a heavy bronze line that steps down three times and keeps going.',
  },
  card: '/articles/the-difficulty-adjustment-is-not-a-safety-net/card.png',
  body: [
    {
      kind: 'lead',
      text: 'On 8 August the Bitcoin network adjusted its mining difficulty upward by just under one per cent, to 127.48 trillion. Nothing about that number is dramatic, which is exactly the thing worth noticing. Arriving at a boring number this year has taken three of the largest downward adjustments the chain has ever made and the quiet departure of enough machines to leave difficulty roughly a fifth below the record of 155.97 trillion it set on 29 October last year. The mechanism that turned all of that into "no change worth mentioning" is the most consistently misread piece of equipment in this field.',
    },
    { kind: 'h2', text: 'What the retarget actually does', id: 'the-retarget' },
    {
      kind: 'p',
      text: 'Every 2,016 blocks — a fortnight, if blocks arrive on schedule — every Bitcoin node independently recalculates how hard the next block must be. It takes how long those blocks were supposed to take, divides by how long they actually took, moves the target by that ratio, and clamps the result to a factor of four in either direction. There is no vote, no committee, and no announcement. Thousands of machines that have never spoken to each other arrive at the same number because they ran the same division on the same headers.',
    },
    {
      kind: 'p',
      text: 'The consequence is that the ten-minute block is not a target anybody aims at. It is a fixed point the network is dragged back towards by arithmetic that neither knows nor cares why the hashrate moved.',
    },
    {
      kind: 'p',
      text: 'On 14 June, at block 953,568, that arithmetic produced a cut of 10.09 per cent — from 138.96 trillion down to 124.93 trillion — because the preceding fortnight had taken about fifteen and a half days. February had already delivered a drop of 11.16 per cent and March another of 7.76 per cent. Three of the steepest declines on record, inside eight months, on a chain that had spent most of fifteen years going one way.',
    },
    { kind: 'h2', text: 'The second time this has happened', id: 'second-time' },
    {
      kind: 'p',
      text: 'Difficulty has now been lower than it was twelve months earlier on exactly two occasions. The first was the summer of 2021, when China banned mining and roughly half the world\'s hashrate was physically unplugged, crated and flown somewhere else. That was a political event with a date and a decree attached to it.',
    },
    {
      kind: 'p',
      text: 'This one has no decree. Nobody banned anything, no jurisdiction changed its mind, and the machines are mostly still in the same buildings, owned by the same companies, connected to the same substations. They are switched off because the building found a better tenant.',
    },
    { kind: 'h2', text: 'Where the hashrate went', id: 'where-it-went' },
    {
      kind: 'p',
      text: 'Bernstein\'s deal tracker counted about 7 gigawatts of miner-controlled power contracted out to hyperscalers, neoclouds and chipmakers across nineteen agreements worth more than $135bn — and noted that this is under a quarter of the roughly 30 gigawatts those same companies have in their planned pipeline. By late July the tracker had passed 7.5 gigawatts and $150bn, having registered a new deal about once a week that month.',
    },
    {
      kind: 'p',
      text: 'The individual transactions are what make the direction unarguable. On 6 July, TeraWulf signed a twenty-year lease with Anthropic for a campus at Hawesville, Kentucky: around 401 megawatts of critical load, about $19bn of contracted revenue over the term, against a company then valued at roughly $12bn. IREN has five years and $9.7bn with Microsoft. Cipher has fifteen years and $5.5bn with AWS. Hut 8 has fifteen years and $9.8bn for 352 megawatts in Texas.',
    },
    {
      kind: 'p',
      text: 'The Hawesville site deserves a second look, because its history is the whole argument in one parcel of land. It was a Century Aluminium smelter until 2022, when electricity got too expensive to make metal profitably. TeraWulf bought the 750 acres for $200m in February. Roughly 480 megawatts of existing capacity is already tied to it, through high-voltage lines and an energised substation that somebody built decades ago for a different industry.',
    },
    {
      kind: 'p',
      text: 'A smelter became a mine and a mine became a data centre, and through all of it the asset never changed. The asset was always the interconnect — the lines, the substation, the queue position a new build waits years for. Hashing was a tenant that could pay the rent while nothing else wanted the space. Something else now wants the space, and it has an investment-grade credit rating.',
    },
    { kind: 'h2', text: 'So what is difficulty for', id: 'what-difficulty-is-for' },
    {
      kind: 'p',
      text: 'The retarget gets described, almost universally, as a safety mechanism: the thing that keeps Bitcoin alive when miners leave. It does keep the chain moving. It does not keep the chain secure, and running those two together is how a reader ends up believing that a network which has shed a fifth of its difficulty is exactly as expensive to attack as it was in November.',
    },
    {
      kind: 'p',
      text: 'What the retarget guarantees is cadence. Ten minutes a block, at any level of security whatsoever. If every operator on earth but one switched off tomorrow, difficulty would fall to whatever that operator could sustain, blocks would resume arriving on schedule, and to anyone reading timestamps the chain would look completely normal.',
    },
    {
      kind: 'p',
      text: 'Security is a different quantity: the cost of producing a longer competing chain. The retarget does not defend that number. It *sets* it, and it sets it at whatever the revenue per block will support. Difficulty is therefore not a shield at all. It is a price — the market\'s running estimate of what an hour of Bitcoin\'s history is worth defending, marked to market every fortnight, in public, whether or not anybody likes the answer.',
    },
    {
      kind: 'p',
      text: 'Which makes the correct reading of this year the opposite of the reassuring one. The safety net did not hold. The price discovered a lower number, because the people who had been buying security found somebody who would pay more for the same electricity.',
    },
    { kind: 'h2', text: 'The number nobody puts on a slide', id: 'the-fee-number' },
    {
      kind: 'p',
      text: 'In the week to 17 August, Bitcoin transaction fees totalled 22 BTC against 3,178 BTC of total block rewards. That is 0.69 per cent. Sixty-nine hundredths of one per cent of what miners were paid came from people actually using the chain; the rest was newly issued coin.',
    },
    {
      kind: 'p',
      text: 'This matters because of the story that is supposed to come next. The subsidy halves roughly every four years and eventually stops, and the standard answer to "what pays for security then" is that fees take over. A fee share of two-thirds of one per cent is not a fee market gradually assuming the load. It is a rounding error with thirty years of confident prose built on top of it.',
    },
    {
      kind: 'p',
      text: 'The rest of the picture is consistent with that. Hashprice — revenue per unit of hashing per day — was $31.89 per petahash on 17 August, recovered off a June low of $27.66. Checkonchain put the all-in cost of producing one bitcoin at roughly $84,300 in June, against a spot price nearer $64,000; CoinShares had listed miners at an average cash cost around $80,000 in the fourth quarter of last year. Miners sold more than 32,000 BTC in the first quarter of this year, which is more than they sold in the whole of 2025.',
    },
    {
      kind: 'p',
      text: 'None of those numbers describes a network under attack. They describe a network whose defenders are being outbid for their own inputs, which is a slower and much less cinematic problem.',
    },
    { kind: 'h2', text: 'The same loop, at both ends', id: 'both-ends' },
    {
      kind: 'p',
      text: 'We run these nodes ourselves — bitcoind, litecoind and dogecoind, on our own hardware rather than through somebody\'s API — which is an unfashionable amount of work and teaches you things a block explorer will not.',
    },
    {
      kind: 'p',
      text: 'Dogecoin is the instructive one. Since 2014 it has been merge-mined under Litecoin: a miner submits the same scrypt work to both chains and collects rewards on both, so at the margin Dogecoin\'s security costs its miners nothing extra. Most Dogecoin blocks are found by people who were not thinking about Dogecoin. It is a chain renting its security from another chain\'s economics, it has been doing so for over a decade, and it is a genuine counterexample to the tidy claim that a network must buy its own hashrate to have any.',
    },
    {
      kind: 'p',
      text: 'At the other end of the same control loop is Hearth, the chain CloudsForge runs. It sits close to its difficulty floor, which turns the retarget from a two-week average into a hair trigger. One person opening a browser tab to mine can lift difficulty thirty-two-fold; when that tab closes, the work vanishes, the next block is priced for hashrate that is no longer there, and the tip wedges for about twenty minutes until the arithmetic catches up.',
    },
    {
      kind: 'p',
      text: 'Same equation, same clamp, same complete absence of anybody in charge. On Bitcoin it takes an AI landlord and a fortnight. On ours it takes a laptop and a coffee break. The difference is scale rather than kind, and watching it happen at small scale over an afternoon is the fastest cure for thinking of the retarget as protection.',
    },
    {
      kind: 'callout',
      title: 'The part that argues against us',
      text: 'A company that runs a small chain telling you a large chain\'s security is a price rather than a promise is a company with an obvious motive. Note that the argument lands harder on us than on Bitcoin: if security is what somebody is willing to pay for it, then ours is cheap, and that is precisely why we say in writing that Hearth is not the place to keep savings. Read this as a description of our own position, not as a point being scored.',
    },
    { kind: 'h2', text: 'What is actually unresolved', id: 'unresolved' },
    {
      kind: 'p',
      text: 'The comfortable version of this year says miners are diversifying: lease revenue stabilises balance sheets, the strongest operators come through the cycle intact, and the hashrate comes home when mining pays again. Some of that is probably true. Bernstein rates the sector Outperform and is not obviously wrong to.',
    },
    {
      kind: 'p',
      text: 'The uncomfortable part is the contract lengths. Twenty years at Hawesville. Fifteen with AWS. Fifteen in Texas. Those are not hedges taken out while waiting for the price to turn — they are exits, signed with counterparties who pay monthly, in dollars, and do not halve the payment every four years.',
    },
    {
      kind: 'p',
      text: 'A miner\'s commitment to Bitcoin has never lasted longer than the block it is currently working on. That was fine for fifteen years because nothing else wanted the electricity. The question this year has actually posed is not whether the difficulty adjustment can cope, because it can cope with anything at all. The question is what number it settles on once the only miners left are the ones nobody made a better offer to.',
    },
    { kind: 'h2', text: 'Sources', id: 'sources' },
    {
      kind: 'ul',
      items: [
        '[Hashrate Index](https://hashrateindex.com/blog) — the weekly difficulty, hashprice and fee figures, including the 8 August retarget to 127.48 trillion and the fee share for the week to 17 August.',
        '[The Block, on the June retarget](https://www.theblock.co/post/362744/bitcoin-mining-difficulty-drop) — block 953,568, the 10.09 per cent cut, and the year-on-year comparison with 2021.',
        '[TeraWulf\'s announcement of the Anthropic lease](https://investors.terawulf.com/news-events/press-releases/detail/142/terawulf-announces-anthropic-lease-at-justified-data-campus-and-sale-of-majority-interest-in-abernathy-joint-venture-to-fluidstack) — the twenty-year term, 401 megawatts and roughly $19bn of contracted revenue.',
        '[Data Center Dynamics on Hawesville](https://www.datacenterdynamics.com/en/news/anthropic-signs-19bn-20-year-lease-for-kentucky-data-center-with-terawulf/) — the smelter\'s history, the 750 acres, and the existing interconnect.',
        '[Cointelegraph\'s summary of the Bernstein note](https://cointelegraph.com/news/bernstein-bitcoin-mining-deals-necessary-ai-power-crunch) — 7 gigawatts, nineteen deals, $135bn, and the 30 gigawatt pipeline.',
        '[CoinShares mining report](https://coinshares.com/us/research/) — the average cash cost of production for listed miners.',
      ],
    },
  ],
}

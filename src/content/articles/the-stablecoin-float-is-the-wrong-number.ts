import type { Article } from '../types.ts'

export const article: Article = {
  slug: 'the-stablecoin-float-is-the-wrong-number',
  title: 'The stablecoin float is the wrong number',
  dek: 'Supply shrank in June by the most since Terra collapsed. Volume in the same month set an all-time record. Both are true, and the figure everybody quotes does not measure the thing they are arguing about.',
  description:
    'Stablecoin supply is shrinking while volume sets records. The number everyone quotes measures inventory, not use — and velocity has a sting in it.',
  authorId: 'cloudsforge',
  publishedAt: '2026-08-18',
  updatedAt: null,
  tags: ['field-notes', 'the-wider-world'],
  hero: {
    src: '/articles/the-stablecoin-float-is-the-wrong-number/hero.png',
    alt: 'A drawing of a shrinking stack of coins beside a wide bronze arc looping back on itself several times.',
  },
  card: '/articles/the-stablecoin-float-is-the-wrong-number/card.png',
  body: [
    {
      kind: 'lead',
      text: 'In June the total supply of stablecoins fell by $7.8bn, the largest monthly contraction since Terra collapsed in May 2022. July fell another $4.1bn, and back-to-back months of shrinkage had not happened since 2023: the float peaked at $319bn on 31 May and sits at $308bn today. In that same June, stablecoins moved $1.79 trillion in adjusted volume — an all-time record, 63 per cent above May and 125 per cent above the June before it.',
    },
    {
      kind: 'p',
      text: 'Those two facts have been reported as a contradiction, usually by people who wanted one of them to be the story. They are not in tension at all. They are only in tension if you believe the first number measures demand, and it does not measure demand. It never has.',
    },
    { kind: 'h2', text: 'Inventory is not sales', id: 'inventory' },
    {
      kind: 'p',
      text: 'The market capitalisation of a stablecoin is the quantity of it sitting still at the instant you looked. It is a stock, not a flow — the boxes on the shelf, not the units that went out of the door.',
    },
    {
      kind: 'p',
      text: 'If each dollar is used once a month, then a hundred dollars of monthly payments requires a hundred dollars outstanding. If each dollar is used ten times, the same hundred dollars of payments needs ten. Supply falling while volume rises is not a demand problem. It is the arithmetic signature of the same money working harder.',
    },
    {
      kind: 'p',
      text: 'Standard Chartered\'s Geoff Kendrick put turnover at roughly six times a month, about double where it was two years ago, and had the good grace to say what that did to his own model: "Velocity has increased, which contradicts our assumption that it would remain stable." Visa\'s economists have measured USDC velocity at 13.56 per quarter against 1.65 for US M1 — each dollar cycling something like ninety times a year, against a bit under seven for the money in your current account.',
    },
    {
      kind: 'p',
      text: 'So the shrinking float is not the crisis it is being sold as. Which is where most articles would stop, and where this one has to keep going, because "velocity" is carrying an enormous amount of unexamined weight in that argument.',
    },
    { kind: 'h2', text: 'What the dollars are actually doing', id: 'what-theyre-doing' },
    {
      kind: 'p',
      text: 'Real-world payments accounted for roughly one per cent of all stablecoin movement in 2025. About $390bn of it: $226bn business-to-business, something near $90bn in payroll and remittances, $8bn settling capital-markets trades.',
    },
    {
      kind: 'p',
      text: 'The other ninety-nine per cent is trading, arbitrage, collateral shuffling, exchange plumbing and bots talking to bots.',
    },
    {
      kind: 'p',
      text: 'High velocity is therefore not evidence that stablecoins are being used as money. A dollar bouncing between two exchange accounts nine times an hour has spectacular velocity and has bought nothing. Velocity is equally consistent with a payments network and with a casino floor, and the composition data says most of it is the casino floor.',
    },
    {
      kind: 'p',
      text: 'Both of the popular readings are therefore wrong in the same way. "Supply is falling, confidence is going" reads a stock figure as a flow figure. "Volume is at records, adoption is exploding" reads a flow figure without asking what is flowing. They are opposite conclusions drawn from the same failure to check what the number counts.',
    },
    { kind: 'h2', text: 'The number that would actually mean something', id: 'the-right-number' },
    {
      kind: 'p',
      text: 'Adoption is the share of volume that **terminates**. A payment ends — somebody receives it and stops. A trade round-trips. The $226bn of business-to-business settlement is a real adoption measurement, and it grew. $1.79 trillion is not one, and neither is the $7.2 trillion of raw monthly volume that passed ACH\'s $6.8 trillion in February.',
    },
    {
      kind: 'p',
      text: 'That ACH comparison has been in every deck since, and it is a category error. Almost all ACH volume is terminal: wages, bills, invoices, one hop and done. Most stablecoin volume is not. Putting the two totals side by side is like comparing a country\'s retail sales with the number of times cash changed hands in its casinos and concluding the casinos have overtaken the shops.',
    },
    { kind: 'h2', text: 'Where velocity bites back', id: 'the-run' },
    {
      kind: 'p',
      text: 'The part that does not appear in the bullish version at all is that velocity is not a neutral efficiency statistic. It is also the rate at which a redemption queue can form.',
    },
    {
      kind: 'p',
      text: 'A dollar that turns over six times a month can be presented for redemption six times faster than one that sits still. Terra took about seventy-two hours to unwind. USDC\'s depeg in March 2023 — on an exposure of roughly eight per cent of reserves to a bank that failed, an issuer that was fully solvent and paid everybody — took a weekend. The weekend was the whole point: the banking system was shut and the chain was not.',
    },
    {
      kind: 'p',
      text: 'The GENIUS Act, signed on 18 July 2025, addresses much of what made that possible. Reserves must be held one for one in cash and short-dated Treasuries. Issuers may not pay yield to holders. Holders rank ahead of other creditors in insolvency. Reserve composition must be disclosed, with an executive attesting to it — monthly.',
    },
    { kind: 'p', text: 'Monthly, against a float that turns over six times a month.' },
    {
      kind: 'p',
      text: 'That is not an accusation against any issuer and it is not a prediction. It is an observation about cadence. The proof arrives on a schedule set by accountants; the run arrives on a schedule set by a network that does not close. In March 2023 the distance between what was in the reserve and what everybody believed was in the reserve was closed by a post on a Saturday, and everything that happened in between happened in that gap.',
    },
    { kind: 'h2', text: 'What can be proved continuously, and what cannot', id: 'what-can-be-proved' },
    {
      kind: 'p',
      text: 'Our own ledger has an assertion sitting in Postgres that refuses to let a balance go negative. Not a nightly reconciliation, not a job that emails somebody a discrepancy — a constraint the database will not allow a transaction to violate. A write that would conjure a unit out of nothing does not produce a bad balance and an alert. It fails, and the caller gets an error.',
    },
    {
      kind: 'p',
      text: 'That is a very small thing beside a reserve of Treasury bills, and pointing at it is not a claim to be in the same business. The relevant part is the cadence rather than the scale: what CloudsForge owes is knowable at every instant, because the invariant is enforced at the moment of writing rather than confirmed afterwards by somebody looking.',
    },
    {
      kind: 'p',
      text: 'An issuer holding Treasuries structurally cannot do that. Its liabilities live on a chain that never stops and its assets live in a market that closes at four and takes weekends off. There is no constraint you can install at a custodian bank that makes a bill portfolio verifiable at three in the morning on a Sunday. Attestations and proof-of-reserve schemes are a real improvement on nothing, and they remain snapshots of a moving thing.',
    },
    {
      kind: 'p',
      text: 'That gap — between continuous liabilities and periodic assets — is the actual systemic risk in this market, and it has nothing whatever to do with whether the issuers are honest. It would still be there if every one of them were.',
    },
    { kind: 'h2', text: 'The two clocks in Washington', id: 'the-clocks' },
    {
      kind: 'p',
      text: 'The rules governing the dollars are nearly finished. GENIUS takes effect at the earlier of eighteen months after enactment or 120 days after final rules; the OCC put its proposal out on 25 February, creating a new part 15 of its regulations; foreign issuers have until July 2028 to comply.',
    },
    {
      kind: 'p',
      text: 'The rules governing everything else are going backwards. The CLARITY Act passed the House 294 to 134 on 17 July 2025 and cleared Senate Banking 15 to 9 in May; Thune filed cloture on 8 August, setting up a vote on the motion to proceed on 15 September. Galaxy\'s Alex Thorn has been marking his odds of passage this year down all summer: 75 per cent on 22 May, 60 in early June, 50 by the end of it, 30 in late July once the merged text ran to 616 pages, and 10 per cent on 14 August.',
    },
    {
      kind: 'p',
      text: 'Which produces an odd settlement. The one crypto instrument that behaves like a bank deposit gets a bank-shaped rulebook, and everything else waits. Stablecoins are being regulated first because they are the easiest thing to describe, not because they are the most dangerous thing in the room.',
    },
    { kind: 'h2', text: 'What to expect the reporting to say', id: 'what-to-expect' },
    {
      kind: 'p',
      text: 'The float will probably keep shrinking, and it will keep being written up as fading confidence. It is not. It is the same dollar going round faster, and the headline number quietly stopped describing the thing it was invented to describe some time before anybody noticed.',
    },
    {
      kind: 'p',
      text: 'What has not stopped is the assumption sitting underneath every reserve disclosure ever published: that between one attestation and the next, nothing moves fast enough to matter. Six times a month is a direct measurement of that assumption, and it does not support it.',
    },
    { kind: 'h2', text: 'Sources', id: 'sources' },
    {
      kind: 'ul',
      items: [
        '[DefiLlama\'s stablecoin supply series](https://defillama.com/stablecoins) — every supply figure above is read from it directly rather than from anybody\'s summary of it: the $319bn peak on 31 May, the $7.8bn June fall, the $4.1bn July fall, and the fact that the last back-to-back monthly contraction was in 2023.',
        '[Standard Chartered research](https://www.sc.com/en/insights/) — Geoff Kendrick on turnover at roughly six times a month, and on what that does to a supply forecast.',
        '[Visa\'s stablecoin analytics](https://visaonchainanalytics.com/) — the velocity comparison with M1, and the adjusted-volume methodology that strips out bot and inorganic activity.',
        '[Artemis on real-world stablecoin payments](https://www.artemis.xyz/research) — the roughly one per cent of movement that is actual payments, and the B2B, payroll and settlement split.',
        '[The GENIUS Act as enacted](https://www.congress.gov/bill/119th-congress/senate-bill/1582) — the reserve requirement, the ban on paying yield, holder priority in insolvency, and the monthly disclosure and attestation.',
        '[OCC Bulletin 2026-3](https://www.occ.gov/news-issuances/bulletins/2026/bulletin-2026-3.html) — the proposed rulemaking of 25 February and the compliance timetable.',
        '[Cointelegraph, on Galaxy cutting its odds to ten per cent](https://cointelegraph.com/news/galaxy-lowers-clarity-act-odds-10) — Alex Thorn\'s running estimates through the summer, and what the 616-page merged text did to them.',
        '[The Block, on the cloture filing](https://www.theblock.co/news/regulation/2026-08-08-majority-leader-thune-files-cloture-on-clarity-act-setting-up-sept-15-senate-vote-411211) — Thune\'s motion of 8 August and the 15 September vote it sets up.',
      ],
    },
  ],
}

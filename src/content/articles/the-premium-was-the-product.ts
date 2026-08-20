import type { Article } from '../types.ts'

export const article: Article = {
  slug: 'the-premium-was-the-product',
  title: 'The premium was the product',
  dek: 'Strategy has sold bitcoin five times this year, having sold it once in the previous fifteen. The cause is not the price of bitcoin. It is that the company was never really a bet on bitcoin.',
  description:
    'Strategy sold 6,948 BTC across five sales in 2026. What happens to a treasury company when the premium that powered it goes to zero.',
  authorId: 'cloudsforge',
  publishedAt: '2026-08-18',
  updatedAt: null,
  tags: ['field-notes', 'the-wider-world'],
  hero: {
    src: '/articles/the-premium-was-the-product/hero.png',
    alt: 'A drawing of two stacked bars, the taller one shaded bronze and shrinking to meet the shorter one beneath it.',
  },
  card: '/articles/the-premium-was-the-product/card.png',
  body: [
    {
      kind: 'lead',
      text: 'Between 3 and 9 August, Strategy sold 1,690 bitcoin for $108.6m — an average of $64,262 a coin, against an average purchase price of $75,385. It was the fifth sale of 2026. Before this year the company had sold bitcoin exactly once, in 2022, and a great deal of the public case for owning the shares rested on the belief that it never would again.',
    },
    {
      kind: 'p',
      text: 'The five: 32 coins in late May, 1,363 across 29 and 30 June, 2,225 in the first week of July, 1,638 between 27 July and 2 August, 1,690 in the week after that. 6,948 bitcoin, $431.8m raised. The company still holds 840,447 — more than anybody — bought for roughly $63.4bn, and showing an unrealised loss close to $10bn at the price it was trading at last week.',
    },
    {
      kind: 'p',
      text: 'Every one of those sentences will be read as a story about the price of bitcoin. It is not. Bitcoin peaked near $126,000 in October 2025 and is down about half, which by its own standards is a Tuesday. What broke was something else, and it broke on a specific day.',
    },
    { kind: 'h2', text: 'The number that flipped', id: 'the-number' },
    {
      kind: 'p',
      text: 'The mechanism these companies run on is genuinely elegant, and worth stating in its strongest form before taking it apart.',
    },
    {
      kind: 'p',
      text: 'If your shares trade at twice the value of the bitcoin behind them, you can issue new shares, buy bitcoin with the proceeds, and leave every existing shareholder owning *more* bitcoin per share than they did that morning. The new buyer paid two dollars for one dollar of coin and the difference accrued to the people already there. Do it again next week. This is not a trick and it is not leverage — it is arithmetic, it is fully disclosed, and Strategy even publishes a metric for it. For four years it worked exactly as advertised.',
    },
    {
      kind: 'p',
      text: 'The whole thing depends on one input: the multiple of net asset value, mNAV, being above one. On Friday 26 June, the enterprise version of that figure went below it. The shares touched $82.16 intraday; the preferred, STRC, hit a record low of $71.40 against a $100 par value.',
    },
    {
      kind: 'p',
      text: 'Below one, the same arithmetic runs the other way. Issuing shares to buy bitcoin now leaves each existing shareholder with less bitcoin than before. The engine does not stall. It reverses.',
    },
    { kind: 'h2', text: 'The part that does not reverse', id: 'the-preferred' },
    {
      kind: 'p',
      text: 'Here is the piece that gets left out of nearly every write-up, and it is the piece that makes this structural rather than cyclical.',
    },
    {
      kind: 'p',
      text: 'A large share of the bitcoin was bought with preferred stock, not common equity. There are five series now. The perpetual ones are senior to the common, they do not mature, and one of them — the variable-rate STRC, which pays twice a month — was stepped up to twelve per cent for record dates from 1 July. Preferred dividends and interest together run to about $1.76bn a year, up from roughly $887m in February. That obligation does not shrink when bitcoin falls.',
    },
    {
      kind: 'p',
      text: 'So a common shareholder does not own a claim on 840,447 bitcoin. They own a claim on 840,447 bitcoin *minus the present value of a perpetual annuity*. While the premium existed, that annuity was effectively paid by the next equity buyer, which is why nobody had to think about it. With the premium gone, it has to come from somewhere else.',
    },
    {
      kind: 'p',
      text: 'The company has written down where. Its capital framework of 29 June sets a floor of twelve months of dividend coverage and states the position in plain numbers: the $2.55bn dollar reserve was "approximately 17.4 months of coverage", and adding $1.25bn of bitcoin monetisation capacity took the total to $3.8bn, or 25.9 months. Bitcoin is not a reserve of last resort in that sentence. It is a line item in the coverage calculation, sitting next to the cash.',
    },
    {
      kind: 'p',
      text: 'Which produces the sentence that should be the headline everywhere and is nowhere: the coins now fund the securities that were issued to buy the coins. Every dollar of the August sale went into repurchasing 1,152,020 STRC shares.',
    },
    {
      kind: 'p',
      text: 'That is not a death spiral. Nothing forces the pace and nothing is due tomorrow. It is something duller and harder to argue with — a legible, arithmetic, quarterly drain, running in the one direction the entire investment thesis said it would never run.',
    },
    {
      kind: 'callout',
      title: 'Strategy is not in trouble, and saying otherwise would be wrong',
      text: 'It is still a net buyer by a wide margin: 174,895 bitcoin bought this year against the 6,948 sold, and the stack is up about a quarter since January. The balance sheet is not distressed. The dollar reserve stood at $4.8bn on 16 August, up from $4.65bn a week earlier, and the sales run under a board-approved framework rather than a margin call. In the week to 16 August the company bought and sold no bitcoin at all — it raised about $333.7m selling 3,458,866 shares, paid $52.4m of preferred dividends, spent $132.2m buying preferred back, and put $149.1m into the reserve. The $8.22bn net loss reported for the second quarter is almost entirely an unrealised mark on coins it still holds. That is a treasurer managing a liability, not a company being liquidated. The argument here is about the direction of a mechanism, not the solvency of a firm.',
    },
    { kind: 'h2', text: 'The rest of the cohort has less room', id: 'the-cohort' },
    {
      kind: 'p',
      text: 'There are now 197 public companies holding bitcoin on their balance sheets, 1.263m coins between them. Twenty One has 43,514, Metaplanet about 43,000, MARA around 35,500. Almost none of them have $4.8bn of cash to smooth anything with, and this summer the smaller end started unwinding in public.',
    },
    {
      kind: 'p',
      text: 'Satsuma\'s holders voted on 20 July to liquidate the entire 668-coin holding and cancel the London listing — 90.6 per cent in favour, with four of the company\'s six directors against it. The coins had cost about $113,000 each. Sequans sold 1,025, then roughly 80 per cent of what was left, and is monetising the last 658; the phrase "pioneer in Bitcoin treasury" appears in its press releases until 10 February and in none of them after 25 February. Nakamoto is down 99 per cent since the SPAC that created it in May 2025, has sold about 284 coins for $20m, and has roughly 70 per cent of its remaining 5,342 pledged against a Kraken facility — which VanEck\'s Matthew Sigel called a potential binary event, a phrase doing a lot of work. Jack Mallers stepped down at Twenty One. Adam Back\'s BSTR merger fell apart.',
    },
    {
      kind: 'p',
      text: 'Of the fourteen treasury companies whose multiple was legible in mid-August, eleven were trading below the value of the coins they hold. Metaplanet at 0.85. Smarter Web at 0.78. Twenty One at 0.73. Capital B at 0.59. Strategy, at 1.04, is one of the three still above water, and it is the one with the largest obligation sitting under it.',
    },
    {
      kind: 'p',
      text: 'None of that is bitcoin failing. Every one of those companies still holds coins that are worth what coins are worth. What failed was the separate and much more fragile business of being valued at more than the thing you hold.',
    },
    { kind: 'h2', text: 'The support nobody was counting', id: 'the-index' },
    {
      kind: 'p',
      text: 'MSCI opened a consultation on 14 August on whether "non-operating companies" belong in its equity indices. Two screens: do operating assets make up more than half of total assets, and then five ratios of which a company must fail four to be thrown out. Feedback closes on 30 September, results land by 16 October, and nothing changes before the November review. Run against May data it deletes Strategy, Metaplanet — and Yellow Cake, which holds uranium.',
    },
    {
      kind: 'p',
      text: 'That last name is the tell. This is not a crypto rule; it is a rule about operating companies versus holding vehicles, and it caught a uranium fund in the same net. MSCI ran a crypto-specific version last October, named 39 companies, and on 6 January declined to implement it — Strategy rose six per cent after hours. The version that might actually pass is the one that never mentions bitcoin.',
    },
    {
      kind: 'p',
      text: 'Index membership was one of the quiet struts under the premium, and somebody has priced it. JPMorgan put the forced passive selling at $2.8bn from MSCI alone, rising to $8.8bn if the other providers follow. TD Cowen attributed $2.5bn of Strategy\'s value to MSCI inclusion and another $5.5bn to its other index memberships. A pension fund buying a broad global index buys Strategy without anybody deciding to. Remove that and the marginal buyer has to be a person who actively wants leveraged bitcoin exposure and picked this over a spot ETF charging a fifth of a per cent. Some will. Fewer than were buying it by accident.',
    },
    {
      kind: 'p',
      text: 'Strategy\'s answer was that index providers "should measure markets, not decide which assets companies are allowed to own", which is a good line and does not describe what an index provider does.',
    },
    { kind: 'h2', text: 'The strongest version of the other side', id: 'the-other-side' },
    {
      kind: 'p',
      text: 'A treasury company can borrow on terms an individual cannot get. Convertible bonds issued against a violently volatile share price are genuinely cheap financing, because the option embedded in them is worth more to the buyer than the interest it replaces. A company that reaches the next cycle holding more bitcoin per share than it started with has won, and interim marks will not matter to anybody who was right about the destination. That is a real argument and people who make it are not fools.',
    },
    {
      kind: 'p',
      text: 'The nearest thing to an academic treatment is sharper about who carries the danger. B K Meister\'s preprint on these structures — not peer-reviewed, and the only paper of its kind I could find — describes the arrangement as "a virtuous cycle for the stockholders, and a potentially vicious cycle for the lenders". The risk is not removed by the structure. It is moved onto whoever financed it, and it works as long as somebody keeps agreeing to be that person.',
    },
    {
      kind: 'p',
      text: 'And the bear case is not "bitcoin goes down". It is that the number governing all of this is not a fact. NYDIG\'s Greg Cipolaro has pointed out that mNAV suffers from an ambiguous definition and inconsistent application — firms take a fully diluted share count for coins per share and a basic one for market capitalisation, and nobody is obliged to say which. At the end of November, Strategy\'s own multiple read 0.856 basic, 0.954 diluted and 1.105 on an enterprise basis: one company, one day, on both sides of the line that decides whether it issues stock or sells coins. In July it changed the methodology and its glossary now says the earlier figures are not comparable.',
    },
    {
      kind: 'p',
      text: 'A business whose sole engine is its own share price exceeding its own assets is a business whose engine is switched on and off by other people\'s opinion of it, measured with a ruler it prints itself. That is a fine thing to own on the way up. It is not a moat.',
    },
    { kind: 'h2', text: 'Nobody was misled', id: 'nobody-was-misled' },
    {
      kind: 'p',
      text: 'The part worth sitting with is that all of this was disclosed. The accretion mechanism was explained in the filings. The metric that measures it was invented and published by the company itself. The dependence on trading above net asset value was not buried in a footnote — it was the pitch.',
    },
    {
      kind: 'p',
      text: 'For four years, the accurate description of the trade was: buy bitcoin at a premium and be compensated for the premium by whoever buys it from you at a larger one. Everybody could read that. Enough people read it and concluded it was a feature.',
    },
    {
      kind: 'p',
      text: 'The coins are all still there. What has gone is the reason anyone paid more than they were worth, and there is no line item on any balance sheet where that used to sit.',
    },
    { kind: 'h2', text: 'Sources', id: 'sources' },
    {
      kind: 'ul',
      items: [
        '[The Block on the 3–9 August sale](https://www.theblock.co/news/business/2026-08-10-michael-saylor-strategy-bitcoin-treasury-411237) — the 1,690 coins, the $64,262 average, the 1,152,020 STRC shares repurchased with the proceeds, the $75,385 cost basis and the 840,447 remaining.',
        '[The Block on the week to 16 August](https://www.theblock.co/news/business/2026-08-17-michael-saylor-strategy-btc-411942) — no bitcoin bought or sold, the $333.7m share issuance, the dividend and buyback split, and the reserve at $4.8bn.',
        '[Protos on the 2026 disposals](https://protos.com/strategy-has-sold-nearly-7000-btc-in-2026/) — the sale-by-sale ledger, the 6,948 coins and $431.8m, and the single 2022 precedent.',
        '[Strategy\'s 8-K of 29 June](https://www.sec.gov/Archives/edgar/data/1050446/000119312526286871/mstr-20260629.htm) — the capital framework, the repurchase authorisations and the monetisation programme. The accompanying release carries the coverage arithmetic: $2.55bn as 17.4 months, $3.8bn as 25.9.',
        '[The Block on the day the premium went](https://www.theblock.co/post/406438/strategy-loses-bitcoin-premium-enterprise-mnav-dips-below-1) — enterprise mNAV below 1.0 in late June, the $82.16 low and STRC at $71.40.',
        '[CoinDesk on the cohort unwind](https://www.coindesk.com/markets/2026/07/24/bitcoin-treasury-companies-sell-up-repay-debt-pivot-to-ai-as-share-prices-collapse) — Sequans, Nakamoto and the Kraken facility, sourcing VanEck\'s Matthew Sigel.',
        '[BeInCrypto on the Satsuma vote](https://beincrypto.com/satsuma-bitcoin-treasury-liquidation-vote/) — the 90.6 per cent, the four directors who voted against, and what the coins had cost.',
        '[CoinDesk on the MSCI proposal](https://www.coindesk.com/markets/2026/08/14/bitcoin-holders-strategy-and-metaplanet-face-stock-index-exclusion-under-msci-s-new-proposal) — the two screens, the simulated deletions including Yellow Cake, and the September-to-November timetable.',
        '[Greg Cipolaro, NYDIG](https://www.nydig.com/research/dat-financing-decisions-are-being-driven-by-the-wrong-metric) — why a company sitting at 1.0x can be flipped from issuing to selling by the choice of denominator alone.',
        '[CoinDesk on what mNAV does and does not tell you](https://www.coindesk.com/business/2025/11/30/what-mnav-really-tells-you-about-bitcoin-treasury-companies-and-where-it-falls-short) — the same stock reading 0.856, 0.954 and 1.105 on one day.',
        '[B K Meister, "Through the Looking Glass: Bitcoin Treasury Companies"](https://arxiv.org/abs/2507.14910) — a preprint, not peer-reviewed; the transfer of risk from stockholders to lenders.',
      ],
    },
  ],
}

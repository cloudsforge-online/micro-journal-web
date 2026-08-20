import type { Article } from '../types.ts'

export const article: Article = {
  slug: 'a-tenth-way-to-lose-crypto',
  title: 'A tenth way to lose crypto',
  dek: 'Every rule we give people assumes the reader is the weak point. In 2026 the money left through a firmware build from 2021, and there was no version of the reader who could have done anything about it.',
  description:
    'A 2021 firmware bug drained 1,816 BTC in 2026 with no user error involved. What that does to the standard advice about keeping coins safe.',
  authorId: 'cloudsforge',
  publishedAt: '2026-08-18',
  updatedAt: null,
  tags: ['security', 'the-wider-world'],
  hero: {
    src: '/articles/a-tenth-way-to-lose-crypto/hero.png',
    alt: 'A drawing of a small sealed device with a keyhole in it, and a bronze key already lying on the far side of the case.',
  },
  card: '/articles/a-tenth-way-to-lose-crypto/card.png',
  body: [
    {
      kind: 'lead',
      text: 'On 30 July somebody swept about 594 BTC — roughly $38m at the time — out of around 500 separate wallets and into a single address, over about twenty-five minutes. Nobody had been phished. No seed phrase was photographed, written on a hotel notepad or typed into a website that looked almost right. The wallets were Coldcards: dedicated hardware signing devices, air-gapped, the exact category of object that every guide to keeping coins safe tells you to buy, including ours.',
    },
    {
      kind: 'p',
      text: 'The cause was a build configuration mistake in firmware version 4.0.1, released in March 2021, which caused key generation to fall back to a weak software random number generator instead of the hardware source it was supposed to use. Keys that should have carried 128 bits of entropy carried as little as 40. Forty bits is a search. It is a large search, but it is a search, and somebody ran it.',
    },
    {
      kind: 'p',
      text: 'The total came to 1,816 BTC — about $116m — taken from more than 5,200 addresses across four waves over four days. TRM Labs ranked it the third largest attack of 2026 on its own, and counted the year to that point at over $1.2bn stolen across 276 incidents. Different transaction construction between waves suggests it was not all one person.',
    },
    {
      kind: 'p',
      text: 'And the crucial detail, the one every summary buries: **updating the firmware does not repair a seed that was already generated.** The bug was fixed years ago. The keys it made are still weak, still in use, and can only be replaced by moving every coin to a new wallet made on a new device.',
    },
    { kind: 'h2', text: 'Five years between the mistake and the loss', id: 'the-latency' },
    {
      kind: 'p',
      text: 'The part worth sitting with is not the sum. It is that a weak key is completely invisible from the outside.',
    },
    {
      kind: 'p',
      text: 'The device powered on normally. It displayed twenty-four words like any other. Those words restored correctly on a second device, wrote a valid backup, accepted a passphrase, produced addresses that received coin and signed transactions that confirmed. Every verification step in every guide passes. There is no symptom, no warning, and nothing an owner could have inspected that would have shown a difference — the whole failure lives in the quality of a number, and quality is not something a person can look at.',
    },
    {
      kind: 'p',
      text: 'So the loss was fully committed at the instant the seed was created, in March 2021 or shortly after, and everything the owner did for the next five years was irrelevant. Cold storage was irrelevant. The steel plate in the safe was irrelevant. The multisig discipline, the test restores, the careful refusal to ever type the words into anything — all of it correct, all of it pointed at a different door.',
    },
    { kind: 'h2', text: 'What the nine ways have in common', id: 'the-nine' },
    {
      kind: 'p',
      text: 'We have written our own version of the standard list: [nine ways people lose crypto](/a/nine-ways-people-lose-crypto). Seed phrase lost. Seed phrase typed into a website. Wrong address. Wrong network. Left on an exchange that failed. Approved a contract that emptied the wallet. Trusted a stranger who was very helpful in a chat.',
    },
    {
      kind: 'p',
      text: 'Every one of those has a behaviour attached, which is what makes them writable. The genre exists because there is something to tell you: slow down, check the address, do not click that. The implicit promise underneath is that the failure is yours, and therefore so is the fix.',
    },
    {
      kind: 'p',
      text: 'The Coldcard drains have no behaviour attached. There is no different action available in the sequence. The only correct decision was made in March 2021, by somebody who would have had to know about a bug that was not discovered for another five years, and it consisted of not buying that device that month. That is not advice. That is luck with a date on it.',
    },
    { kind: 'h2', text: 'The test transaction does not work either', id: 'the-test-transaction' },
    {
      kind: 'p',
      text: 'Here is a second rule from the same genre, failing for a related reason. In December somebody lost about $50m of USDT to address poisoning, and they did everything the guide says. They sent a test transaction first — 50 USDT, confirmed, arrived. Then they sent 49,999,950 to the same address they had just tested.',
    },
    {
      kind: 'p',
      text: 'It was not the same address. It was a lookalike, seeded into their transaction history by an attacker, matching the real one at the first characters and the last characters and differing in the middle. Their wallet displayed it the way every wallet displays an address: the beginning, an ellipsis, the end. The attacker swapped the lot into DAI within half an hour, ahead of any freeze.',
    },
    {
      kind: 'p',
      text: 'The test transaction is not defective advice. It is advice aimed at a mistake this attack does not make, given to a person whose interface is hiding the only part of the string that differs. The one academic measurement of this — two years across Ethereum and BSC — counted 270 million attempts aimed at 17 million addresses and found 6,633 that worked, for at least $83.8m, which the authors describe as a conservative floor. That is a hit rate of a few in every hundred thousand tries. The attempts are free, and one of the hits was worth fifty million dollars.',
    },
    { kind: 'h2', text: 'Where the money is actually going', id: 'where-the-money-goes' },
    {
      kind: 'p',
      text: 'TRM Labs published its half-year figures on 1 July: about $972m stolen across 207 incidents in the first six months of 2026. The dollar figure is well down on the $2.3bn of the same period in 2025. The incident count is the highest ever recorded in a half-year — 207 against 83 — which is a different shape of year, not a better one. Median hack $219,000, mean $4.7m. North Korean operations accounted for roughly $643m, about two-thirds of everything.',
    },
    {
      kind: 'p',
      text: 'The number that ought to reorganise the industry\'s spending is this. Infrastructure and private key compromise produced about 76 per cent of the losses from about 15 per cent of the incidents. Smart contract exploits were 125 of the 207 incidents and a small fraction of the money.',
    },
    {
      kind: 'p',
      text: 'Auditing goes where the code is, because code is the part you can read. Keys and infrastructure are not code; they are a build pipeline, a laptop with a signing session open, an org chart, a contractor with production access, a firmware release from five years ago. Nobody sells an audit of that, so the audit budget keeps going to the majority of incidents that account for the minority of dollars, and the sentence "the contracts have been audited" continues to be read by the public as an answer to a question it does not touch. Blockaid, which measured the same split at 74 per cent, put it plainly: audits "cannot stop a compromised administrator from signing a malicious transaction or prevent a bridge verifier from relying on poisoned infrastructure."',
    },
    {
      kind: 'p',
      text: 'March gave the cleanest illustration. Somebody got into Resolv\'s AWS key management environment, where the privileged signing key lived, and minted 80 million unbacked stablecoins against a contract that enforced a minimum output and no maximum. Resolv had reportedly completed eighteen audits. Chainalysis\'s verdict was that the contract "worked exactly as intended."',
    },
    { kind: 'h2', text: 'The other direction the risk moved', id: 'the-wrench' },
    {
      kind: 'p',
      text: 'Chainalysis published a study of physical-coercion attacks on 6 August. The 2025 total was a record $58m; 2026 had passed $30m by mid-year. Recorded attempts went 48 in 2024, 95 in 2025, 46 by late June this year. France alone logged 19 incidents in 2025 and 30 by the middle of 2026.',
    },
    {
      kind: 'p',
      text: 'Then the two figures that belong next to each other. The share of attacks where the victim paid fell from 67 per cent in 2024, to 49 per cent in 2025, to 26 per cent this year. Over the same window the share of incidents that involved kidnapping rose from 39 per cent in 2023 to 52 per cent in 2026.',
    },
    {
      kind: 'p',
      text: 'Read those together and the story is uncomfortable. Self-custody advice worked. People genuinely cannot hand over what is behind a multisig quorum or a device they do not have with them, and the payment rate collapsing is the measurement of that. But an attacker who cannot get paid in five minutes on a street does not go home. He takes the person somewhere and waits, because now the theft needs time. The advice made the crime less profitable and more violent at once, and roughly a quarter to a third of victims knew the person who came for them.',
    },
    {
      kind: 'p',
      text: 'France is the part that belongs in this particular article, though, because of where the target lists came from. Chainalysis traces the surge to a 2024 breach in which a tax official in the Paris area is alleged to have stolen and sold detailed files on wealthy crypto holders — names, home addresses, phone numbers, holdings — to intermediaries who used them to select and locate people. The allegations are untested and there is no judgment. But if they hold, then the victims\' operational security was not the failure. Their tax return was. In January a French crypto tax-reporting firm disclosed a breach affecting around 50,000 users, which is the same shape of problem arriving by a different door.',
    },
    {
      kind: 'callout',
      title: 'The money has not moved',
      text: 'Almost none of the 1,816 BTC has been laundered. As of early August the only movements were 64.9 BTC into Wasabi and 200 ETH into Tornado Cash, both on 4 August. Whoever holds it is sitting on a nine-figure balance in addresses the entire industry is watching, which is the ordinary condition of large crypto thefts now: taking it is the easy half. That is a real deterrent and it is worth acknowledging. It is also no comfort whatsoever to the 5,200 owners, whose coins are equally gone either way.',
    },
    { kind: 'h2', text: 'What is left to actually do', id: 'what-to-do' },
    {
      kind: 'p',
      text: 'Not much, and pretending otherwise is how this genre loses its credibility. But the list is not empty.',
    },
    {
      kind: 'p',
      text: '**Supply your own entropy where the device lets you.** Coldcard itself supports rolling dice and mixing that into the seed. This class of bug is precisely the one it defeats, because a source you generated by hand does not depend on the manufacturer having compiled the right file.',
    },
    {
      kind: 'p',
      text: '**Do not put everything under one manufacture.** Two vendors, two seeds, split between them. The industry\'s advice on diversification talks about assets and exchanges and never about who built the box, and the box is the thing that failed this year. A vendor-specific bug takes a vendor-specific share.',
    },
    {
      kind: 'p',
      text: '**Assume physical exposure tracks how publicly you are known to hold.** That one has always been true and the kidnapping numbers make it operational rather than theoretical.',
    },
    { kind: 'h2', text: 'Which points at us', id: 'which-points-at-us' },
    {
      kind: 'p',
      text: 'Everything above lands on CloudsForge harder than on a reader with two devices in a drawer. We hold customer coins in our own custody, and a custodian is by definition one manufacture, one process and one set of decisions applied to everybody at once. If a build of ours were wrong in the way Coinkite\'s was, there would be no diversification anywhere in the system to absorb it.',
    },
    {
      kind: 'p',
      text: 'We think custody is the right default for people who would otherwise lose a seed phrase, and the loss figures support that; most people who self-custody badly lose everything to nothing more exotic than a house move. But the honest version of the sentence has a second half. Somebody who accepts the argument for splitting across vendors should apply it to custodians as well, and that includes us. A service that tells you to diversify away from everything except itself is not giving advice.',
    },
    { kind: 'h2', text: 'The queue', id: 'the-queue' },
    {
      kind: 'p',
      text: 'Every seed generated on that firmware still exists in wallets belonging to people who have not read any of this. They are not doing anything wrong. Their backups are fine, their devices work, and their balances are correct this morning.',
    },
    {
      kind: 'p',
      text: 'The first wave took twenty-five minutes.',
    },
    { kind: 'h2', text: 'Sources', id: 'sources' },
    {
      kind: 'ul',
      items: [
        '[TRM Labs on the Coldcard exploit](https://www.trmlabs.com/resources/blog/the-largest-hardware-wallet-exploit-of-2026-inside-the-usd-116-million-coldcard-hack) — the firmware 4.0.1 entropy fallback, 128 bits down to 40, 1,816 BTC from more than 5,200 addresses, the four waves and the limited laundering.',
        '[TRM Labs, first half of 2026](https://www.trmlabs.com/resources/blog/h1-2026-crypto-hacks-reach-record-high-as-losses-fall-below-usd-1-billion) — $972m across 207 incidents, the median and the mean, the DPRK share, and the 76 per cent of losses from 15 per cent of the incidents.',
        '[Chainalysis on violent attacks](https://www.chainalysis.com/blog/violent-crypto-wrench-attacks-2026/) — the $58m record for 2025, the attempt counts, the collapsing payment rate, the rise in kidnapping, and the French tax-office allegations.',
        '[Chainalysis on the Resolv incident](https://www.chainalysis.com/blog/lessons-from-the-resolv-hack/) — the compromised signing environment, the missing maximum, and "worked exactly as intended".',
        '[CoinDesk on the $50m address poisoning](https://www.coindesk.com/web3/2025/12/20/crypto-user-loses-usd50-million-in-address-poisoning-scam) — the test transaction that arrived, and the characters in the middle.',
        '[Measuring address poisoning](https://arxiv.org/html/2501.16681v1) — 270 million attempts, 17 million targets, 6,633 successes, and why the loss figure is a floor.',
        '[TechCrunch on the hardware wallet thefts](https://techcrunch.com/2026/08/04/hackers-steal-over-130-million-by-exploiting-bug-in-offline-hardware-wallets/) — an independent account, and a total that does not agree with TRM\'s by roughly $15m, which is normal for this kind of reporting.',
      ],
    },
  ],
}

import type { Article } from '../types.ts'

export const article: Article = {
  slug: 'crypto-without-the-crypto-words',
  title: 'Crypto, explained without the crypto words',
  dek: 'No blockchain diagrams, no shouting, no assumption that you already half-know. Just what the thing is, why anyone bothered, and what it is honestly bad at.',
  description:
    'A plain-English explanation of what crypto actually is, why it was invented, and what it is genuinely bad at. No jargon and no hype.',
  authorId: 'cloudsforge',
  publishedAt: '2026-07-28',
  updatedAt: null,
  tags: ['explainers'],
  hero: {
    src: '/articles/crypto-without-the-crypto-words/hero.png',
    alt: 'A drawing of a ruled ledger, its rows running off the right edge of the page, with one row lit in bronze.',
  },
  card: '/articles/crypto-without-the-crypto-words/card.png',
  body: [
    {
      kind: 'lead',
      text: 'Almost every explanation of crypto starts with a word you have to look up. This one is going to try very hard not to, because the idea underneath is much smaller than the vocabulary around it, and the vocabulary is doing most of the work of making it seem hard.',
    },
    {
      kind: 'p',
      text: 'Here is the whole thing in one sentence: crypto is a way for a large group of strangers to agree on who owns what, without anyone in the middle keeping the record.',
    },
    {
      kind: 'p',
      text: 'That is it. Everything else — the wallets, the mining, the words ending in *-chain* — is machinery for making that one sentence true. If you understand why keeping a record without a middle is hard, you will understand why the machinery looks the way it does.',
    },
    { kind: 'h2', text: 'Start with the boring version', id: 'the-boring-version' },
    {
      kind: 'p',
      text: 'Think about your bank balance for a second. Where is it?',
    },
    {
      kind: 'p',
      text: 'It is not in a vault with your name on it. There is no drawer of your money. Your balance is a number in your bank’s database, and the reason you can spend it is that everyone has agreed to believe that database. When you pay for coffee, nothing physical moves. One number goes down, another goes up, and the whole system works because we all trust the same institution to keep the list honest.',
    },
    {
      kind: 'p',
      text: 'That trust is not misplaced, mostly. Banks are regulated, insured and audited, and for the ordinary business of getting paid and buying things they work very well. But notice what the arrangement requires: a single organisation that can see every entry, change any entry, and decide whose entries count.',
    },
    {
      kind: 'p',
      text: 'For most people, most of the time, that is a fine trade. For some people it is not. If you have ever had an account frozen while you were travelling, tried to send money to a country the payment networks have decided is inconvenient, or watched a currency lose a third of its value because of a decision made in a room you were not in, you have met the other side of the trade.',
    },
    {
      kind: 'p',
      text: 'The question crypto started from was narrow and technical, not political: **could you keep that list without the institution?** Not "should you", not "would it be better". Could it even be done.',
    },
    { kind: 'h2', text: 'Why it was hard', id: 'why-it-was-hard' },
    {
      kind: 'p',
      text: 'The obvious answer is to give everyone a copy of the list. If ten thousand people each hold the same ledger, no single one of them can quietly edit it.',
    },
    {
      kind: 'p',
      text: 'The obvious answer has an obvious problem. Suppose I have ten coins and I tell you I am sending them to you, and at the same moment I tell someone else I am sending the same ten coins to them. Both messages go out. Half the network hears mine first, half hears theirs. Now there are two versions of the list and no referee to say which one happened.',
    },
    {
      kind: 'p',
      text: 'This is the entire problem. It has a name — double spending — and for decades it was the reason digital cash did not work. Copies are free. Whatever you can send once, you can send twice, and a list that disagrees with itself is not a list.',
    },
    {
      kind: 'callout',
      title: 'The thing that took thirty years',
      text: 'Digital money was tried repeatedly from the 1980s onward. Every attempt worked fine until you removed the trusted party in the middle, at which point nobody could agree on the order things happened in. Ordering, not secrecy, was the hard part.',
    },
    { kind: 'h2', text: 'The trick', id: 'the-trick' },
    {
      kind: 'p',
      text: 'The answer that finally worked is strange, and it is worth sitting with because it is the one genuinely clever idea in all of this.',
    },
    {
      kind: 'p',
      text: 'Instead of choosing a referee, make writing to the list *expensive*. Not expensive in money — expensive in work. To add the next page of entries, a computer has to solve a puzzle that has no shortcut: you cannot reason your way to the answer, you can only guess, billions of times a second, until one guess happens to fit. The puzzle is tuned so that somewhere in the world, roughly every few seconds or minutes, someone gets lucky.',
    },
    {
      kind: 'p',
      text: 'Whoever gets lucky publishes their page. Everyone checks it — checking is instant, even though finding it was not — and adds it to their own copy. Each page also carries a fingerprint of the page before it, so the pages form a chain. That is where the word comes from, and it is the least interesting part of the idea.',
    },
    {
      kind: 'p',
      text: 'Now go back to my attempt to spend the same ten coins twice. Both messages are floating around. The next page gets written, and it contains one of them. Not both — a page containing both would be rejected by everyone who checked it. So one payment is now on a page, backed by all that work, and the other one is an orphan. To undo it I would have to rewrite that page and every page after it, faster than everyone else in the world is adding new ones. That is not impossible in theory. It is just wildly, unaffordably impractical, which turns out to be enough.',
    },
    {
      kind: 'p',
      text: 'So: no referee, and yet an order that everyone agrees on. That is what was invented. Everything since has been variations on it.',
    },
    { kind: 'h2', text: 'What a wallet actually is', id: 'what-a-wallet-is' },
    {
      kind: 'p',
      text: 'This is the part people get wrong most often, and getting it right prevents a specific kind of disaster.',
    },
    {
      kind: 'p',
      text: 'A crypto wallet does not contain your coins. Your coins are entries on a list that thousands of computers hold. The wallet holds a **key** — a very long secret number — and the only thing that key does is produce a signature that proves an instruction came from you.',
    },
    {
      kind: 'p',
      text: 'A closer everyday comparison is not a wallet at all. It is the signature on a cheque. The money is at the bank; the signature is what makes the instruction valid. Lose your chequebook and nothing happens to your balance. Let someone forge your signature and everything happens to it.',
    },
    {
      kind: 'p',
      text: 'Two consequences follow, and they are the whole of crypto safety in two lines.',
    },
    {
      kind: 'ul',
      items: [
        'Anyone who gets your key can move your coins, immediately, permanently, from anywhere. There is no fraud department, because there is nothing for them to reverse.',
        'If you lose your key and your backup of it, the coins stay on the list forever with nobody able to move them. Nobody can reset it for you. There is no "forgot password".',
      ],
    },
    {
      kind: 'p',
      text: 'People find this alarming, and they are right to. It is genuinely the sharpest edge in the whole field. It is also why the phrase you will see everywhere — *not your keys, not your coins* — is not a slogan so much as a description of the mechanics.',
    },
    { kind: 'h2', text: 'What it is honestly bad at', id: 'what-its-bad-at' },
    {
      kind: 'p',
      text: 'Anyone who tells you this technology is good at everything is selling something. Here is the fair list of what it handles badly.',
    },
    {
      kind: 'p',
      text: '**Being a stable place to keep money.** Prices move violently, often for no reason connected to anything real. A thing that can lose 40% in a month is not somewhere to keep your rent.',
    },
    {
      kind: 'p',
      text: '**Mistakes.** A payment sent to the wrong address is gone. The property that makes the ledger trustworthy — nobody can rewrite it — is exactly the property that makes errors permanent. You cannot have one without the other, and anyone offering both is offering a middleman with extra steps.',
    },
    {
      kind: 'p',
      text: '**Being obvious.** The interfaces are improving, but the field still has a habit of naming things after their implementation rather than their purpose, which is how you end up with a "gas fee" instead of a "transaction cost". We are as guilty of this as anyone and we are trying to stop.',
    },
    {
      kind: 'p',
      text: '**Keeping out bad actors.** Because anyone can join and nobody is in charge, that includes people whose entire business is separating you from your coins. A field with no chargebacks and irreversible transfers is, from a certain angle, ideally designed for fraud. Treat every unsolicited message about crypto as a scam attempt and you will be right nearly every time.',
    },
    { kind: 'h2', text: 'So what is it good at?', id: 'what-its-good-at' },
    {
      kind: 'p',
      text: 'Three things, honestly.',
    },
    {
      kind: 'p',
      text: 'Moving value to someone far away without asking permission first. Not free, not instant, but it does not care about borders, bank holidays or whether either of you has an account somewhere.',
    },
    {
      kind: 'p',
      text: 'Proving something happened. Because the list is public and hard to rewrite, "this existed at this time" and "this person authorised that" are cheap to establish and expensive to fake. A surprising number of useful things are just those two facts wearing a costume.',
    },
    {
      kind: 'p',
      text: 'Running rules nobody can quietly change. A program published to one of these networks does exactly what its code says, to everyone, including the people who wrote it. That is a genuinely new kind of promise. It is also a genuinely new kind of hazard, because a program with a bug in it also does exactly what its code says.',
    },
    { kind: 'h2', text: 'If you want to try it', id: 'if-you-want-to-try' },
    {
      kind: 'p',
      text: 'Two suggestions, both boring, both from watching a lot of people start.',
    },
    {
      kind: 'p',
      text: 'Start with an amount you would be annoyed to lose in a taxi, not one you would be upset to lose. The point of the first month is to learn how it feels to send something and have it arrive, not to make money. Nearly everyone who begins with the second goal has a bad time.',
    },
    {
      kind: 'p',
      text: 'And write your recovery phrase on paper. Not in your photos, not in your email drafts, not in a password manager you access from the same phone. Paper, somewhere a fire would not reach it. It is a deeply unglamorous piece of advice and it is the single thing that separates people who keep their coins from people who tell a story about them.',
    },
    {
      kind: 'p',
      text: 'That is the whole idea. A list, kept by everyone, ordered by work, signed with a key you must not lose. If someone uses a word that stops you following a sentence, it is fair to assume the sentence was not written for you — and, increasingly, that it did not need the word.',
    },
  ],
}

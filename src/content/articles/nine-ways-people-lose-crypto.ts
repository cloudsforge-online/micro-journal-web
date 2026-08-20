import type { Article } from '../types.ts'

export const article: Article = {
  slug: 'nine-ways-people-lose-crypto',
  title: 'Nine ways people lose crypto, and how not to be one of them',
  dek: 'Almost nobody is robbed by a genius. They are robbed by a message that arrived at the right moment, or by a backup that was never made. Here is the actual list, in the order it happens.',
  description:
    'The nine ways people actually lose crypto — from fake support to a lost recovery phrase — and the habits that prevent nearly all of them.',
  authorId: 'cloudsforge',
  publishedAt: '2026-08-16',
  updatedAt: null,
  tags: ['security', 'explainers'],
  hero: {
    src: '/articles/nine-ways-people-lose-crypto/hero.png',
    alt: 'A drawing of nine identical outlined doors in a three-by-three grid, the middle one standing ajar with bronze light spilling out of it.',
  },
  card: '/articles/nine-ways-people-lose-crypto/card.png',
  body: [
    {
      kind: 'lead',
      text: 'The stories that get written about are the exciting ones: an exchange collapses, a clever exploit drains a contract. Those are real and they are rare. The ordinary way people lose crypto is much duller, and it is nearly always one of nine things.',
    },
    {
      kind: 'p',
      text: 'Every one of these is preventable by a habit rather than by expertise. None of them requires you to understand cryptography. If you internalise the list, you are safer than most people who have been doing this for years — which we know because most people who have been doing this for years have lost money to something on it.',
    },
    { kind: 'h2', text: 'One: the phrase that went into the wrong box', id: 'one' },
    {
      kind: 'p',
      text: 'The most common theft in crypto is not a hack. It is somebody typing their recovery phrase into a website.',
    },
    {
      kind: 'p',
      text: 'It happens like this. Something goes wrong — a transaction stuck, a balance not showing — and you search for help. A page appears offering to fix it. It looks right, because it was built by someone who has done this a thousand times. It asks you to "validate" or "synchronise" or "restore" your wallet, and it wants the twelve words.',
    },
    {
      kind: 'p',
      text: 'The moment those words are typed, the coins are gone. Not in an hour. Automated systems watch for exactly this and empty the wallet in seconds.',
    },
    {
      kind: 'p',
      text: '**The rule:** your recovery phrase is entered in exactly one situation — restoring a wallet, on a device you are holding, in an app you installed yourself. Never on a website. Never into support. Never into anything that came to you. There is no legitimate reason any service will ever ask, including ours, and a request for it is by itself a complete diagnosis.',
    },
    { kind: 'h2', text: 'Two: the helpful person who found you first', id: 'two' },
    {
      kind: 'p',
      text: 'You post a question in a public channel. Within a minute, someone messages you privately offering to help. They are friendly, competent and patient. They are also not who they say they are, and they were watching the channel for exactly your kind of question.',
    },
    {
      kind: 'p',
      text: 'This is so consistent that it is nearly a law: **the first person to direct-message you after you ask for help is a thief.** Not sometimes. As a working assumption.',
    },
    {
      kind: 'p',
      text: '**The rule:** support does not arrive. You go to it. Get help in the public channel where other people can see the advice, and be suspicious of anyone who wants to move the conversation somewhere private.',
    },
    { kind: 'h2', text: 'Three: the address that was almost right', id: 'three' },
    {
      kind: 'p',
      text: 'You copy an address, paste it, send. But the address you pasted was not the one you copied — a piece of software on your machine swapped it for one that begins and ends with the same few characters, because it knows you check the beginning and the end.',
    },
    {
      kind: 'p',
      text: 'The same failure happens innocently: pasting from the wrong chat, or sending on the wrong network to an address that looks valid and is not.',
    },
    {
      kind: 'p',
      text: '**The rule:** check the middle of the address, not just the ends. On any amount that matters, send a tiny test first and wait for it to arrive. The test costs a fee. Skipping it has cost people everything, and the fee is a rounding error against that.',
    },
    { kind: 'h2', text: 'Four: the phrase that was never written down', id: 'four' },
    {
      kind: 'p',
      text: 'Not theft. Just loss, and more of it than all theft combined.',
    },
    {
      kind: 'p',
      text: 'A phone breaks. A laptop is replaced. A drive fails. The wallet was on it, the recovery phrase existed only inside the app, and the coins are now permanently sitting at an address nobody can ever open. They are still visible. They are just unreachable, forever, by everyone.',
    },
    {
      kind: 'p',
      text: '**The rule:** write the phrase on paper the day you create the wallet. Two copies, two locations, at least one somewhere a fire in your home would not reach. Not a photo, because photos sync to a cloud account that can be broken into. Not a note in your email. Paper, ink, done in five minutes, and then never touched again.',
    },
    {
      kind: 'callout',
      title: 'Test the backup once',
      text: 'A backup you have never restored from is a hypothesis. Once — with a wallet holding almost nothing — wipe it and restore from the paper. You will find out whether your handwriting is legible and whether you wrote the words in order. Better now than during an emergency.',
    },
    { kind: 'h2', text: 'Five: the approval you forgot you gave', id: 'five' },
    {
      kind: 'p',
      text: 'This one is specific to using applications on a chain, and it surprises people who consider themselves careful.',
    },
    {
      kind: 'p',
      text: 'To use most on-chain applications you grant them permission to move a particular coin from your wallet. Very often that permission is unlimited in amount and unlimited in time, and it stays granted long after you have forgotten the application existed. If that application is later compromised — or was never honest — the permission is still there and still works.',
    },
    {
      kind: 'p',
      text: '**The rule:** read what you are approving, and be suspicious of unlimited amounts. Every few months, review your active approvals and revoke the ones you no longer use. Several free tools list them; a wallet worth using has this built in.',
    },
    { kind: 'h2', text: 'Six: the free money', id: 'six' },
    {
      kind: 'p',
      text: 'Tokens appear in your wallet that you did not buy. Sometimes they claim to be worth a lot. There is a website where you can sell them.',
    },
    {
      kind: 'p',
      text: 'The token is bait. Interacting with it — selling it, moving it, visiting the site to claim it — is the actual attack, and the value shown is a number the sender chose.',
    },
    {
      kind: 'p',
      text: 'The same shape covers giveaways ("send one and get two back"), airdrops that need your phrase to claim, and the celebrity livestream that is a looped video from three years ago.',
    },
    {
      kind: 'p',
      text: '**The rule:** unexpected value is bait. Ignore tokens you did not acquire; they cost you nothing sitting there. Nobody doubles your money for free, and the people who appear to be offering it have thought about this for much longer than you have.',
    },
    { kind: 'h2', text: 'Seven: the exchange that had it all along', id: 'seven' },
    {
      kind: 'p',
      text: 'Coins left on an exchange are not yours in the sense that matters. They are an entry in that company\'s database and a promise to give them back. Usually the promise is kept. Several times, spectacularly, it has not been — not because of a hack, but because the company was quietly using customer coins and could not produce them when everybody asked at once.',
    },
    {
      kind: 'p',
      text: '**The rule:** an exchange is a place you pass through, not a place you keep things. Anything you are not actively trading belongs in a wallet whose key you hold. If the amount is significant, that means hardware — a small device that signs transactions and never lets the key touch an internet-connected computer.',
    },
    { kind: 'h2', text: 'Eight: the person who was suddenly interested in you', id: 'eight' },
    {
      kind: 'p',
      text: 'The largest single category by amount lost, and the least often discussed, because the people it happens to are ashamed and stay quiet.',
    },
    {
      kind: 'p',
      text: 'It begins as a wrong number, a dating app match, a friendly professional connection. It goes on for weeks. There is no mention of money for a long time. They are warm, consistent and genuinely good company. Eventually they mention an investment they use — a platform with a clean interface, real-looking returns, and small withdrawals that work perfectly, so you trust it and put in more.',
    },
    {
      kind: 'p',
      text: 'The withdrawals that work are part of the machine. When the balance is large enough, there is a fee to release it, then a tax, then a compliance hold, and each one is real money and none of it ever comes back.',
    },
    {
      kind: 'p',
      text: '**The rule:** nobody you met online teaches you to invest. Not a friend, not a partner, not a mentor, not a group chat. If someone you have never met in person is guiding your money, that is the entire scam, no matter how long it has been or how much you like them. The length of the friendship is the investment they made.',
    },
    { kind: 'h2', text: 'Nine: the thing you bought because it was going up', id: 'nine' },
    {
      kind: 'p',
      text: 'No criminal in this one, which is why it is last and why it takes the most money overall.',
    },
    {
      kind: 'p',
      text: 'Something rises. You notice because it has risen. You buy, and the reason you buy is that it went up — a reason that is worth precisely nothing about what happens next. Then it falls, and you hold, because selling makes the loss real. Then it falls further.',
    },
    {
      kind: 'p',
      text: 'This is not a crypto phenomenon; it is how humans behave around any price that moves fast, and it has been documented for four hundred years. Crypto just runs the experiment continuously with no closing bell.',
    },
    {
      kind: 'p',
      text: '**The rule:** the price going up is not information. Buy what you would still be content holding if you could not see the price for a year — and if the answer to "why this one" is "look at the chart", you have not answered.',
    },
    { kind: 'h2', text: 'The whole list, in five lines', id: 'the-short-version' },
    {
      kind: 'ol',
      items: [
        'Nobody legitimate will ever ask for your recovery phrase. Nobody. Ever.',
        'The person who messaged you first is a thief. Go to support; do not let it come to you.',
        'Write the phrase on paper, twice, in two places, on day one — and restore from it once to check.',
        'Send a test transaction. Check the middle of the address.',
        'Unexpected money is bait, and an online friend guiding your investments is the scam itself.',
      ],
    },
    {
      kind: 'p',
      text: 'One last thing, because it stops people asking for help when asking would still have helped. If something on this list has already happened to you, you were not stupid. These are built by people who do this full time, tested against thousands of targets, and refined by what works — and they are aimed at the ordinary human habit of trusting someone who is being kind. Say it out loud to someone, report it, and carry on. The silence is the only part that is optional.',
    },
  ],
}

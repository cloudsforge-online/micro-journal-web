import type { Article } from '../types.ts'

export const article: Article = {
  slug: 'the-healthy-way-to-hold-crypto',
  title: 'The healthy way to hold crypto',
  dek: 'Nobody writes about this part. What a volatile number in your pocket does to your sleep, your attention and your mood — and the small, unglamorous habits that take it back.',
  description:
    'What holding a volatile asset does to your sleep, attention and mood, and the practical habits that keep it from running your week.',
  authorId: 'cloudsforge',
  publishedAt: '2026-08-14',
  updatedAt: null,
  tags: ['field-notes'],
  hero: {
    src: '/articles/the-healthy-way-to-hold-crypto/hero.png',
    alt: 'A drawing of a jagged line that thrashes up and down, then flattens into a straight rule and ends at a single glowing point at rest.',
  },
  card: '/articles/the-healthy-way-to-hold-crypto/card.png',
  body: [
    {
      kind: 'lead',
      text: 'There is a version of this article that opens with a disclaimer about not being financial advice. This is not that. It is about something less discussed and, for most people who own any of this, more consequential: what a number that moves all night does to a person, and what to do about it.',
    },
    {
      kind: 'p',
      text: 'We build crypto products. We also watch people use them, and we have watched enough people — including ourselves — develop a slightly unwell relationship with a price chart that it seems dishonest not to write this down.',
    },
    { kind: 'h2', text: 'Why it gets into your head', id: 'why-it-gets-in' },
    {
      kind: 'p',
      text: 'The mechanism is not mysterious and it is not a character flaw. It is the same one that makes slot machines work, and it is called variable reward.',
    },
    {
      kind: 'p',
      text: 'A reliable reward is boring. Your salary arrives monthly and you barely think about it. An unpredictable one — sometimes big, sometimes nothing, timing unknown — is the most attention-capturing pattern known, and your brain will check for it compulsively without asking you first. A crypto price is a variable reward that never closes. There is no bell at four o\'clock, no weekend, no holiday. It is Saturday at 3am somewhere and the number is moving.',
    },
    {
      kind: 'p',
      text: 'Stack on top of that a second thing: loss looms larger than gain. Losing a hundred hurts noticeably more than gaining a hundred pleases. So a chart that goes down and comes back to exactly where it started has not been neutral for you. It has been a net negative experience, and you have paid for it in attention and cortisol while ending up in the same place financially.',
    },
    {
      kind: 'callout',
      title: 'A useful reframing',
      text: 'Checking a price does not change the price. It changes you. Almost every check is a purely one-directional transaction in which you give up some calm and receive information you will not act on.',
    },
    { kind: 'h2', text: 'The symptoms, plainly', id: 'the-symptoms' },
    {
      kind: 'p',
      text: 'These are the ones people describe most often. None of them requires large amounts of money. Several are more common with small amounts, because a small position is easier to justify watching constantly.',
    },
    {
      kind: 'ul',
      items: [
        'Checking within a minute of waking, before eyes are fully open, before anything else.',
        'Sleep that has become shallow because the phone is in the room and the market is not asleep.',
        'A mood for the day that is set by an overnight percentage rather than by anything in your actual life.',
        'Conversations you have stopped having, because the people around you have visibly tired of this topic.',
        'The specific loneliness of a big loss you cannot mention, because you were told it was a bad idea.',
        'Time thinking about a position that would have been better spent earning more than the position could plausibly return.',
      ],
    },
    {
      kind: 'p',
      text: 'That last one is worth sitting with. If you hold a modest amount and spend an hour a day on it, you are working a second job at a wage that would be illegal, for an employer who might fire you at random.',
    },
    { kind: 'h2', text: 'What actually helps', id: 'what-helps' },
    {
      kind: 'p',
      text: 'Not willpower. Willpower is what you spend when the environment is badly arranged; the fix is to arrange the environment so you need less of it.',
    },
    {
      kind: 'h3',
      text: 'Decide the amount once, in advance, while calm',
      id: 'decide-the-amount',
    },
    {
      kind: 'p',
      text: 'The single most protective decision is made before anything happens: how much of your money is in this, as a fixed share, chosen on an ordinary afternoon rather than during a rally.',
    },
    {
      kind: 'p',
      text: 'Write it down somewhere you will see it later. The purpose of writing it down is not organisation — it is that the version of you who reads it in eight months, mid-euphoria or mid-crash, is a less reliable decision-maker than the version writing it now, and deserves to be overruled.',
    },
    {
      kind: 'p',
      text: 'The right amount is the one where a total loss would be genuinely annoying and change nothing important. If you cannot name that number, you are not ready to hold any, and that is a normal and fine place to be.',
    },
    { kind: 'h3', text: 'Put friction between you and the chart', id: 'add-friction' },
    {
      kind: 'p',
      text: 'Take the apps off the home screen. Turn off every price alert — an alert is a machine designed to interrupt you with information you have already decided not to act on. Do not put a widget on the lock screen; a lock screen widget is a slot machine you have installed in your pocket and set to auto-play.',
    },
    {
      kind: 'p',
      text: 'Then pick a checking schedule and keep it. Weekly is plenty. Monthly is better. If a position needs checking more often than that, it is a trade rather than a holding, and it should be sized like one.',
    },
    { kind: 'h3', text: 'Get the phone out of the bedroom', id: 'the-bedroom' },
    {
      kind: 'p',
      text: 'This is the most effective item on the list and the one everybody resists, so it is worth being blunt: sleep is the thing that breaks first and the thing that everything else depends on. A person who has slept badly makes worse decisions about money, which produces more to worry about, which costs more sleep. That loop closes fast.',
    },
    {
      kind: 'p',
      text: 'Buy an actual alarm clock. It costs less than the fees you will save by not making a panicked trade at 2am.',
    },
    { kind: 'h3', text: 'Never make a decision inside a feeling', id: 'never-inside-a-feeling' },
    {
      kind: 'p',
      text: 'The rule: if you want to buy or sell right now, wait a day. Write down what you want to do and why. Look at it tomorrow.',
    },
    {
      kind: 'p',
      text: 'You will find that roughly one time in ten the reasoning survives the night. The other nine were the feeling talking, and the day of delay costs you almost nothing in a market that will still be there — the trades that genuinely cannot wait a day are, without exception, the ones you should not be making.',
    },
    { kind: 'h3', text: 'Tell one actual person', id: 'tell-someone' },
    {
      kind: 'p',
      text: 'Not a forum. A person, who knows your name, who is aware you hold this and roughly how much.',
    },
    {
      kind: 'p',
      text: 'Secrecy is the ingredient that turns an ordinary bad habit into a serious one, and it is also the ingredient that makes losses unbearable — the pain of a loss is roughly doubled by having nobody to say it to. Online communities do not count for this purpose. Everyone there is long the same thing you are and is therefore the worst possible audience for a sentence beginning "I think I should get out."',
    },
    { kind: 'h2', text: 'The warning signs that mean stop', id: 'warning-signs' },
    {
      kind: 'p',
      text: 'Some of this stops being a habit and becomes a problem. The line is not the amount of money. It is these:',
    },
    {
      kind: 'ul',
      items: [
        'Borrowing to buy, in any form — a loan, a card, money owed to a person.',
        'Trying to win back a specific loss. This is the single most reliable predictor of a much larger one.',
        'Lying about it, including by omission, to somebody who would want to know.',
        'Spending money that was allocated to something real: rent, food, a bill, a child.',
        'Being unable to go a week without checking, and finding that fact frightening rather than funny.',
      ],
    },
    {
      kind: 'p',
      text: 'If more than one of those is true, this is gambling behaviour regardless of the asset, and it responds to the same help gambling responds to. Most countries have a free, confidential helpline; they are used to callers whose problem does not look like a casino, and speaking to one is not an admission of anything except that you would like to feel better.',
    },
    { kind: 'h2', text: 'The version of this that goes well', id: 'the-good-version' },
    {
      kind: 'p',
      text: 'It looks unexciting, which is the point.',
    },
    {
      kind: 'p',
      text: 'A share of savings you chose deliberately. Money you can name a use for or, honestly, cannot — held because you find the technology interesting rather than because of a forecast. A look every so often, without ceremony. No alerts. A key backed up on paper. Nothing borrowed, nothing hidden.',
    },
    {
      kind: 'p',
      text: 'You keep the upside, and the thing costs you no sleep and no attention. And if it all goes to nothing, you find out on a Tuesday, say "ah", and get on with your afternoon. That is not a lesser way to participate in this. It is the only version that is still enjoyable in five years, and nearly everyone who is still here after ten arrived at it, usually the hard way.',
    },
    {
      kind: 'p',
      text: 'We would rather you got there the other way.',
    },
  ],
}

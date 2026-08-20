/**
 * What this is, who writes it, and how to follow it.
 *
 * ── AN ABOUT PAGE ON A COMPANY'S PUBLICATION HAS ONE JOB ─────────────────────────────────────────
 *
 * To state the conflict of interest before the reader finds it. Everything here is written by people
 * who make money if the reader uses CloudsForge, and a page that does not say so plainly is asking
 * to be caught saying it quietly. So the disclosure is the second paragraph rather than a line in
 * the footer, and the rules the desk holds itself to are printed as rules, because a rule that is
 * written down is one a reader can hold us to later.
 */
import { Link } from 'react-router-dom'
import { Head } from '../components/head.tsx'
import { AUTHORS } from '../content/authors.ts'
import { aboutHead, PUBLICATION } from '../lib/meta.ts'
import { FEED_PATH } from '../lib/routes.ts'

export const ABOUT_DESCRIPTION =
  'Who writes Forge Journal, what it is for, and the four rules the desk holds itself to — ' +
  'including the one about writing about our own products.'

export function AboutPage() {
  const desk = AUTHORS[0]
  return (
    <>
      <Head page={aboutHead(ABOUT_DESCRIPTION)} />
      <header className="jn-pagehead">
        <h1 className="jn-pagehead__title">About {PUBLICATION}</h1>
        <p className="jn-pagehead__standfirst">
          A place to explain things properly to people who were never given a straight answer, and to
          write down what CloudsForge is building and why.
        </p>
      </header>

      <div className="jn-body jn-body--prose">
        <p className="jn-body__p">
          Most writing about the systems people are asked to trust is aimed at people who already
          speak the language. It assumes you know what a key is, why a chain has blocks, what anyone
          means by custody or settlement or a float — and when it does explain, it explains in order
          to sell you something. This journal is the other thing: plain sentences about how it
          actually works, what usually goes wrong, and what it is like to live with.
        </p>
        <p className="jn-body__p">
          A lot of that has been about crypto, because that is what we build and it is where we know
          where the bodies are buried. It is not the boundary. Anything with a mechanism worth taking
          apart, and a gap between what it promises and what it does, belongs here.
        </p>

        <h2 className="jn-body__h2" id="who">
          Who writes it
        </h2>
        <p className="jn-body__p">
          {desk?.bio}
        </p>
        <p className="jn-body__p">
          That is the disclosure, and it is deliberately at the top rather than in small type at the
          bottom. When an article is about one of our own products, it is about a thing we are paid
          for. You should read it that way.
        </p>

        <h2 className="jn-body__h2" id="rules">
          The rules the desk keeps
        </h2>
        <ol className="jn-body__list jn-body__list--ordered">
          <li>
            <strong>No price talk.</strong> Nothing here forecasts a price, and nothing here tells
            you to buy or sell anything. If an article gives you a number it is a fact about how
            something works, with a source.
          </li>
          <li>
            <strong>The case against, in our own words.</strong> An article about something we built
            says what it is bad at. If we cannot write that paragraph honestly, the article is not
            finished.
          </li>
          <li>
            <strong>No invented writers.</strong> There is one byline and it is the company's. A
            named person on an article is a claim a reader cannot check, and inventing four of them
            to make a page feel warmer is a lie told in the one field nobody can verify.
          </li>
          <li>
            <strong>Corrections stay visible.</strong> A substantive edit changes the date at the top
            of the article and says what changed. Quietly fixing a claim somebody already read is how
            an archive stops being worth reading.
          </li>
        </ol>

        <h2 className="jn-body__h2" id="following">
          Following it
        </h2>
        <p className="jn-body__p">
          There is no mailing list and no account. The feed is at{' '}
          <a href={FEED_PATH}>{FEED_PATH}</a> — paste it into any reader and new pieces arrive there
          in full, including the images. We never learn that you subscribed, and you leave by
          deleting a line.
        </p>
        <p className="jn-body__p">
          If you want to see what is here first, the <Link to="/topics">topics</Link> are the fastest
          way in.
        </p>

        <h2 className="jn-body__h2" id="corrections">
          Getting something corrected
        </h2>
        <p className="jn-body__p">
          If a piece here is wrong, it is worth fixing. Everything on this site is written in the
          open — the articles are files in a public repository, and so is this page — so a correction
          is a change anybody can see and date.
        </p>
      </div>
    </>
  )
}

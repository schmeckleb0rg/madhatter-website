import Link from "next/link";

export const metadata = {
  title: "Open Mic | Mad Hatter Comedy Club",
  description: "Sign up for Open Mic Night at Mad Hatter Comedy Club in Chicago. Every Wednesday — all levels welcome.",
};

export default function OpenMicPage() {
  return (
    <div className="pt-20 sm:pt-24 pb-16 sm:pb-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-gold text-xs font-bold tracking-widest uppercase mb-3">
            Take the Stage
          </p>
          <h1 className="text-3xl sm:text-5xl font-black text-charcoal font-display">
            Open Mic Night
          </h1>
          <p className="mt-4 text-muted max-w-xl mx-auto">
            Every Wednesday night. All levels welcome. Your five minutes start now.
          </p>
        </div>

        {/* Hero card */}
        <div className="bg-white border border-charcoal/10 p-8 sm:p-10 text-center mb-10">
          <h2 className="text-2xl font-bold text-charcoal mb-2 font-display">
            Every Wednesday at 8 PM
          </h2>
          <p className="text-muted text-sm max-w-lg mx-auto">
            Sign-ups start at 7 PM. First come, first served. Each performer gets 5 minutes on stage.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <span className="text-3xl font-bold text-gold font-display">
              FREE
            </span>
            <span className="text-muted">|</span>
            <span className="text-sm text-muted">No cover for performers or audience</span>
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          <div className="bg-white border border-charcoal/10 p-6">
            <h3 className="text-gold text-sm font-semibold mb-3">How It Works</h3>
            <ol className="space-y-3 text-sm text-muted">
              <li className="flex gap-3">
                <span className="text-gold font-bold">1.</span>
                Arrive by 7 PM and put your name on the sign-up sheet at the bar
              </li>
              <li className="flex gap-3">
                <span className="text-gold font-bold">2.</span>
                The host draws names at random — be ready when yours is called
              </li>
              <li className="flex gap-3">
                <span className="text-gold font-bold">3.</span>
                You get 5 minutes on stage. A light means wrap it up
              </li>
              <li className="flex gap-3">
                <span className="text-gold font-bold">4.</span>
                Have fun — the crowd is here to laugh, not judge
              </li>
            </ol>
          </div>

          <div className="bg-white border border-charcoal/10 p-6">
            <h3 className="text-gold text-sm font-semibold mb-3">House Rules</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li className="flex items-start gap-2">
                <span className="text-gold mt-0.5">&#8226;</span>
                Keep it to 5 minutes — respect the clock and other performers
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold mt-0.5">&#8226;</span>
                No pre-recorded music, props, or backing tracks
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold mt-0.5">&#8226;</span>
                Be supportive of other comics — we&apos;re all in this together
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold mt-0.5">&#8226;</span>
                The host&apos;s decisions are final
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold mt-0.5">&#8226;</span>
                Two-drink minimum applies to all guests
              </li>
            </ul>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white border border-charcoal/10 p-6 sm:p-8 mb-10">
          <h3 className="text-lg font-bold text-charcoal mb-6 font-display">
            Frequently Asked Questions
          </h3>
          <div className="space-y-6 text-sm">
            <div>
              <p className="text-charcoal font-semibold mb-1">Do I need to sign up in advance?</p>
              <p className="text-muted">No. Just show up by 7 PM and add your name to the list. Spots fill up fast, so come early.</p>
            </div>
            <div>
              <p className="text-charcoal font-semibold mb-1">I&apos;ve never done stand-up before. Can I still sign up?</p>
              <p className="text-muted">Absolutely. Open mic is for everyone — first-timers, seasoned comics, and everyone in between.</p>
            </div>
            <div>
              <p className="text-charcoal font-semibold mb-1">Is there an age requirement?</p>
              <p className="text-muted">Open mic nights are 21+ with a valid ID.</p>
            </div>
            <div>
              <p className="text-charcoal font-semibold mb-1">Can I bring friends to watch?</p>
              <p className="text-muted">Yes! Audience members are always welcome. No cover charge.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-muted text-sm mb-4">Ready to take the stage?</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/events"
              className="px-8 py-3 bg-charcoal text-off-white font-bold hover:bg-charcoal-2 transition-colors"
            >
              See Upcoming Shows
            </Link>
            <Link
              href="/contact"
              className="px-8 py-3 border border-charcoal/10 text-muted hover:text-charcoal hover:border-gold/30 transition-colors"
            >
              Questions? Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

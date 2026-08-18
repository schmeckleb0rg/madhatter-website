import Link from "next/link";

export const metadata = {
  title: "Comedy Classes | Mad Hatter Comedy Club",
  description: "Learn stand-up comedy at Mad Hatter Comedy Club in Chicago. Beginner to advanced classes and workshops.",
};

const classes = [
  {
    title: "Stand-Up 101",
    subtitle: "For complete beginners",
    duration: "6 weeks",
    schedule: "Tuesdays, 7 PM – 9 PM",
    price: "$299",
    description:
      "Learn the fundamentals of stand-up comedy — writing jokes, finding your voice, timing, and stage presence. The course culminates in a live graduation show in front of a real audience.",
    highlights: [
      "Write your first 5-minute set",
      "Learn joke structure, callbacks, and misdirection",
      "Stage presence and microphone technique",
      "Graduation show on the Mad Hatter stage",
    ],
  },
  {
    title: "Stand-Up 201",
    subtitle: "For comics with stage time",
    duration: "6 weeks",
    schedule: "Thursdays, 7 PM – 9 PM",
    price: "$349",
    description:
      "Already done a few open mics? Level up your material with advanced joke writing, crowd work, and set building. Refine your voice and learn to command the room.",
    highlights: [
      "Develop a tight 10-minute set",
      "Advanced joke writing and editing techniques",
      "Crowd work and improvisation skills",
      "Recorded showcase performance with feedback",
    ],
  },
  {
    title: "Weekend Workshop",
    subtitle: "Intensive one-day deep dive",
    duration: "1 day",
    schedule: "Select Saturdays, 11 AM – 4 PM",
    price: "$129",
    description:
      "A concentrated comedy crash course for anyone curious about stand-up. Perfect if you can't commit to a full course but want a taste of the craft.",
    highlights: [
      "Joke writing exercises and instant feedback",
      "Watch and analyze professional sets",
      "Small group — limited to 12 students",
      "Optional open mic slot that evening",
    ],
  },
];

export default function ClassesPage() {
  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-club-gold text-xs font-bold tracking-widest uppercase mb-3">
            Learn the Craft
          </p>
          <h1
            className="text-4xl sm:text-5xl font-black text-white"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Comedy Classes
          </h1>
          <p className="mt-4 text-gray-500 max-w-xl mx-auto">
            Whether you&apos;re a first-timer or a working comic, our classes will sharpen your skills and get you stage-ready.
          </p>
          <div className="mt-4 text-club-gold tracking-widest opacity-30">&#9824; &#9829; &#9827; &#9830;</div>
        </div>

        {/* Classes */}
        <div className="space-y-8 mb-12">
          {classes.map((cls) => (
            <div
              key={cls.title}
              className="bg-club-card border border-club-border rounded-lg overflow-hidden"
            >
              <div className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                  <div>
                    <h2
                      className="text-xl font-bold text-white"
                      style={{ fontFamily: "var(--font-playfair)" }}
                    >
                      {cls.title}
                    </h2>
                    <p className="text-sm text-club-gold">{cls.subtitle}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-playfair)" }}>
                      {cls.price}
                    </div>
                  </div>
                </div>

                <p className="text-gray-400 text-sm leading-relaxed mb-5">{cls.description}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mb-5">
                  {cls.highlights.map((h) => (
                    <div key={h} className="flex items-start gap-2 text-sm text-gray-400">
                      <span className="text-club-gold mt-0.5 flex-shrink-0">&#10003;</span>
                      {h}
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 border-t border-club-border pt-4">
                  <span>{cls.duration}</span>
                  <span className="text-club-border">|</span>
                  <span>{cls.schedule}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Why take a class */}
        <div className="bg-club-card border border-club-border rounded-lg p-6 sm:p-8 mb-10">
          <h3
            className="text-lg font-bold text-white mb-6"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Why Learn at Mad Hatter?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl mb-3">🎭</div>
              <div className="text-white text-sm font-semibold mb-1">Real Stage Time</div>
              <p className="text-gray-500 text-xs">Perform on the same stage as the pros. Every class ends with a live show.</p>
            </div>
            <div>
              <div className="text-3xl mb-3">🎓</div>
              <div className="text-white text-sm font-semibold mb-1">Industry Instructors</div>
              <p className="text-gray-500 text-xs">Learn from working comedians who&apos;ve toured nationally and appeared on TV.</p>
            </div>
            <div>
              <div className="text-3xl mb-3">🤝</div>
              <div className="text-white text-sm font-semibold mb-1">Community</div>
              <p className="text-gray-500 text-xs">Join a network of comics. Many of our students go on to perform regularly at the club.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-gray-500 text-sm mb-4">Ready to enroll? Reach out and we&apos;ll save your spot.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="px-8 py-3 bg-club-red text-white font-bold rounded hover:bg-red-700 transition-colors"
            >
              Enroll Now
            </Link>
            <Link
              href="/open-mic"
              className="px-8 py-3 border border-club-border text-gray-400 rounded hover:text-white hover:border-club-gold/30 transition-colors"
            >
              Try Open Mic First
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

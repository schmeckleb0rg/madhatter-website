import ContactForm from "@/components/ContactForm";

export const metadata = {
  title: "Contact | Mad Hatter Comedy Club",
  description: "Get in touch with Mad Hatter Comedy Club in Chicago. Private events, bookings, and general inquiries.",
};

export default function ContactPage() {
  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-club-red text-xs font-bold tracking-widest uppercase mb-3">
            Get In Touch
          </p>
          <h1
            className="text-4xl sm:text-5xl font-black text-white"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Contact Us
          </h1>
          <p className="mt-4 text-gray-500 max-w-xl mx-auto">
            Questions about shows, private events, or just want to say hello? We&apos;d love to hear from you.
          </p>
          <div className="mt-4 text-club-gold tracking-widest opacity-30">&#9824; &#9829; &#9827; &#9830;</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Form */}
          <div className="lg:col-span-3">
            <div className="bg-club-card border border-club-border rounded-lg p-6 sm:p-8">
              <ContactForm />
            </div>
          </div>

          {/* Info sidebar */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-club-card border border-club-border rounded-lg p-6">
              <div className="text-club-gold text-sm font-semibold mb-3">Location</div>
              <p className="text-gray-400 text-sm">123 W Madison St</p>
              <p className="text-gray-400 text-sm">Chicago, IL 60602</p>
            </div>

            <div className="bg-club-card border border-club-border rounded-lg p-6">
              <div className="text-club-gold text-sm font-semibold mb-3">Email</div>
              <a
                href="mailto:hello@madhattercomedy.com"
                className="text-gray-400 text-sm hover:text-white transition-colors"
              >
                hello@madhattercomedy.com
              </a>
            </div>

            <div className="bg-club-card border border-club-border rounded-lg p-6">
              <div className="text-club-gold text-sm font-semibold mb-3">Phone</div>
              <a
                href="tel:+13125550100"
                className="text-gray-400 text-sm hover:text-white transition-colors"
              >
                (312) 555-0100
              </a>
            </div>

            <div className="bg-club-card border border-club-border rounded-lg p-6">
              <div className="text-club-gold text-sm font-semibold mb-3">Hours</div>
              <div className="text-sm text-gray-400 space-y-1">
                <div className="flex justify-between">
                  <span>Mon &ndash; Thu</span>
                  <span className="text-gray-500">6 PM &ndash; 11 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Fri &ndash; Sat</span>
                  <span className="text-gray-500">6 PM &ndash; 1 AM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span className="text-gray-500">5 PM &ndash; 10 PM</span>
                </div>
              </div>
            </div>

            <div className="bg-club-card border border-club-border rounded-lg p-6">
              <div className="text-club-gold text-sm font-semibold mb-3">Private Events</div>
              <p className="text-gray-400 text-sm">
                Hosting a birthday, corporate event, or party? We offer private show packages.
              </p>
              <a
                href="mailto:events@madhattercomedy.com"
                className="text-club-red text-sm mt-2 inline-block hover:underline"
              >
                events@madhattercomedy.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
          <p className="text-gold text-xs font-bold tracking-widest uppercase mb-3">
            Get In Touch
          </p>
          <h1 className="text-4xl sm:text-5xl font-black text-charcoal font-display">
            Contact Us
          </h1>
          <p className="mt-4 text-muted max-w-xl mx-auto">
            Questions about shows, private events, or just want to say hello? We&apos;d love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Form */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-charcoal/10 p-6 sm:p-8">
              <ContactForm />
            </div>
          </div>

          {/* Info sidebar */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-charcoal/10 p-6">
              <div className="text-gold text-sm font-semibold mb-3">Location</div>
              <p className="text-muted text-sm">123 W Madison St</p>
              <p className="text-muted text-sm">Chicago, IL 60602</p>
            </div>

            <div className="bg-white border border-charcoal/10 p-6">
              <div className="text-gold text-sm font-semibold mb-3">Email</div>
              <a
                href="mailto:hello@madhattercomedy.com"
                className="text-muted text-sm hover:text-charcoal transition-colors"
              >
                hello@madhattercomedy.com
              </a>
            </div>

            <div className="bg-white border border-charcoal/10 p-6">
              <div className="text-gold text-sm font-semibold mb-3">Phone</div>
              <a
                href="tel:+13125550100"
                className="text-muted text-sm hover:text-charcoal transition-colors"
              >
                (312) 555-0100
              </a>
            </div>

            <div className="bg-white border border-charcoal/10 p-6">
              <div className="text-gold text-sm font-semibold mb-3">Hours</div>
              <div className="text-sm text-muted space-y-1">
                <div className="flex justify-between">
                  <span>Mon &ndash; Thu</span>
                  <span className="text-muted">6 PM &ndash; 11 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Fri &ndash; Sat</span>
                  <span className="text-muted">6 PM &ndash; 1 AM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span className="text-muted">5 PM &ndash; 10 PM</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-charcoal/10 p-6">
              <div className="text-gold text-sm font-semibold mb-3">Private Events</div>
              <p className="text-muted text-sm">
                Hosting a birthday, corporate event, or party? We offer private show packages.
              </p>
              <a
                href="mailto:events@madhattercomedy.com"
                className="text-gold text-sm mt-2 inline-block hover:underline"
              >
                events@madhattercomedy.com
              </a>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="mt-10">
          <div className="bg-white border border-charcoal/10 overflow-hidden">
            <iframe
              title="Mad Hatter Comedy Club Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2970.4!2d-87.6318!3d41.8819!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s123+W+Madison+St%2C+Chicago%2C+IL+60602!5e0!3m2!1sen!2sus!4v1"
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

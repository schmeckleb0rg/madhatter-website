import ContactForm from "@/components/ContactForm";
import { getVenueInfo, phoneHref, mapEmbedUrl } from "@/lib/venue";

export const revalidate = 300;

export const metadata = {
  title: "Contact | Mad Hatter Comedy Club",
  description: "Get in touch with Mad Hatter Comedy Club in Chicago. Private events, bookings, and general inquiries.",
};

export default async function ContactPage() {
  const venue = await getVenueInfo();

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
              <p className="text-muted text-sm">{venue.street}</p>
              <p className="text-muted text-sm">{venue.city}, {venue.state} {venue.zip}</p>
            </div>

            <div className="bg-white border border-charcoal/10 p-6">
              <div className="text-gold text-sm font-semibold mb-3">Email</div>
              <a
                href={`mailto:${venue.email}`}
                className="text-muted text-sm hover:text-charcoal transition-colors"
              >
                {venue.email}
              </a>
            </div>

            <div className="bg-white border border-charcoal/10 p-6">
              <div className="text-gold text-sm font-semibold mb-3">Phone</div>
              <a
                href={phoneHref(venue)}
                className="text-muted text-sm hover:text-charcoal transition-colors"
              >
                {venue.phone}
              </a>
            </div>

            <div className="bg-white border border-charcoal/10 p-6">
              <div className="text-gold text-sm font-semibold mb-3">Hours</div>
              <div className="text-sm text-muted space-y-1">
                <div className="flex justify-between">
                  <span>Mon &ndash; Thu</span>
                  <span className="text-muted">{venue.hoursMon}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fri &ndash; Sat</span>
                  <span className="text-muted">{venue.hoursFri}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span className="text-muted">{venue.hoursSun}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-charcoal/10 p-6">
              <div className="text-gold text-sm font-semibold mb-3">Private Events</div>
              <p className="text-muted text-sm">
                Hosting a birthday, corporate event, or party? We offer private show packages.
              </p>
              <a
                href={`mailto:${venue.eventsEmail}`}
                className="text-gold text-sm mt-2 inline-block hover:underline"
              >
                {venue.eventsEmail}
              </a>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="mt-10">
          <div className="bg-white border border-charcoal/10 overflow-hidden">
            <iframe
              title="Mad Hatter Comedy Club Location"
              src={mapEmbedUrl(venue)}
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

import EventForm from "@/components/admin/EventForm";

export default function NewEventPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-white mb-8" style={{ fontFamily: "var(--font-playfair)" }}>
        New Event
      </h1>
      <div className="bg-club-card border border-club-border rounded-lg p-6 sm:p-8">
        <EventForm type="event" />
      </div>
    </div>
  );
}

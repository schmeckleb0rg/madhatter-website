import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { fullAddress, getVenueInfo } from "@/lib/venue";

function formatICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escapeICS(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const venue = await getVenueInfo();
  const address = fullAddress(venue);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const duration = event.event_duration_minutes || 120;

  const startDate = new Date(event.date);
  const endDate = new Date(startDate.getTime() + duration * 60 * 1000);

  const descParts: string[] = [];
  if (event.calendar_description || event.description) {
    descParts.push(event.calendar_description || event.description);
  }
  if (event.doors_time) descParts.push(`Doors open at ${event.doors_time}.`);
  descParts.push("Enjoy live comedy at Mad Hatter Comedy Club. Full bar available. 21+ show.");
  descParts.push(`Tickets & Info: ${siteUrl}/events/${eventId}`);

  const description = escapeICS(descParts.join("\n"));
  const summary = escapeICS(event.title);
  const location = escapeICS(address);

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Mad Hatter Comedy Club//Events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:event-${eventId}@madhatter`,
    `DTSTART:${formatICSDate(startDate)}`,
    `DTEND:${formatICSDate(endDate)}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    `URL:${siteUrl}/events/${eventId}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT60M",
    "ACTION:DISPLAY",
    `DESCRIPTION:${summary} starts in 1 hour`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${event.title.replace(/[^a-zA-Z0-9]/g, "-")}.ics"`,
    },
  });
}

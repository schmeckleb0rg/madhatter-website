import { Resend } from "resend";

let resend: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
}

const FROM_EMAIL = process.env.NOTIFICATION_FROM_EMAIL || "Mad Hatter <notifications@madhattercomedy.com>";
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "hello@madhattercomedy.com";

export async function notifyContactMessage(data: {
  name: string;
  email: string;
  subject: string | null;
  message: string;
}) {
  const r = getResend();
  if (!r) return; // silently skip if Resend not configured

  await r.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `New Contact: ${data.subject || "General Inquiry"} — from ${data.name}`,
    text: [
      `New contact form submission:`,
      ``,
      `Name: ${data.name}`,
      `Email: ${data.email}`,
      `Subject: ${data.subject || "N/A"}`,
      ``,
      `Message:`,
      data.message,
      ``,
      `---`,
      `View in admin: ${process.env.NEXT_PUBLIC_SITE_URL || ""}/admin/messages`,
    ].join("\n"),
  }).catch((err) => {
    console.error("Failed to send contact notification email:", err);
  });
}

export async function notifyTicketInquiry(data: {
  name: string;
  email: string;
  phone: string | null;
  partySize: number;
  eventTitle: string | null;
  message: string | null;
}) {
  const r = getResend();
  if (!r) return;

  await r.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `Ticket Inquiry from ${data.name}${data.eventTitle ? ` — ${data.eventTitle}` : ""}`,
    text: [
      `New ticket inquiry:`,
      ``,
      `Name: ${data.name}`,
      `Email: ${data.email}`,
      `Phone: ${data.phone || "N/A"}`,
      `Party Size: ${data.partySize}`,
      `Event: ${data.eventTitle || "Not specified"}`,
      ``,
      data.message ? `Message:\n${data.message}` : "",
      ``,
      `---`,
      `View in admin: ${process.env.NEXT_PUBLIC_SITE_URL || ""}/admin/inquiries`,
    ].join("\n"),
  }).catch((err) => {
    console.error("Failed to send inquiry notification email:", err);
  });
}

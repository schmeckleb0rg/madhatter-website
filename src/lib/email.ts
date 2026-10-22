import "server-only";
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

export async function notifyPrivateEventInquiry(data: {
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  eventType: string;
  guestCount: number | null;
  preferredDate: string | null;
  budgetRange: string | null;
  message: string | null;
}) {
  const r = getResend();
  if (!r) return;

  await r.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `Private Event Inquiry from ${data.name} — ${data.eventType}`,
    text: [
      `New private event inquiry:`,
      ``,
      `Name: ${data.name}`,
      `Email: ${data.email}`,
      `Phone: ${data.phone || "N/A"}`,
      `Company: ${data.company || "N/A"}`,
      `Event Type: ${data.eventType}`,
      `Guest Count: ${data.guestCount ?? "Not specified"}`,
      `Preferred Date: ${data.preferredDate || "Flexible"}`,
      `Budget Range: ${data.budgetRange || "Not specified"}`,
      ``,
      data.message ? `Message:\n${data.message}` : "",
      ``,
      `---`,
      `View in admin: ${process.env.NEXT_PUBLIC_SITE_URL || ""}/admin/inquiries`,
    ].join("\n"),
  }).catch((err) => {
    console.error("Failed to send private event inquiry notification email:", err);
  });
}

export async function sendWelcomeEmail(data: {
  email: string;
  subject: string;
  body: string;
}) {
  const r = getResend();
  if (!r) return;

  await r.emails.send({
    from: FROM_EMAIL,
    to: data.email,
    subject: data.subject,
    html: data.body,
  }).catch((err) => {
    console.error("Failed to send welcome email:", err);
  });
}

export async function sendTicketConfirmation(data: {
  email: string;
  eventTitle: string;
  eventDate: string;
  showTime: string | null;
  doorsTime: string | null;
  quantity: number;
  totalAmount: string;
  orderId: string;
  qrData: string;
}) {
  const r = getResend();
  if (!r) return;

  const dateStr = new Date(data.eventDate).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const html = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #F6F2E9; padding: 40px 24px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #1B1A17; font-size: 28px; margin: 0; font-family: Georgia, serif;">You're In!</h1>
        <p style="color: #6E6759; font-size: 14px; margin-top: 8px;">Your tickets for ${data.eventTitle} are confirmed.</p>
      </div>
      <div style="background: white; border: 1px solid rgba(27,26,23,0.1); padding: 24px;">
        <p style="color: #6E6759; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 16px; font-family: monospace;">Order Details</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 6px 0; color: #6E6759; font-size: 14px;">Event</td><td style="padding: 6px 0; text-align: right; color: #1B1A17; font-weight: bold; font-size: 14px;">${data.eventTitle}</td></tr>
          <tr><td style="padding: 6px 0; color: #6E6759; font-size: 14px;">Date</td><td style="padding: 6px 0; text-align: right; color: #1B1A17; font-family: monospace; font-size: 14px;">${dateStr}</td></tr>
          ${data.showTime ? `<tr><td style="padding: 6px 0; color: #6E6759; font-size: 14px;">Show Time</td><td style="padding: 6px 0; text-align: right; color: #1B1A17; font-family: monospace; font-size: 14px;">${data.showTime}</td></tr>` : ""}
          ${data.doorsTime ? `<tr><td style="padding: 6px 0; color: #6E6759; font-size: 14px;">Doors</td><td style="padding: 6px 0; text-align: right; color: #1B1A17; font-family: monospace; font-size: 14px;">${data.doorsTime}</td></tr>` : ""}
          <tr><td style="padding: 6px 0; color: #6E6759; font-size: 14px;">Tickets</td><td style="padding: 6px 0; text-align: right; color: #1B1A17; font-size: 14px;">${data.quantity}</td></tr>
          <tr style="border-top: 1px solid rgba(27,26,23,0.1);"><td style="padding: 12px 0 6px; color: #6E6759; font-size: 14px;">Total</td><td style="padding: 12px 0 6px; text-align: right; color: #1B1A17; font-weight: bold; font-size: 18px;">${data.totalAmount}</td></tr>
        </table>
      </div>
      <div style="text-align: center; margin-top: 24px;">
        <p style="color: #6E6759; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; font-family: monospace;">Present at Door</p>
        <p style="color: #6E6759; font-size: 12px; margin-top: 4px;">Order #${data.orderId.slice(0, 8).toUpperCase()}</p>
      </div>
      <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(27,26,23,0.1);">
        <p style="color: #B8934A; font-size: 16px; font-family: Georgia, serif; margin: 0;">Mad Hatter Comedy Club</p>
        <p style="color: #6E6759; font-size: 12px; margin-top: 4px;">1046 W Kinzie St, Chicago, IL 60642</p>
        <p style="color: #B8934A; font-size: 12px; margin-top: 8px;">Full bar available. 21+ show.</p>
      </div>
    </div>
  `;

  await r.emails.send({
    from: FROM_EMAIL,
    to: data.email,
    subject: `Your Mad Hatter Tickets — ${data.eventTitle}`,
    html,
  }).catch((err) => {
    console.error("Failed to send ticket confirmation email:", err);
  });
}

export async function notifyJobApplication(data: {
  name: string;
  email: string;
  phone: string | null;
  listingTitle: string;
}) {
  const r = getResend();
  if (!r) return;

  await r.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `New Job Application: ${data.listingTitle} — ${data.name}`,
    text: [
      `New job application received:`,
      ``,
      `Position: ${data.listingTitle}`,
      `Name: ${data.name}`,
      `Email: ${data.email}`,
      `Phone: ${data.phone || "N/A"}`,
      ``,
      `---`,
      `View in admin: ${process.env.NEXT_PUBLIC_SITE_URL || ""}/admin/employment`,
    ].join("\n"),
  }).catch((err) => {
    console.error("Failed to send job application notification email:", err);
  });
}

export async function sendPasswordResetEmail(data: {
  email: string;
  resetUrl: string;
}) {
  const r = getResend();
  if (!r) return;

  const html = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #F6F2E9; padding: 40px 24px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #1B1A17; font-size: 28px; margin: 0; font-family: Georgia, serif;">Reset Your Password</h1>
        <p style="color: #6E6759; font-size: 14px; margin-top: 8px;">We received a request to reset your admin password.</p>
      </div>
      <div style="background: white; border: 1px solid rgba(27,26,23,0.1); padding: 24px; text-align: center;">
        <p style="color: #1B1A17; font-size: 14px; margin: 0 0 24px;">Click the button below to set a new password. This link expires in 1 hour.</p>
        <a href="${data.resetUrl}" style="display: inline-block; background: #1B1A17; color: #F6F2E9; font-weight: bold; font-size: 14px; text-decoration: none; padding: 14px 32px;">Reset Password</a>
        <p style="color: #6E6759; font-size: 12px; margin-top: 24px; line-height: 1.5;">If the button doesn't work, copy and paste this link into your browser:<br/><span style="color: #B8934A; word-break: break-all;">${data.resetUrl}</span></p>
      </div>
      <div style="text-align: center; margin-top: 24px; padding-top: 24px; border-top: 1px solid rgba(27,26,23,0.1);">
        <p style="color: #6E6759; font-size: 12px; line-height: 1.5;">If you did not request this password reset, you can safely ignore this email. Your password will remain unchanged.</p>
        <p style="color: #B8934A; font-size: 14px; font-family: Georgia, serif; margin-top: 16px;">Mad Hatter Comedy Club</p>
      </div>
    </div>
  `;

  await r.emails.send({
    from: FROM_EMAIL,
    to: data.email,
    subject: "Reset Your Mad Hatter Admin Password",
    html,
  }).catch((err) => {
    console.error("Failed to send password reset email:", err);
  });
}

export async function sendGiftCardEmail(data: {
  recipientEmail: string;
  recipientName: string | null;
  senderName: string | null;
  amount: string;
  code: string;
  message: string | null;
  expiresAt: string | null;
}) {
  const r = getResend();
  if (!r) return;

  const expiryText = data.expiresAt
    ? new Date(data.expiresAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "No expiration";

  const html = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #1B1A17; padding: 40px 24px; color: #F6F2E9;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #B8934A; font-size: 28px; margin: 0;">Mad Hatter</h1>
        <p style="font-size: 14px; margin-top: 4px; color: #F6F2E9;">Comedy Club Gift Card</p>
      </div>
      <div style="background: #252420; border: 1px solid rgba(184,147,74,0.2); padding: 32px; text-align: center;">
        <p style="color: #B8934A; font-size: 42px; font-weight: bold; margin: 0;">${data.amount}</p>
        <p style="color: #6E6759; font-size: 12px; text-transform: uppercase; letter-spacing: 3px; margin: 16px 0 0;">Gift Card Code</p>
        <p style="color: #F6F2E9; font-size: 24px; font-family: monospace; letter-spacing: 4px; margin: 8px 0;">${data.code}</p>
        ${data.message ? `
          <div style="border-top: 1px solid rgba(184,147,74,0.2); margin-top: 24px; padding-top: 16px;">
            <p style="color: #F6F2E9; font-style: italic;">"${data.message}"</p>
            ${data.senderName ? `<p style="color: #6E6759; font-size: 13px;">— ${data.senderName}</p>` : ""}
          </div>
        ` : ""}
      </div>
      <div style="text-align: center; margin-top: 24px;">
        <p style="color: #6E6759; font-size: 13px;">Redeem at madhattercomedy.com or at the box office.</p>
        <p style="color: #6E6759; font-size: 12px;">Expires: ${expiryText}</p>
      </div>
    </div>
  `;

  await r.emails.send({
    from: FROM_EMAIL,
    to: data.recipientEmail,
    subject: "You've Received a Mad Hatter Gift Card!",
    html,
  }).catch((err) => {
    console.error("Failed to send gift card email:", err);
  });
}

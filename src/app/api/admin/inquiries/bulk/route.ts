import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ids, action } = await req.json();
  if (!Array.isArray(ids) || ids.length === 0 || !["archive", "unarchive", "read", "delete"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const db = getAdminClient();
  let error;

  if (action === "archive") {
    ({ error } = await db.from("ticket_inquiries").update({ is_archived: true }).in("id", ids));
  } else if (action === "unarchive") {
    ({ error } = await db.from("ticket_inquiries").update({ is_archived: false }).in("id", ids));
  } else if (action === "read") {
    ({ error } = await db.from("ticket_inquiries").update({ is_read: true }).in("id", ids));
  } else if (action === "delete") {
    ({ error } = await db.from("ticket_inquiries").delete().in("id", ids));
  }

  if (error) return NextResponse.json({ error: "Action failed" }, { status: 500 });
  return NextResponse.json({ success: true });
}

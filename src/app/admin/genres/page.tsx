export const dynamic = "force-dynamic";

import { getAdminClient } from "@/lib/supabase";
import type { EventGenre } from "@/lib/supabase";
import GenresAdmin from "@/components/admin/GenresAdmin";

async function getGenres(): Promise<EventGenre[]> {
  const db = getAdminClient();
  const { data } = await db.from("event_genres").select("*").order("name", { ascending: true });
  return (data as EventGenre[]) ?? [];
}

export default async function AdminGenresPage() {
  const genres = await getGenres();
  return <GenresAdmin initialGenres={genres} />;
}

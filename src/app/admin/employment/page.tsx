export const dynamic = "force-dynamic";

import { getAdminClient } from "@/lib/supabase";
import EmploymentAdmin from "@/components/admin/EmploymentAdmin";
import PageVisibilityToggle from "@/components/admin/PageVisibilityToggle";

type JobListing = {
  id: string;
  title: string;
  department: string | null;
  type: string;
  description: string | null;
  requirements: string | null;
  compensation: string | null;
  application_email: string | null;
  expires_at: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

type JobApplication = {
  id: string;
  listing_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  answers: Record<string, string>;
  is_read: boolean;
  created_at: string;
  job_listings: { title: string } | null;
};

async function getData() {
  const db = getAdminClient();
  const [listingsRes, applicationsRes] = await Promise.all([
    db.from("job_listings").select("*").order("sort_order", { ascending: true }),
    db.from("job_applications").select("*, job_listings(title)").order("created_at", { ascending: false }),
  ]);
  return {
    listings: (listingsRes.data as JobListing[]) ?? [],
    applications: (applicationsRes.data as JobApplication[]) ?? [],
  };
}

export default async function AdminEmploymentPage() {
  const { listings, applications } = await getData();
  return (
    <>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10">
        <PageVisibilityToggle pageKey="employment" label="Employment" />
      </div>
      <EmploymentAdmin initialListings={listings} initialApplications={applications} />
    </>
  );
}

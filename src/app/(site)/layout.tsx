import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getVenueInfo } from "@/lib/venue";

export const revalidate = 300;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const venue = await getVenueInfo();

  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer venue={venue} />
    </>
  );
}

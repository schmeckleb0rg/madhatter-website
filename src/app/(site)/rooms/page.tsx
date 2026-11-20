import { redirect } from "next/navigation";

export const metadata = {
  title: "MadHatter Comedy Club | Event Spaces",
};

export default function RoomsPage() {
  redirect("/event-spaces");
}

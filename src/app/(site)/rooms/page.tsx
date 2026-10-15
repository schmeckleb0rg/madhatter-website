import { redirect } from "next/navigation";

export const metadata = {
  title: "Event Spaces | Mad Hatter Comedy Club",
};

export default function RoomsPage() {
  redirect("/event-spaces");
}

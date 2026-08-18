import ComedianForm from "@/components/admin/ComedianForm";

export default function NewComedianPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-charcoal mb-8 font-display">
        New Comedian
      </h1>
      <div className="bg-white border border-charcoal/10 p-6 sm:p-8">
        <ComedianForm />
      </div>
    </div>
  );
}

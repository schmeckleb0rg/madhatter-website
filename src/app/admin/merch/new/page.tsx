import MerchForm from "@/components/admin/MerchForm";

export default function NewMerchPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-white mb-8" style={{ fontFamily: "var(--font-playfair)" }}>
        Add Merch Item
      </h1>
      <div className="bg-club-card border border-club-border rounded-lg p-6 sm:p-8">
        <MerchForm />
      </div>
    </div>
  );
}

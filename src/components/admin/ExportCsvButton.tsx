"use client";

export default function ExportCsvButton({
  filename,
  rows,
}: {
  filename: string;
  rows: string[][];
}) {
  function handleExport() {
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={handleExport}
      className="text-xs px-4 py-1.5 border border-charcoal/10 text-muted hover:border-gold/40 hover:text-charcoal transition-colors"
    >
      Export CSV
    </button>
  );
}

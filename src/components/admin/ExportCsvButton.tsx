"use client";

/** Shared CSV download utility — used by ExportCsvButton and SalesClient */
export function downloadCsv(filename: string, rows: string[][]) {
  const csv =
    "\uFEFF" + // UTF-8 BOM for Excel compatibility
    rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\r\n"); // CRLF per RFC 4180
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Revoke after a short delay to ensure the browser has started the download
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

export default function ExportCsvButton({
  filename,
  rows,
  label = "Export CSV",
}: {
  filename: string;
  rows: string[][];
  label?: string;
}) {
  return (
    <button
      onClick={() => downloadCsv(filename, rows)}
      aria-label={`Export ${filename} as CSV`}
      className="text-xs px-4 py-1.5 border border-charcoal/10 text-muted hover:border-gold/40 hover:text-charcoal transition-colors"
    >
      {label}
    </button>
  );
}

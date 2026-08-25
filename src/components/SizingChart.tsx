"use client";

import { useState } from "react";

const SIZING_DATA = {
  tees: {
    label: "T-Shirts",
    sizes: [
      { size: "S", chest: '34-36"', length: '28"', sleeve: '8"' },
      { size: "M", chest: '38-40"', length: '29"', sleeve: '8.5"' },
      { size: "L", chest: '42-44"', length: '30"', sleeve: '9"' },
      { size: "XL", chest: '46-48"', length: '31"', sleeve: '9.5"' },
      { size: "2XL", chest: '50-52"', length: '32"', sleeve: '10"' },
    ],
  },
  hoodies: {
    label: "Hoodies",
    sizes: [
      { size: "S", chest: '36-38"', length: '27"', sleeve: '33"' },
      { size: "M", chest: '40-42"', length: '28"', sleeve: '34"' },
      { size: "L", chest: '44-46"', length: '29"', sleeve: '35"' },
      { size: "XL", chest: '48-50"', length: '30"', sleeve: '36"' },
      { size: "2XL", chest: '52-54"', length: '31"', sleeve: '37"' },
    ],
  },
};

export default function SizingChart() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"tees" | "hoodies">("tees");

  const data = SIZING_DATA[tab];

  return (
    <div className="mb-8">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm font-mono text-muted hover:text-charcoal transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18M9 4v16M15 4v16" />
        </svg>
        Sizing Chart
        <svg className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="mt-4 bg-white border border-charcoal/10 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-charcoal/10">
            {(Object.keys(SIZING_DATA) as Array<keyof typeof SIZING_DATA>).map((key) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex-1 text-center py-3 text-sm font-mono transition-colors ${
                  tab === key
                    ? "bg-charcoal text-off-white"
                    : "text-muted hover:text-charcoal"
                }`}
              >
                {SIZING_DATA[key].label}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-charcoal/10">
                  <th className="text-left px-4 py-3 font-mono text-xs uppercase tracking-widest text-gold">Size</th>
                  <th className="text-left px-4 py-3 font-mono text-xs uppercase tracking-widest text-gold">Chest</th>
                  <th className="text-left px-4 py-3 font-mono text-xs uppercase tracking-widest text-gold">Length</th>
                  <th className="text-left px-4 py-3 font-mono text-xs uppercase tracking-widest text-gold">Sleeve</th>
                </tr>
              </thead>
              <tbody>
                {data.sizes.map((row, i) => (
                  <tr key={row.size} className={i % 2 === 0 ? "bg-off-white/50" : ""}>
                    <td className="px-4 py-2.5 font-semibold text-charcoal">{row.size}</td>
                    <td className="px-4 py-2.5 text-muted">{row.chest}</td>
                    <td className="px-4 py-2.5 text-muted">{row.length}</td>
                    <td className="px-4 py-2.5 text-muted">{row.sleeve}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 text-xs text-muted border-t border-charcoal/10">
            All measurements are approximate. For the best fit, measure a garment you already own and compare.
          </div>
        </div>
      )}
    </div>
  );
}

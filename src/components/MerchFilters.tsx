"use client";

import { useState } from "react";

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];
const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "apparel", label: "Apparel" },
  { value: "accessories", label: "Accessories" },
];

export type MerchFilters = {
  sizes: string[];
  category: string;
  showLimited: boolean;
  showArchive: boolean;
};

type Props = {
  availableColors: string[];
  filters: MerchFilters;
  onChange: (filters: MerchFilters) => void;
};

export default function MerchFiltersBar({ availableColors, filters, onChange }: Props) {
  const [expanded, setExpanded] = useState(false);

  function toggleSize(size: string) {
    const next = filters.sizes.includes(size)
      ? filters.sizes.filter((s) => s !== size)
      : [...filters.sizes, size];
    onChange({ ...filters, sizes: next });
  }

  return (
    <div className="mb-8">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm font-mono text-muted hover:text-charcoal transition-colors mb-4"
      >
        <svg className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
        Filters
      </button>

      {expanded && (
        <div className="bg-white border border-charcoal/10 p-5 space-y-5">
          {/* Category */}
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-gold mb-2">Category</div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => onChange({ ...filters, category: cat.value })}
                  className={`text-xs px-3 py-1.5 border transition-colors ${
                    filters.category === cat.value
                      ? "border-gold bg-gold/10 text-charcoal"
                      : "border-charcoal/10 text-muted hover:border-gold/30"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-gold mb-2">Size</div>
            <div className="flex flex-wrap gap-2">
              {ALL_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => toggleSize(size)}
                  className={`text-xs px-3 py-1.5 border transition-colors ${
                    filters.sizes.includes(size)
                      ? "border-gold bg-gold/10 text-charcoal"
                      : "border-charcoal/10 text-muted hover:border-gold/30"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          {availableColors.length > 0 && (
            <div>
              <div className="font-mono text-xs uppercase tracking-widest text-gold mb-2">Colors</div>
              <div className="flex flex-wrap gap-2">
                {availableColors.map((color) => (
                  <span
                    key={color}
                    className="text-xs px-3 py-1.5 border border-charcoal/10 text-muted"
                  >
                    {color}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Toggles */}
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
              <input
                type="checkbox"
                checked={filters.showLimited}
                onChange={(e) => onChange({ ...filters, showLimited: e.target.checked })}
                className="accent-gold"
              />
              Show Limited Items
            </label>
            <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
              <input
                type="checkbox"
                checked={filters.showArchive}
                onChange={(e) => onChange({ ...filters, showArchive: e.target.checked })}
                className="accent-gold"
              />
              Show Archive
            </label>
          </div>

          {/* Reset */}
          <button
            onClick={() => onChange({ sizes: ALL_SIZES, category: "all", showLimited: true, showArchive: true })}
            className="text-xs text-gold hover:underline"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
}

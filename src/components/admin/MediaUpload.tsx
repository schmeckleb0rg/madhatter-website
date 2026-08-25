"use client";

import { useRef, useState } from "react";
import Image from "next/image";

type MediaUploadProps = {
  /** Current URL value (controlled) */
  value: string;
  /** Called with new URL after upload or manual entry */
  onChange: (url: string) => void;
  /** Supabase storage folder prefix */
  folder: string;
  /** Dimension / size hint shown below the uploader */
  hint: string;
  /** Label shown above the field */
  label?: string;
};

const ACCEPT = ".png,.jpg,.jpeg,.gif,.mov,.mp4";
const ACCEPTED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "video/quicktime",
  "video/mov",
  "video/x-quicktime",
  "video/mp4",
];

function isVideo(url: string) {
  return /\.(mov|mp4)(\?|$)/i.test(url);
}

export default function MediaUpload({ value, onChange, folder, hint, label = "Media" }: MediaUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const inputClass =
    "w-full bg-off-white border border-charcoal/10 px-4 py-3 text-charcoal text-sm focus:outline-none focus:border-gold/50 transition-colors";
  const labelClass = "block font-mono text-xs uppercase tracking-widest text-muted mb-2";

  async function uploadFile(file: File) {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setUploadError("Unsupported format. Use PNG, JPEG, GIF, or MOV.");
      return;
    }

    setUploading(true);
    setUploadError("");

    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", folder);

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error ?? "Upload failed.");
      } else {
        onChange(data.url);
      }
    } catch {
      setUploadError("Upload failed. Check your connection.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  return (
    <div className="space-y-3">
      <label className={labelClass}>{label}</label>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={`relative border-2 border-dashed px-5 py-5 cursor-pointer transition-colors text-center ${
          dragOver
            ? "border-gold bg-gold/5"
            : "border-charcoal/15 hover:border-gold/40 hover:bg-off-white-2"
        }`}
      >
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPT}
          onChange={handleFileInput}
          className="sr-only"
        />

        {uploading ? (
          <div className="py-2">
            <div className="inline-block w-5 h-5 border-2 border-charcoal/20 border-t-gold rounded-full animate-spin mb-2" />
            <p className="text-xs text-muted">Uploading...</p>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-sm text-charcoal font-medium">
              Drop file here or <span className="text-gold underline">browse</span>
            </p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
              PNG · JPEG · GIF · MOV
            </p>
          </div>
        )}
      </div>

      {/* Hint */}
      <p className="font-mono text-[10px] text-muted/70 uppercase tracking-wide">{hint}</p>

      {uploadError && (
        <p className="text-xs" style={{ color: "#9C4A38" }}>{uploadError}</p>
      )}

      {/* Manual URL input */}
      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-1">Or paste URL</p>
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
          placeholder="https://..."
        />
      </div>

      {/* Preview */}
      {value && (
        <div className="relative">
          {isVideo(value) ? (
            <video
              src={value}
              controls
              className="w-full max-h-48 object-contain border border-charcoal/10 bg-charcoal/5"
            />
          ) : (
            <div className="relative w-full h-40 border border-charcoal/10 bg-off-white-2 overflow-hidden">
              <Image
                src={value}
                alt="Preview"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 640px"
                unoptimized
              />
            </div>
          )}
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 bg-charcoal/70 text-off-white text-xs px-2 py-1 hover:bg-charcoal transition-colors"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}

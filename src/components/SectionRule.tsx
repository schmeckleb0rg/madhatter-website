export default function SectionRule({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 my-8">
      <div className="flex-1 h-px bg-charcoal/10" />
      <span className="font-mono text-xs tracking-widest uppercase text-gold shrink-0">
        {label}
      </span>
      <div className="flex-1 h-px bg-charcoal/10" />
    </div>
  );
}

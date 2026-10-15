"use client";

type ClassInfo = {
  id: string;
  title: string;
  level: string | null;
  path_order: number | null;
  enrollment_status: string;
};

const defaultSteps = [
  { label: "101", level: "beginner" },
  { label: "201", level: "intermediate" },
  { label: "Workshop", level: "advanced" },
  { label: "Open Mic", level: "performance" },
  { label: "Stage", level: "professional" },
];

export default function ClassPathVisualization({ classes }: { classes: ClassInfo[] }) {
  return (
    <div className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 p-5 sm:p-6">
      <h3 className="font-mono text-xs tracking-widest uppercase text-gold mb-4">
        Your Comedy Path
      </h3>
      <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-2">
        {defaultSteps.map((step, i) => {
          const matchingClass = classes.find(
            (c) => c.level?.toLowerCase() === step.level || c.path_order === i + 1
          );
          const isAvailable = matchingClass?.enrollment_status === "open";
          const isWaitlist = matchingClass?.enrollment_status === "waitlist";

          return (
            <div key={step.label} className="flex items-center">
              <div
                className={`flex flex-col items-center min-w-[60px] sm:min-w-[80px] px-2 py-3 rounded text-center transition-colors ${
                  isAvailable
                    ? "bg-gold/15 border border-gold/30"
                    : isWaitlist
                    ? "bg-amber-500/10 border border-amber-500/20"
                    : "bg-charcoal/5 dark:bg-white/5 border border-charcoal/10 dark:border-off-white/10"
                }`}
              >
                <span
                  className={`text-sm sm:text-base font-display font-semibold ${
                    isAvailable
                      ? "text-gold"
                      : isWaitlist
                      ? "text-amber-500"
                      : "text-muted/50 dark:text-muted-dark/50"
                  }`}
                >
                  {step.label}
                </span>
                {isAvailable && (
                  <span className="text-[9px] font-mono text-green-600 dark:text-green-400 mt-0.5">OPEN</span>
                )}
                {isWaitlist && (
                  <span className="text-[9px] font-mono text-amber-500 mt-0.5">WAITLIST</span>
                )}
              </div>
              {i < defaultSteps.length - 1 && (
                <div className="w-4 sm:w-8 h-px bg-charcoal/15 dark:bg-off-white/15 flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

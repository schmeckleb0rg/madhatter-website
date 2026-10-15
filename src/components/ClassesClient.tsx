"use client";

import { useState } from "react";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import ClassEnrollmentForm from "@/components/ClassEnrollmentForm";

type ClassItem = {
  id: string;
  title: string;
  type: string;
  level: string;
  duration: string | null;
  price_cents: number;
  schedule: string | null;
  description: string | null;
  image_url: string | null;
  instructor: string | null;
  enrollment_status: string;
  max_enrollment: number | null;
  current_enrollment: number;
  cohort_start_date: string | null;
  path_order: number;
};

type ClassesClientProps = {
  classes: ClassItem[];
};

const typeLabels: Record<string, string> = {
  improv: "Improv",
  standup: "Stand-Up",
  sketch: "Sketch",
  writing: "Writing",
  workshop: "Workshop",
};

const levelLabels: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  "all-levels": "All Levels",
};

const statusColors: Record<string, string> = {
  open: "text-green-600 dark:text-green-400 bg-green-500/10",
  waitlist: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
  closed: "text-red-600 dark:text-red-400 bg-red-500/10",
};

export default function ClassesClient({ classes }: ClassesClientProps) {
  const [filter, setFilter] = useState<string>("all");
  const [enrollingClass, setEnrollingClass] = useState<string | null>(null);

  const types = [...new Set(classes.map((c) => c.type))];
  const filtered = filter === "all" ? classes : classes.filter((c) => c.type === filter);

  if (classes.length === 0) {
    return (
      <Reveal>
        <div className="text-center py-20">
          <p className="text-muted dark:text-[#7A7264] text-lg">No classes scheduled right now.</p>
          <p className="text-muted dark:text-[#7A7264] text-sm mt-2">Check back soon — new cohorts open regularly.</p>
        </div>
      </Reveal>
    );
  }

  return (
    <>
      {/* Type filter */}
      {types.length > 1 && (
        <Reveal>
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                filter === "all"
                  ? "bg-charcoal text-off-white dark:bg-gold dark:text-[#0D0C0A]"
                  : "text-muted dark:text-[#7A7264] border border-charcoal/10 dark:border-gold/10 hover:border-gold/40"
              }`}
            >
              All
            </button>
            {types.map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-4 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                  filter === t
                    ? "bg-charcoal text-off-white dark:bg-gold dark:text-[#0D0C0A]"
                    : "text-muted dark:text-[#7A7264] border border-charcoal/10 dark:border-gold/10 hover:border-gold/40"
                }`}
              >
                {typeLabels[t] || t}
              </button>
            ))}
          </div>
        </Reveal>
      )}

      {/* Class cards */}
      <div className="space-y-6">
        {filtered.map((cls, i) => (
          <Reveal key={cls.id} delay={i * 80}>
            <div className="bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 overflow-hidden">
              {cls.image_url && (
                <div className="relative aspect-[3/1] bg-off-white-2 dark:bg-[#161412]">
                  <Image
                    src={cls.image_url}
                    alt={cls.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 768px"
                  />
                </div>
              )}
              <div className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="font-display text-xl font-semibold text-charcoal dark:text-[#F0ECE3]">
                        {cls.title}
                      </h2>
                      <span
                        className={`font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 ${
                          statusColors[cls.enrollment_status] || statusColors.closed
                        }`}
                      >
                        {cls.enrollment_status === "open" ? "Enrolling" : cls.enrollment_status === "waitlist" ? "Waitlist" : "Closed"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono text-gold uppercase tracking-wider">
                        {typeLabels[cls.type] || cls.type}
                      </span>
                      <span className="text-charcoal/20 dark:text-[#7A7264]/40">|</span>
                      <span className="text-muted dark:text-[#7A7264]">
                        {levelLabels[cls.level] || cls.level}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-2xl font-semibold text-charcoal dark:text-[#F0ECE3]">
                      {cls.price_cents > 0 ? `$${(cls.price_cents / 100).toFixed(0)}` : "Free"}
                    </div>
                  </div>
                </div>

                {cls.description && (
                  <p className="text-muted dark:text-[#C4BDA8] text-sm leading-relaxed mb-4 whitespace-pre-line">
                    {cls.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-xs text-muted dark:text-[#7A7264] border-t border-charcoal/10 dark:border-gold/10 pt-4 mb-4">
                  {cls.instructor && (
                    <>
                      <span className="font-mono">Instructor: {cls.instructor}</span>
                      <span className="text-charcoal/20 dark:text-[#7A7264]/40">|</span>
                    </>
                  )}
                  {cls.duration && <span className="font-mono">{cls.duration}</span>}
                  {cls.schedule && (
                    <>
                      <span className="text-charcoal/20 dark:text-[#7A7264]/40">|</span>
                      <span className="font-mono">{cls.schedule}</span>
                    </>
                  )}
                  {cls.cohort_start_date && (
                    <>
                      <span className="text-charcoal/20 dark:text-[#7A7264]/40">|</span>
                      <span className="font-mono">
                        Starts {new Date(cls.cohort_start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </>
                  )}
                  {cls.max_enrollment && (
                    <>
                      <span className="text-charcoal/20 dark:text-[#7A7264]/40">|</span>
                      <span className="font-mono">
                        {cls.max_enrollment - cls.current_enrollment} spots left
                      </span>
                    </>
                  )}
                </div>

                {cls.enrollment_status !== "closed" && (
                  <>
                    {enrollingClass === cls.id ? (
                      <ClassEnrollmentForm
                        classId={cls.id}
                        className={cls.title}
                        onClose={() => setEnrollingClass(null)}
                      />
                    ) : (
                      <button
                        onClick={() => setEnrollingClass(cls.id)}
                        className="px-6 py-2.5 bg-charcoal dark:bg-gold text-off-white dark:text-[#0D0C0A] text-sm font-semibold hover:bg-charcoal-2 dark:hover:bg-[#D4A84B] transition-colors btn-shimmer"
                      >
                        {cls.enrollment_status === "waitlist" ? "Join Waitlist" : "Enroll Now"}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </>
  );
}

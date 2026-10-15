"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
  is_active: boolean;
  sort_order: number;
};

type Enrollment = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  status: string;
  payment_status: string;
  created_at: string;
};

const inputClass =
  "w-full bg-white/5 border border-off-white/10 px-3 py-2 text-sm text-off-white placeholder:text-muted-dark focus:border-gold/50 focus:outline-none";

export default function ClassesAdmin({ initialClasses }: { initialClasses: ClassItem[] }) {
  const router = useRouter();
  const [classes, setClasses] = useState(initialClasses);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [viewingEnrollments, setViewingEnrollments] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [type, setType] = useState("improv");
  const [level, setLevel] = useState("beginner");
  const [duration, setDuration] = useState("");
  const [priceCents, setPriceCents] = useState(0);
  const [schedule, setSchedule] = useState("");
  const [description, setDescription] = useState("");
  const [instructor, setInstructor] = useState("");
  const [enrollmentStatus, setEnrollmentStatus] = useState("open");
  const [maxEnrollment, setMaxEnrollment] = useState<number | "">("");
  const [cohortStartDate, setCohortStartDate] = useState("");
  const [pathOrder, setPathOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  function resetForm() {
    setTitle("");
    setType("improv");
    setLevel("beginner");
    setDuration("");
    setPriceCents(0);
    setSchedule("");
    setDescription("");
    setInstructor("");
    setEnrollmentStatus("open");
    setMaxEnrollment("");
    setCohortStartDate("");
    setPathOrder(0);
    setIsActive(true);
    setEditingId(null);
    setShowForm(false);
  }

  function editClass(c: ClassItem) {
    setTitle(c.title);
    setType(c.type);
    setLevel(c.level);
    setDuration(c.duration || "");
    setPriceCents(c.price_cents);
    setSchedule(c.schedule || "");
    setDescription(c.description || "");
    setInstructor(c.instructor || "");
    setEnrollmentStatus(c.enrollment_status);
    setMaxEnrollment(c.max_enrollment ?? "");
    setCohortStartDate(c.cohort_start_date || "");
    setPathOrder(c.path_order);
    setIsActive(c.is_active);
    setEditingId(c.id);
    setShowForm(true);
  }

  async function saveClass() {
    const payload = {
      title,
      type,
      level,
      duration: duration || null,
      price_cents: priceCents,
      schedule: schedule || null,
      description: description || null,
      instructor: instructor || null,
      enrollment_status: enrollmentStatus,
      max_enrollment: maxEnrollment === "" ? null : maxEnrollment,
      cohort_start_date: cohortStartDate || null,
      path_order: pathOrder,
      is_active: isActive,
      sort_order: pathOrder,
    };

    const url = editingId ? `/api/admin/classes/${editingId}` : "/api/admin/classes";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      if (editingId) {
        setClasses((prev) => prev.map((c) => (c.id === editingId ? data : c)));
      } else {
        setClasses((prev) => [...prev, data]);
      }
      resetForm();
      router.refresh();
    }
  }

  async function deleteClass(id: string) {
    if (!confirm("Delete this class?")) return;
    const res = await fetch(`/api/admin/classes/${id}`, { method: "DELETE" });
    if (res.ok) {
      setClasses((prev) => prev.filter((c) => c.id !== id));
      router.refresh();
    }
  }

  async function viewEnrollments(classId: string) {
    if (viewingEnrollments === classId) {
      setViewingEnrollments(null);
      return;
    }
    const res = await fetch(`/api/admin/classes/${classId}/enrollments`);
    if (res.ok) {
      const data = await res.json();
      setEnrollments(data);
      setViewingEnrollments(classId);
    }
  }

  async function updateEnrollmentStatus(classId: string, enrollmentId: string, status: string) {
    const res = await fetch(`/api/admin/classes/${classId}/enrollments`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enrollment_id: enrollmentId, status }),
    });
    if (res.ok) {
      setEnrollments((prev) =>
        prev.map((e) => (e.id === enrollmentId ? { ...e, status } : e))
      );
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-display font-semibold text-off-white">Classes</h1>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-4 py-2 bg-gold text-charcoal text-sm font-semibold hover:bg-gold/90 transition-colors"
        >
          + Add Class
        </button>
      </div>

      {showForm && (
        <div className="bg-white/5 border border-off-white/10 p-4 mb-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Class Title *" className={inputClass} />
            <input value={instructor} onChange={(e) => setInstructor(e.target.value)} placeholder="Instructor" className={inputClass} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
              <option value="improv">Improv</option>
              <option value="standup">Stand-Up</option>
              <option value="sketch">Sketch</option>
              <option value="writing">Writing</option>
              <option value="workshop">Workshop</option>
            </select>
            <select value={level} onChange={(e) => setLevel(e.target.value)} className={inputClass}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="all-levels">All Levels</option>
            </select>
            <select value={enrollmentStatus} onChange={(e) => setEnrollmentStatus(e.target.value)} className={inputClass}>
              <option value="open">Open</option>
              <option value="waitlist">Waitlist</option>
              <option value="closed">Closed</option>
            </select>
            <input type="number" value={priceCents} onChange={(e) => setPriceCents(Number(e.target.value))} placeholder="Price (cents)" className={inputClass} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Duration (e.g., 6 weeks)" className={inputClass} />
            <input value={schedule} onChange={(e) => setSchedule(e.target.value)} placeholder="Schedule (e.g., Tuesdays 7-9pm)" className={inputClass} />
            <input type="number" value={maxEnrollment} onChange={(e) => setMaxEnrollment(e.target.value ? Number(e.target.value) : "")} placeholder="Max Enrollment" className={inputClass} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="date" value={cohortStartDate} onChange={(e) => setCohortStartDate(e.target.value)} className={inputClass} />
            <input type="number" value={pathOrder} onChange={(e) => setPathOrder(Number(e.target.value))} placeholder="Path Order" className={inputClass} />
          </div>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" rows={3} className={inputClass} />
          <label className="flex items-center gap-2 text-sm text-off-white">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Active
          </label>
          <div className="flex gap-2">
            <button onClick={saveClass} className="px-4 py-2 bg-gold text-charcoal text-sm font-semibold hover:bg-gold/90 transition-colors">
              {editingId ? "Update" : "Create"}
            </button>
            <button onClick={resetForm} className="px-4 py-2 text-sm text-muted-dark hover:text-off-white transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {classes.map((c) => (
          <div key={c.id}>
            <div className="flex items-center justify-between bg-white/5 border border-off-white/10 px-4 py-3">
              <div>
                <span className={`text-sm font-medium ${c.is_active ? "text-off-white" : "text-muted-dark"}`}>
                  {c.title}
                </span>
                <span className="ml-2 text-xs text-gold">{c.type}</span>
                <span className="ml-2 text-xs text-muted-dark">{c.level}</span>
                <span className={`ml-2 text-xs ${c.enrollment_status === "open" ? "text-green-400" : c.enrollment_status === "waitlist" ? "text-amber-400" : "text-red-400"}`}>
                  {c.enrollment_status}
                </span>
                {!c.is_active && <span className="ml-2 text-xs text-red-400">Inactive</span>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => viewEnrollments(c.id)} className="text-xs text-gold hover:text-gold/80 transition-colors">
                  Enrollments
                </button>
                <button onClick={() => editClass(c)} className="text-xs text-muted-dark hover:text-off-white transition-colors">
                  Edit
                </button>
                <button onClick={() => deleteClass(c.id)} className="text-xs text-red-400 hover:text-red-300 transition-colors">
                  Delete
                </button>
              </div>
            </div>
            {viewingEnrollments === c.id && (
              <div className="bg-white/3 border-x border-b border-off-white/10 p-3 space-y-2">
                {enrollments.length === 0 ? (
                  <p className="text-xs text-muted-dark">No enrollments yet.</p>
                ) : (
                  enrollments.map((e) => (
                    <div key={e.id} className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-off-white">{e.name}</span>
                        <span className="ml-2 text-muted-dark">{e.email}</span>
                        {e.phone && <span className="ml-2 text-muted-dark">{e.phone}</span>}
                        <span className={`ml-2 ${e.status === "enrolled" ? "text-green-400" : e.status === "approved" ? "text-blue-400" : e.status === "rejected" ? "text-red-400" : "text-amber-400"}`}>
                          {e.status}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {e.status === "pending" && (
                          <>
                            <button onClick={() => updateEnrollmentStatus(c.id, e.id, "approved")} className="text-green-400 hover:text-green-300">Approve</button>
                            <button onClick={() => updateEnrollmentStatus(c.id, e.id, "rejected")} className="text-red-400 hover:text-red-300">Reject</button>
                          </>
                        )}
                        {e.status === "approved" && (
                          <button onClick={() => updateEnrollmentStatus(c.id, e.id, "enrolled")} className="text-gold hover:text-gold/80">Mark Enrolled</button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ))}
        {classes.length === 0 && (
          <p className="text-sm text-muted-dark py-4">No classes yet.</p>
        )}
      </div>
    </div>
  );
}

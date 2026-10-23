"use client";

import { useState, useEffect, useRef } from "react";

const DEFAULT_STATEMENT = `<p>We are committed to ensuring that our ticket shop is accessible and usable for all individuals, regardless of their abilities. We believe in providing an inclusive experience that empowers every user to navigate and interact with our ticket shop effectively and purchase tickets for events.</p>

<h2>Accessibility Standards</h2>
<p>To achieve our accessibility goals, our website aims to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA.</p>
<p>Our accessibility efforts are supported by an evaluation process conducted by an external consultant.</p>

<h2>Accessible Features</h2>

<h3>Using our Website with Visual Disabilities</h3>
<ul>
  <li><strong>Text Alternatives:</strong> Most non-text content, including controls, input, sensory content and images include descriptive text that screen readers can interpret.</li>
  <li><strong>Structured Content:</strong> Pages use clear headings, labels, and a logical reading order, making it easier for screen readers to navigate.</li>
  <li><strong>No Reliance on Color Alone:</strong> Important information is not shown using color only — there are additional visual or text cues.</li>
  <li><strong>Contrast:</strong> Text meets color contrast ratios against its background color to improve legibility.</li>
  <li><strong>Zoom Support:</strong> You can zoom in up to 200% without losing content or functionality.</li>
  <li><strong>Avoiding Text in Images:</strong> We use real, scalable text rather than images of text to convey information.</li>
  <li><strong>Consistent Labels and Order:</strong> Form fields, buttons, and navigation elements follow a predictable order and use consistent, meaningful labels.</li>
</ul>

<h3>Using our Website with Hearing Disabilities</h3>
<ul>
  <li><strong>Audio Control:</strong> You have control over audio content and volume.</li>
  <li><strong>No Audio-Only Information:</strong> All information is also available visually and textually.</li>
</ul>

<h3>Using our Website with Motor Disabilities</h3>
<ul>
  <li><strong>Keyboard Accessibility:</strong> You can use most of the core functionality with a keyboard. All active elements, such as links, buttons, and form elements are accessible without a mouse.</li>
  <li><strong>No Keyboard Traps:</strong> You do not get stuck inside a popup or form field while navigating with the keyboard.</li>
  <li><strong>Visible Keyboard Focus:</strong> There is a visual cue indicating where you are when tabbing through the site.</li>
  <li><strong>Consistent Navigation:</strong> You benefit from consistent menu navigation across the application.</li>
  <li><strong>Orientation Support:</strong> The site works across devices and screen orientations (portrait or landscape).</li>
  <li><strong>Predictable Layout:</strong> Icons and buttons are placed consistently across the site.</li>
</ul>

<h3>Using our Website with Motion/Animation Sensitivity</h3>
<ul>
  <li><strong>No Flashing Content:</strong> We avoid flashing visuals or animations that could cause discomfort or seizures.</li>
  <li><strong>Static Interface:</strong> We avoid moving or blinking elements.</li>
  <li><strong>Tooltip Control:</strong> Hover or pop-up content does not block your view and remains easily accessible and dismissible.</li>
  <li><strong>Text Reflow:</strong> Content can be presented without loss of information or functionality and without requiring two-dimensional scrolling.</li>
</ul>

<h2>Additional Accessibility Practices</h2>
<ul>
  <li><strong>Form Guidance:</strong> All forms use clear labels, instructions, and show helpful error messages with suggestions.</li>
  <li><strong>Autocomplete Support:</strong> Forms are optimized to allow autofill to save time and reduce typing.</li>
  <li><strong>Errors:</strong> Error messages are clearly identified and accessible to assistive technology. We identify input errors and provide suggestions for correction. We reduce the risk of input errors and provide messaging where users can check their answers before saving data, particularly for legal, financial, or data-sensitive information.</li>
  <li><strong>Assistive Tech Compatibility:</strong> Our page language and code follows modern web standards, ensuring smooth interaction with screen readers, braille devices, and other assistive technologies.</li>
</ul>

<h2>Non-Accessible Content</h2>
<p>While we strive for full accessibility, certain functionalities may be limited. Other aspects are not applicable for the current functionality of our ticket shop. This means that we do not provide the specific functionality or content types that the accessibility criteria address, and therefore, these requirements do not apply to the current scope of our services.</p>`;

export default function AccessibilityButton({ statement }: { statement?: string }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const content = statement || DEFAULT_STATEMENT;

  // Escape + body scroll lock
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeDialog();
    }
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    // Move focus into dialog
    const firstFocusable = dialogRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    firstFocusable?.focus();
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  function closeDialog() {
    setOpen(false);
    // Restore focus to trigger
    triggerRef.current?.focus();
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-muted-dark/50 hover:text-muted-dark transition-colors"
      >
        Accessibility
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:px-4 sm:py-8"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeDialog();
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="accessibility-dialog-title"
          ref={dialogRef}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 dark:bg-black/85" aria-hidden="true" />

          {/* Modal */}
          <div className="relative bg-off-white dark:bg-[#1C1A16] w-full sm:max-w-2xl sm:border sm:border-charcoal/10 max-h-[95vh] sm:max-h-[85vh] flex flex-col rounded-t-xl sm:rounded-none">
            {/* Drag handle — mobile only */}
            <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0" aria-hidden="true">
              <div className="w-10 h-1 rounded-full bg-charcoal/20 dark:bg-gold/20" />
            </div>

            {/* Sticky header */}
            <div className="sticky top-0 flex-shrink-0 bg-off-white dark:bg-[#1C1A16] border-b border-charcoal/10 dark:border-gold/10 px-6 py-4 flex items-center justify-between">
              <h2
                id="accessibility-dialog-title"
                className="font-display text-lg font-semibold text-charcoal dark:text-[#F0ECE3]"
              >
                Accessibility
              </h2>
              <button
                onClick={closeDialog}
                className="w-8 h-8 flex items-center justify-center text-muted dark:text-[#7A7264] hover:text-charcoal dark:hover:text-[#F0ECE3] transition-colors rounded"
                aria-label="Close accessibility statement"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto px-6 py-6 text-sm text-charcoal dark:text-[#C4BDA8] leading-relaxed accessibility-statement-content">
              <p className="font-mono text-xs tracking-widest uppercase text-gold mb-4">
                Information on Web Accessibility
              </p>
              <h2 className="font-display text-xl font-semibold text-charcoal dark:text-[#F0ECE3] mb-3">
                Our Commitment to Accessibility
              </h2>
              <div
                className="accessibility-content"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>
          </div>
        </div>
      )}

      <style>{`
        .accessibility-content h2 {
          font-family: var(--font-display), serif;
          font-size: 1.1rem;
          font-weight: 600;
          color: #1B1A17;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
        }
        html.dark .accessibility-content h2 {
          color: #F0ECE3;
        }
        .accessibility-content h3 {
          font-size: 0.9rem;
          font-weight: 600;
          color: #1B1A17;
          margin-top: 1.25rem;
          margin-bottom: 0.4rem;
        }
        html.dark .accessibility-content h3 {
          color: #F0ECE3;
        }
        .accessibility-content p {
          margin-bottom: 0.75rem;
        }
        .accessibility-content ul {
          margin-bottom: 0.75rem;
          padding-left: 1.25rem;
          list-style-type: disc;
        }
        .accessibility-content li {
          margin-bottom: 0.4rem;
        }
        .accessibility-content strong {
          color: #1B1A17;
          font-weight: 600;
        }
        html.dark .accessibility-content strong {
          color: #F0ECE3;
        }
      `}</style>
    </>
  );
}

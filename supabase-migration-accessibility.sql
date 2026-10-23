-- Accessibility Statement: Initial Content Seed
-- Run this in the Supabase SQL Editor to populate the admin-editable accessibility statement.
-- After running, go to /admin/content → "Accessibility Statement" to edit the text.

INSERT INTO page_content (page_key, section_key, content)
VALUES (
  'accessibility',
  'statement',
  '<p>We are committed to ensuring that our ticket shop is accessible and usable for all individuals, regardless of their abilities. We believe in providing an inclusive experience that empowers every user to navigate and interact with our ticket shop effectively and purchase tickets for events.</p>

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
<p>While we strive for full accessibility, certain functionalities may be limited. Other aspects are not applicable for the current functionality of our ticket shop. This means that we do not provide the specific functionality or content types that the accessibility criteria address, and therefore, these requirements do not apply to the current scope of our services.</p>'
)
ON CONFLICT (page_key, section_key) DO UPDATE
  SET content = EXCLUDED.content;

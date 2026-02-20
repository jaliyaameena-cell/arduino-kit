
## Arduino Made Simple – Single-Page Guide Website

### 1. Global Design System
- Arduino teal (`#00979D`) as the primary accent color, applied to headings, buttons, and highlights
- Clean white/off-white backgrounds with very subtle section alternation (no heavy gray boxes)
- Max-width 1280px, horizontally centered, generous vertical padding between sections
- Rounded corners (0.75rem), subtle drop shadows on cards and interactive elements
- Smooth fade/slide transitions throughout
- Mobile-first responsive layout

---

### 2. Sticky Navigation Bar
- Minimal logo on the left (Arduino icon + "ArduinoGuide" text in teal)
- Simple nav links on the right: *Home, Sensors, Project*
- Collapses gracefully on mobile (no hamburger menu — links stack or hide)

---

### 3. Hero / Landing Section
- Full-width hero with a **subtle teal-to-white gradient** background
- Large centered heading: **"Arduino Made Simple"** with subheading: *"Your First Electronics Project"*
- Short introductory paragraph below
- A smooth scroll-down arrow or CTA button

---

### 4. IDE Check Section
- Centered card-style section with the question: **"Did you download Arduino IDE?"**
- Two styled buttons: **Yes** and **No**
- **Yes** → animated fade-in of a green success message: *"You can proceed!"* + a "Next" button that scrolls to the next section
- **No** → animated fade-in of a warning message: *"You need to download Arduino IDE first"* + a teal link to the official Arduino download page
- Smooth fade/slide transitions for the response messages

---

### 5. Arduino Uno Board Section
- Left/right layout (stacks on mobile): **placeholder image** of the Arduino Uno board on one side, short description on the other
- Description covers: what it is, key specs (14 digital pins, 6 analog pins, USB powered), and beginner-friendliness
- Subtle background variation to separate this section visually

---

### 6. Sensor Selection Section
- **Section heading**: "Choose Your Sensors"
- Two sub-groups clearly labeled: **Input Sensors** and **Output Devices**
- **10 sensor cards** in a responsive grid (2–4 columns depending on screen size):
  - Each card: placeholder image area, sensor name, short description, and a **"Select"** toggle button
  - Clicking Select toggles a teal border/highlight on the card + button changes to "Selected ✓"
  - Multiple selections allowed freely
- A prominent **"Let's Do Project →"** button below all cards, activates when at least one sensor is selected
- Smooth hover effects (shadow lift, slight scale) on all cards

---

### 7. Project Placeholder Section
- Appears after clicking "Let's Do Project" (smooth scroll)
- Shows a friendly placeholder: *"Your project guide is coming soon!"* with a list of the selected sensors
- Clean, centered layout with a teal icon

---

### 8. Footer
- Minimal footer with the logo, a short tagline, and an attribution/copyright line
- No clutter — just clean spacing


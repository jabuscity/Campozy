# Campozy UI/UX Mockup Specification & Content Blueprint

This document is optimized for direct ingestion into **Google Stitch**, **Figma AI**, **Framer**, or manual layout in **Figma**. It provides exact design tokens, master component content, screen copy, layout wires, and ready-to-run prompts to generate highly accurate Campozy mockups.

---

## 1. DESIGN TOKENS & FIGMA VARIABLE MAPPING

Configure these in your Figma variables/styles or Google Stitch configuration panel:

| Category | Token Name | Value | Usage |
| :--- | :--- | :--- | :--- |
| **Colors** | `brand-primary` | `#1D4ED8` (Campozy Blue) | Primary actions, branding, selected tabs, high trust links |
| | `brand-secondary` | `#F59E0B` (Campozy Gold) | Highlighted features, warning/amber score, founder badges |
| | `success` | `#16A34A` | Verified badges, high-confidence score, reliable utilities |
| | `warning` | `#F97316` | Moderate utility warning, action required |
| | `danger` | `#DC2626` | Low score, critical utility alerts, security warnings |
| **Neutrals** | `neutral-900` | `#111827` | Headings, primary text, high contrast copy |
| | `neutral-700` | `#374151` | Body copy, secondary descriptions |
| | `neutral-500` | `#6B7280` | Placeholder texts, muted labels, icons |
| | `neutral-100` | `#F3F4F6` | Card backgrounds, page backgrounds, input fields |
| | `neutral-50` | `#F9FAFB` | Main page body container background |
| **Radius** | `radius-xs` | `8px` | Buttons, small badge outlines, inputs |
| | `radius-sm` | `12px` | Property cards, utility indicators |
| | `radius-md` | `16px` | Interactive modals, dashboard cards |
| | `radius-lg` | `24px` | Section cards |
| | `radius-pill` | `999px` | Search bar, category filters, founder badges |
| **Grid** | `grid-mobile` | 4 columns, 16px gutter | Main layout target (Mobile first) |
| | `grid-desktop`| 12 columns, 24px gutter | Max width: 1280px, Reading width: 720px |

---

## 2. MASTER COMPONENT SCHEMATICS

### A. Campozy Score Component
Visual presentation of confidence and quality.
*   **Form Factor**: Circular ring or pill badge.
*   **Visual Logic**:
    *   **90 - 100**: Green (`#16A34A`) - "Exceptional Confidence"
    *   **75 - 89**: Blue (`#1D4ED8`) - "Highly Reliable"
    *   **60 - 74**: Gold/Orange (`#F59E0B`) - "Average / Caution"
    *   **Below 60**: Red (`#DC2626`) - "High Risk / Poor History"
*   **Figma Text Properties**:
    *   Score: `H4 / Bold / Neutral-900`
    *   Label: `Caption / Medium / Neutral-500` (e.g., "Confidence Score")

### B. Verification Badge Layer
*   **Unverified**: Dotted grey border (`#D1D5DB`), text "Unverified"
*   **Claimed**: Light blue bg, text "Claimed by Owner"
*   **Community Verified**: Light green bg, text "Community Verified ✓ (42 Students)"
*   **Scout Verified**: Teal bg, text "Scout Audited ★"
*   **Campozy Verified**: Deep blue bg, white text, lock/shield icon "Campozy Certified ★★★"

### C. Founder Badges
*   **Campus Founder**: Gold circle with small university emblem (`#F59E0B`)
*   **Country Founder**: Rich gold shield, includes country flag or letters
*   **Global Pioneer**: Holographic/gradient blue-to-gold pill badge

---

## 3. CORE SCREEN WIREFRAMES & COPY SCRIPTS

### SCREEN 1: Unified Landing & Global Search (Mobile First)
*   **Layout Structure**:
    1.  **Top Navigation Bar**:
        *   Left: Campozy Logo (Minimal blue/gold shield)
        *   Right: User Avatar with "Contributor" green dot status.
    2.  **Hero Area**:
        *   Header: "Decide with Confidence." (`H2 / Inter / Neutral-900`)
        *   Subhead: "Real student experiences. Verified housing utilities. Zero guesswork." (`Body L / Neutral-600`)
    3.  **Unified Search Bar Component** (Pill style `radius-pill`):
        *   Icon: Magnifying Glass
        *   Placeholder Text: "Search universities, student housing, discussions..." (`Body / Neutral-500`)
        *   Action button inside search: "Go" (Primary Blue, rounded)
    4.  **Quick Filters List (Horizontal Scroll)**:
        *   Pill 1: 🏠 Student Housing (Active)
        *   Pill 2: 🎓 Campus Directories
        *   Pill 3: 💬 Student Discussions
        *   Pill 4: 💼 Opportunities
    5.  **Featured Real-Time Utility Feed** (Showing latest community reports):
        *   "Water reported ON at State Campus Residence (10 mins ago by Scout)" ✓ (Success Green)

*   **Google Stitch Content Block**:
    ```json
    {
      "component": "HeroSearchSection",
      "heading": "Decide with Confidence.",
      "subheading": "Real student experiences. Verified housing utilities. Zero guesswork.",
      "placeholder": "Search universities, student housing, discussions...",
      "recentAlert": {
        "text": "Water reported ON at State Campus Residence",
        "time": "10 mins ago",
        "status": "success"
      }
    }
    ```

---

### SCREEN 2: Property Detail Page (Deep Trust View)
*   **Layout Structure**:
    1.  **Header**: Inline back button + Share + Save (Heart icon).
    2.  **Image Carousel**: 3 images showing student-sourced photos (not just polished marketing photos).
    3.  **Property Meta Section**:
        *   Title: "Pinecrest Campus Studios" (`H4 / Bold / Neutral-900`)
        *   Distance: "300m from Central University Gate" (`Small / Neutral-500`)
        *   Campozy Score Badge: "88 / Highly Reliable" (`Blue Ring`)
        *   Verification Banner: "Scout Verified Audited on June 15, 2026"
    4.  **Utility Intelligence Matrix** (Critical 4-point card):
        *   ⚡ **Electricity**: "95% uptime. Back-up generator exists." (Green Indicator)
        *   💧 **Water**: "Flows daily 6 AM - 10 PM. Storage tank available." (Green Indicator)
        *   🌐 **WiFi**: "Avg 45 Mbps. Peak congestion at 8 PM." (Amber Indicator)
        *   🛡️ **Security**: "Fenced, biometric gate, 24/7 security guard." (Green Indicator)
    5.  **Hygiene Intelligence Card**:
        *   🧽 **Shared Bathrooms**: "Cleaned 3x weekly. Rating: 4.2/5 (18 reviews)"
        *   🗑️ **Waste Management**: "Bins collected every Tuesday."
    6.  **Owner Profile Badge**:
        *   "Landlord: Stephen K." - Response rate: "Under 1 hr" (High-trust signal)
    7.  **Primary Action Fixed Footer**:
        *   Price: "$120/month" (`H5 / Bold`)
        *   CTA Button: "Contact Verified Owner" (Primary Blue)

*   **Google Stitch Content Block**:
    ```json
    {
      "component": "PropertyIntelligence",
      "title": "Pinecrest Campus Studios",
      "distance": "300m from Central University Gate",
      "campozyScore": 88,
      "verification": "Scout Verified",
      "utilities": {
        "electricity": "95% uptime. Backup generator.",
        "water": "Flows daily 6 AM - 10 PM.",
        "wifi": "Avg 45 Mbps. Peak congestion 8 PM.",
        "security": "Biometric gate, 24/7 guard."
      },
      "price": "$120/month",
      "cta": "Contact Verified Owner"
    }
    ```

---

### SCREEN 3: Student Community Discussion & Reputation Panel
*   **Layout Structure**:
    1.  **Student Profile Header**:
        *   Avatar: "Alex Mercer"
        *   Level: "Campus Expert (Lvl 4)" - Badge: Gold circle with green core
        *   Stats: "42 Reviews | 18 Water Audits | 120 Helpful Votes"
    2.  **Discussion Category Feed**:
        *   Header: "Neighborhood Warnings & Tips"
        *   Post Card:
            *   User: "Sarah J. (Contributor)"
            *   Time: "2 hours ago"
            *   Category Tag: `⚠️ Warning` (Orange pill)
            *   Title: "Low water pressure in Sector B housing"
            *   Content: "Heads up, students! The water pump at Sector B main pipe is down. Try filling up your containers by 7 AM before flow drops completely."
            *   Interactions: "▲ 14 Upvotes | 💬 5 Comments"
    3.  **Quick Action Trigger**:
        *   Floating Action Button (FAB): "Report Utility Event" (Primary Blue with water/bolt icon)

*   **Google Stitch Content Block**:
    ```json
    {
      "component": "CommunityDiscussionCard",
      "author": "Sarah J.",
      "authorRole": "Contributor",
      "tag": "Warning",
      "title": "Low water pressure in Sector B housing",
      "body": "Heads up, students! The water pump at Sector B main pipe is down. Try filling up by 7 AM.",
      "upvotes": 14,
      "comments": 5
    }
    ```

---

### SCREEN 4: Student Opportunity Hub
*   **Layout Structure**:
    1.  **Header**: "Your Success Network"
    2.  **Toggle Tabs**: `All Internships` | `Scholarships` | `Mentorships`
    3.  **Opportunity Matches List**:
        *   Card 1:
            *   Logo: TechCorp logo placeholder
            *   Role: "Junior Software Intern (Summer 2026)"
            *   Target: "CS & Engineering Students"
            *   Trust Signal: "Verified Employer" ✓
            *   Match Factor: "Matches your Campus Expert status (Priority interview)"
            *   Action: "Apply via Campozy Passport"

*   **Google Stitch Content Block**:
    ```json
    {
      "component": "OpportunityCard",
      "employer": "TechCorp",
      "role": "Junior Software Intern (Summer 2026)",
      "badge": "Verified Employer",
      "matchText": "Matches your Campus Expert status (Priority interview)",
      "cta": "Apply via Campozy Passport"
    }
    ```

---

## 4. COPY-PASTEABLE GENERATIVE UI PROMPTS

Use these exact prompts inside your Generative UI generator (like Google Stitch, Figma AI, or v0) to automatically build the mockups.

### Prompt 1: Landing Page & Global Search UI
> "Generate a mobile-first responsive landing page for Campozy, a Student Trust Network. Colors should follow a primary blue (`#1D4ED8`) and neutral background (`#F9FAFB`). Display a large bold heading 'Decide with Confidence.' followed by a subtitle 'Real student experiences. Verified housing utilities. Zero guesswork.'. Below this, show a pill-shaped global search bar with a search icon and a 'Go' button. Provide a horizontal list of scrollable category pills for Housing, Campuses, Discussions, and Opportunities. Include a micro-banner showing a green success state for real-time community water reports."

### Prompt 2: Property Detail Page (Trust Layout)
> "Create a highly structured mobile-first property detail screen for a student housing platform. The top should have an image carousel of Pinecrest Campus Studios, showing a circular Campozy Score badge '88' in trustworthy blue, and a teal banner 'Scout Verified Audited'. Include a 4-box grid of student housing utilities: Electricity (95% uptime with green check), Water (6 AM - 10 PM with green check), WiFi (45 Mbps with amber warning icon), and Security (biometric lock with green check). Include landlord profile block Stephen K. with response rate under 1 hour. Place a fixed price and call-to-action bottom bar '$120/month - Contact Verified Owner'."

### Prompt 3: Community and Reputation Feed
> "Design a student community forum discussion list item and profile card. At the top, a user badge showing Alex Mercer, with the tag 'Campus Expert (Lvl 4)' and stats '42 Reviews | 18 Water Audits'. The discussion list item should feature a post by Sarah J., tagged with a warm orange pill 'Warning', titled 'Low water pressure in Sector B housing' with 14 upvotes and 5 comments. Include a clean floating action button (FAB) at the bottom right corner labeled 'Report Utility' using `#1D4ED8`."

---

## 5. PLATFORM ADAPTABILITY: MOBILE VS. DESKTOP PHILOSOPHY

To deliver on the product promise of "Confidence", Campozy adapts its visual and structural patterns across devices. Feeding these guidelines into Google Stitch/Figma ensures the mockup outputs reflect this tailored device strategy.

### A. Mobile Mode: "The App-Like Utility Engine"
On mobile, Campozy is optimized for fast, tactile, single-handed, on-the-go utility reporting and rapid discovery.

*   **Tactile Navigation**:
    *   **Sticky Bottom Navigation Bar**: Fixed at the bottom containing 5 quick-tap icons: *Home*, *Housing*, *Report (+)*, *Community*, and *Profile*.
    *   **Bottom Sheet Modals**: Filter criteria and utility reporting forms slide up from the bottom (drawers) instead of centering as floating pop-ups, enabling easy thumb interaction.
*   **High Actionability**:
    *   **Floating Action Button (FAB)**: A prominent, circular floating action button (e.g., "Report Utility (+)" or "Quick Post") placed in the lower-right quadrant.
    *   **Full-Bleed Components**: Image carousels on housing cards are edge-to-edge with swipe-dot indicators.
*   **Tap Targets & Density**:
    *   Minimum tap targets of `48px` with at least `8px` of spacing around interactive elements.
    *   High-contrast status badges for utilities (Electricity, Water) designed for split-second legibility.

### B. Desktop Mode: "The Refined, Authoritative Decision Suite"
On desktop, Campozy shifts into a calm, elegant, and highly informative dashboard designed for relaxed, deep-dive research and comparative decisions.

*   **Spacious & Calm Layouts**:
    *   **Dual-Pane View (Split Layout)**: Housing search on desktop utilizes a split screen: a beautiful, interactive high-fidelity Map on the left (spanning 45% width) and a clean, spacious 2-column list of verified property cards on the right.
    *   **Reading Centered (720px max-width)**: For discussion threads and long-form reviews to ensure comfortable eye tracking, clean margins, and an aesthetic, editorial feel.
*   **Deep Comparative Utility**:
    *   **Multi-Property Comparison Matrix**: A multi-column side-by-side comparison table where students (and parents) can view and compare up to 3 properties, checking utility uptime metrics (Water % vs WiFi Speed vs Electricity generator backup) in a single horizontal layout.
*   **Aesthetic & Trustworthy Visual Hierarchy**:
    *   **Persistent Sidebar / Top Navigation**: Structured mega-menu showing the entire student ecosystem cleanly organized.
    *   **Progressive Hover States**: Smooth, non-disruptive hover states showing tooltips with verification details (e.g., hovering over the "Scout Verified" badge reveals a micro-card showing the audit date and scout name).
    *   **Trust Before Beauty**: Higher density of explanatory text accompanying AI-driven recommendations and trust scores to provide transparency and confidence.

---

## 6. DEVICE-SPECIFIC GENERATIVE UI PROMPTS

### Prompt 4: Mobile-First "App-Like" Property Detail Screen
> "Design a native-app-like mobile UI for a student housing detail page. Key features: Sticky bottom action bar with contact owner CTA, floating action button for quick utility audit contribution, tactile slide-up bottom drawer for housing filters, edge-to-edge horizontal swipe image carousel with dots, and high-contrast 48px tap targets for easy thumb-based navigation on the go."

### Prompt 5: Desktop "Calm & Authoritative" Decision Dashboard
> "Design a calm, elegant desktop dual-pane dashboard for a student trust housing network. Left side: beautiful interactive map. Right side: spacious grid of property cards showing high-quality imagery, and detailed hover tooltips explaining the verification source. Use generous whitespace, a primary blue (`#1D4ED8`) and clean grey palette, and include a side-by-side comparison table showing up to three student hostels with utility metrics (Water, Power, WiFi) mapped horizontally. The feel must be clean, editorial, professional, and trustworthy."

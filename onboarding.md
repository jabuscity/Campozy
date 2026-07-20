---
name: Campozy Design System
colors:
  surface: '#faf8ff'
  surface-dim: '#d9d9e5'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f2fe'
  surface-container: '#ededf9'
  surface-container-high: '#e8e7f3'
  surface-container-highest: '#e2e1ed'
  on-surface: '#1a1b23'
  on-surface-variant: '#434655'
  inverse-surface: '#2e3039'
  inverse-on-surface: '#f0f0fb'
  outline: '#747686'
  outline-variant: '#c4c5d7'
  surface-tint: '#2151da'
  primary: '#0037b0'
  on-primary: '#ffffff'
  primary-container: '#1d4ed8'
  on-primary-container: '#cad3ff'
  inverse-primary: '#b7c4ff'
  secondary: '#855300'
  on-secondary: '#ffffff'
  secondary-container: '#fea619'
  on-secondary-container: '#684000'
  tertiary: '#7f2500'
  on-tertiary: '#ffffff'
  tertiary-container: '#a73400'
  on-tertiary-container: '#ffc9b7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b7c4ff'
  on-primary-fixed: '#001551'
  on-primary-fixed-variant: '#0039b5'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#ffb95f'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#ffdbcf'
  tertiary-fixed-dim: '#ffb59c'
  on-tertiary-fixed: '#390c00'
  on-tertiary-fixed-variant: '#832700'
  background: '#faf8ff'
  on-background: '#1a1b23'
  surface-variant: '#e2e1ed'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  columns: '12'
  gutter: 24px
  margin: 48px
  unit-xs: 4px
  unit-sm: 8px
  unit-md: 16px
  unit-lg: 24px
  unit-xl: 32px
  section-gap: 64px
---

## Brand & Style
The design system is anchored in the concept of a "Student Trust Network"—a space that balances the high-stakes nature of academic/professional advancement with the clarity of an editorial publication. The visual style is **Corporate / Modern** with a strong **Editorial** influence, prioritizing high-trust interactions and authoritative information density.

The target audience consists of students, academic administrators, and institutional partners. The UI must evoke a sense of reliability, calm, and institutional prestige. This is achieved through generous whitespace, a structured grid, and a sophisticated typographic hierarchy that mimics a high-end journal or professional finance application.

## Colors
The palette is dominated by **Campozy Blue**, symbolizing intelligence and stability, and **Campozy Gold**, used sparingly for high-value accents and achievement markers. 

- **Backgrounds:** Use the `bg_main` for the canvas and `bg_card` to create subtle containment for secondary content modules.
- **Typography:** Contrast is strictly maintained. Headings use the deepest neutral for maximum authority, while body text uses a slightly softer slate to improve long-form readability.
- **Status:** Functional colors (Success, Warning, Danger) are saturated and clear, ensuring critical status updates are immediately recognizable within the professional framework.

## Typography
This design system utilizes **Inter** for its systematic, utilitarian, and highly legible qualities. The hierarchy is designed for information-dense environments where clarity is paramount.

- **Headlines:** Utilize tighter letter-spacing and heavier weights to create an authoritative "anchor" for content blocks.
- **Body:** Standardized at 16px for optimal desktop readability, with a generous 1.5x line height to prevent eye fatigue during research or data review.
- **Labels:** Small labels use a slightly heavier weight and occasional uppercase styling to distinguish metadata from narrative content.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy on desktop to maintain an editorial feel, centering content within a maximum container width of 1280px.

- **Grid:** A 12-column structure provides the flexibility needed for complex dashboards and profile views.
- **Rhythm:** An 8px linear scale (4, 8, 16, 24, 32, 48, 64) governs all padding and margins, ensuring vertical rhythm across disparate components.
- **Desktop Strategy:** On wider screens, use the 24px gutters to separate sidebar navigation from the main content feed, utilizing the `section-gap` (64px) to distinguish between major topical areas.

## Elevation & Depth
Depth in this design system is conveyed through **Tonal Layers** and extremely subtle **Ambient Shadows**. The goal is to feel grounded and physical without the playfulness of shadows that are too diffused.

- **Surface Levels:** 
    - **Level 0 (Base):** `bg_main` (#F9FAFB).
    - **Level 1 (Cards):** White surfaces with a 1px border (#E5E7EB) or a very soft shadow (0px 1px 3px rgba(0,0,0,0.1)).
    - **Level 2 (Modals/Popovers):** White surfaces with a medium-diffusion shadow (0px 10px 15px -3px rgba(0,0,0,0.1)) to indicate a clear break from the background grid.
- **Outlines:** Instead of heavy shadows, use 1px interior strokes to define boundaries, maintaining a crisp, architectural look.

## Shapes
The shape language is intentional and hierarchical, moving from rigid to organic based on the component's function:

- **Buttons:** 8px radius (Small/Medium) provides a professional, stable feel.
- **Cards/Containers:** 12px radius offers a modern, approachable containment.
- **Modals:** 16px radius for a softer, prominent overlay.
- **Sections:** 24px radius for large-scale layout grouping.
- **Search & Filters:** 999px (Pill) is used exclusively for interactive search bars and category chips to distinguish them as "active" or "utility" elements within a sea of rectangular data cards.

## Components
- **Buttons:** Primary buttons use `brand-primary` with white text and an 8px radius. Secondary buttons should use a subtle gray stroke or `bg_card` background to remain subordinate.
- **Cards:** White backgrounds with 12px corners and a 1px `neutral_muted` border. Internal padding should be `unit-lg` (24px).
- **Pill Filters:** Use the 999px radius with a light gray background. When active, transition to `brand-primary` with white text.
- **Input Fields:** 8px radius, white background, and a 1px border. Focus state uses a 2px `brand-primary` ring.
- **Lists:** Clean, border-bottom separated items using `unit-md` (16px) vertical padding. Use `neutral_heading` for list titles and `neutral_muted` for secondary descriptions.
- **Modals:** Centered with 16px radius, a semi-transparent dark overlay (60% opacity), and a clear "X" close action in the top right.
- **Success/Danger Banners:** Use soft tinted backgrounds (e.g., 10% opacity of the status color) with high-contrast text and icons for immediate feedback.
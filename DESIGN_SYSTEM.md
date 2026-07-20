# Student Assessment Platform - Design System & Style Guide

**Version:** 1.0.0  
**Last Updated:** July 2026  
**Platform:** Educational Assessment System for Students & Administrators

---

## Table of Contents

1. [Brand Identity](#brand-identity)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing System](#spacing-system)
5. [Components](#components)
6. [Iconography](#iconography)
7. [Layout Patterns](#layout-patterns)
8. [Motion & Animation](#motion-animation)
9. [Accessibility Guidelines](#accessibility-guidelines)
10. [Implementation Guide](#implementation-guide)

---

## 1. Brand Identity

### Logo Usage Guidelines

**Primary Logo**
- Minimum size: 120px width for digital, 1 inch for print
- Clear space: Maintain minimum padding equal to the height of the "S" in the logo
- Do not stretch, rotate, or alter logo proportions
- Use on light backgrounds: Full color or primary blue version
- Use on dark backgrounds: White or light version

**Logo Variations**
- **Full Logo:** Use in headers, login screens, and official documents
- **Icon Mark:** Use in favicons, app icons, and small spaces (min 24px)
- **Wordmark:** Use in footers and text-heavy contexts

### Brand Colors

**Primary Colors**
- **Education Blue:** `#1976D2` - Trust, intelligence, stability
- **Success Green:** `#2E7D32` - Achievement, growth, correct answers
- **Attention Orange:** `#ED6C02` - Engagement, energy, important notices

**Usage Philosophy**
- Education Blue: Primary CTAs, navigation, branding elements
- Success Green: Positive feedback, completion states, correct answers
- Attention Orange: Important warnings, deadlines, pending actions

### Brand Voice & Tone

**Core Principles**
- **Encouraging:** Celebrate progress, emphasize growth over perfection
- **Clear:** Use simple language, avoid educational jargon
- **Supportive:** Guide users through challenges with helpful feedback
- **Professional:** Maintain credibility with educators and administrators

**Voice Variations**
- **Student Interface:** Friendly, motivating, age-appropriate
- **Admin Interface:** Professional, efficient, data-focused
- **Error Messages:** Helpful, solution-oriented, never blaming
- **Success Messages:** Celebratory, specific, encouraging continued effort

---

## 2. Color System

### Primary Palette

**Education Blue**
```
blue-50:  #E3F2FD  // Backgrounds, hover states
blue-100: #BBDEFB  // Light accents
blue-200: #90CAF9  // Disabled states
blue-300: #64B5F6  // Borders
blue-400: #42A5F5  // Hover states
blue-500: #1976D2  // Primary brand (4.5:1 contrast on white)
blue-600: #1565C0  // Active states
blue-700: #0D47A1  // Dark mode primary
blue-800: #0A3D91  // Text on light backgrounds
blue-900: #072C6F  // Headers, strong emphasis
```

### Subject Colors

Assign distinct colors to academic subjects for quick visual identification:

**Mathematics**
```
math-50:  #FFEBEE
math-500: #E53935  // Main: #E53935 (Red - logic, precision)
math-700: #C62828
```

**Science**
```
science-50:  #E8F5E9
science-500: #43A047  // Main: #43A047 (Green - nature, discovery)
science-700: #2E7D32
```

**English/Language Arts**
```
english-50:  #E8EAF6
english-500: #5E35B1  // Main: #5E35B1 (Purple - creativity, literacy)
english-700: #4527A0
```

**History/Social Studies**
```
history-50:  #FFF3E0
history-500: #F57C00  // Main: #F57C00 (Orange - culture, time)
history-700: #E65100
```

**Arts**
```
arts-50:  #FCE4EC
arts-500: #D81B60  // Main: #D81B60 (Pink - creativity, expression)
arts-700: #AD1457
```

### Difficulty Colors

Visual indicators for question difficulty levels:

```
easy-bg:   #E8F5E9  // Light green background
easy-text: #2E7D32  // Dark green text (4.5:1 contrast)
easy-icon: #43A047  // Icon color

medium-bg:   #FFF3E0  // Light amber background
medium-text: #E65100  // Dark orange text (4.5:1 contrast)
medium-icon: #F57C00  // Icon color

hard-bg:   #FFEBEE  // Light red background
hard-text: #C62828  // Dark red text (4.5:1 contrast)
hard-icon: #E53935  // Icon color
```

### Semantic Colors

**Success**
```
success-50:  #E8F5E9
success-500: #2E7D32  // 4.5:1 contrast ratio on white
success-700: #1B5E20
```

**Warning**
```
warning-50:  #FFF3E0
warning-500: #ED6C02  // 4.5:1 contrast ratio on white
warning-700: #E65100
```

**Error**
```
error-50:  #FFEBEE
error-500: #D32F2F  // 4.5:1 contrast ratio on white
error-700: #C62828
```

**Info**
```
info-50:  #E3F2FD
info-500: #0288D1  // 4.5:1 contrast ratio on white
info-700: #01579B
```

### Neutral Colors

**Grays** - Text, borders, backgrounds
```
gray-50:  #FAFAFA  // Page background
gray-100: #F5F5F5  // Card background
gray-200: #EEEEEE  // Dividers, borders
gray-300: #E0E0E0  // Disabled backgrounds
gray-400: #BDBDBD  // Disabled text
gray-500: #9E9E9E  // Secondary text
gray-600: #757575  // Icons, labels
gray-700: #616161  // Body text (4.5:1 contrast)
gray-800: #424242  // Headings (7:1 contrast)
gray-900: #212121  // Primary text (16:1 contrast)
```

### Color Contrast - WCAG AA Compliance

**Text Contrast Requirements**
- **Normal text (< 18px):** Minimum 4.5:1 contrast ratio
- **Large text (≥ 18px or 14px bold):** Minimum 3:1 contrast ratio
- **Interactive elements:** Minimum 3:1 contrast ratio against background

**Approved Text Combinations**
- Primary text: `gray-900` on `white` (16:1) ✓
- Body text: `gray-700` on `white` (7:1) ✓
- Secondary text: `gray-600` on `white` (4.7:1) ✓
- Primary button: `white` on `blue-500` (5.2:1) ✓
- Success text: `success-700` on `success-50` (8.3:1) ✓

### Dark Mode Palette

**Dark Background Colors**
```
dark-bg-primary:   #121212  // Main background
dark-bg-secondary: #1E1E1E  // Card background
dark-bg-elevated:  #2C2C2C  // Modal, dropdown background
dark-bg-hover:     #383838  // Hover states
```

**Dark Mode Adjustments**
- Use 200-300 shades for primary colors instead of 500-600
- Reduce elevation shadows, use lighter borders
- Text: Use `gray-100` for primary, `gray-300` for secondary
- Reduce color saturation by 10-15% for better readability

---

## 3. Typography

### Font Families

**Primary Font (Headings, UI)**
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 
             'Roboto', 'Helvetica Neue', Arial, sans-serif;
```
- Modern, highly legible sans-serif
- Excellent screen rendering at all sizes
- Use for headings, buttons, labels, navigation

**Secondary Font (Body Text)**
```css
font-family: 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI',
             'Roboto', 'Helvetica Neue', Arial, sans-serif;
```
- Warm, friendly appearance
- Optimized for longer reading passages
- Use for paragraphs, descriptions, content blocks

**Monospace Font (Code, Data)**
```css
font-family: 'JetBrains Mono', 'Fira Code', 'Monaco', 'Courier New', monospace;
```
- Clear distinction between characters
- Use for code snippets, IDs, technical data

### Type Scale

**Desktop Scale**
```css
h1: 48px / 3rem    (font-weight: 700, line-height: 1.2, letter-spacing: -0.02em)
h2: 40px / 2.5rem  (font-weight: 700, line-height: 1.2, letter-spacing: -0.01em)
h3: 32px / 2rem    (font-weight: 600, line-height: 1.3, letter-spacing: 0)
h4: 24px / 1.5rem  (font-weight: 600, line-height: 1.4, letter-spacing: 0)
h5: 20px / 1.25rem (font-weight: 600, line-height: 1.5, letter-spacing: 0)
h6: 18px / 1.125rem (font-weight: 600, line-height: 1.5, letter-spacing: 0)

body-lg: 18px / 1.125rem (font-weight: 400, line-height: 1.6)
body:    16px / 1rem      (font-weight: 400, line-height: 1.6)
body-sm: 14px / 0.875rem  (font-weight: 400, line-height: 1.5)
caption: 12px / 0.75rem   (font-weight: 400, line-height: 1.4)
```

**Mobile Scale** (< 768px)
```css
h1: 36px / 2.25rem
h2: 32px / 2rem
h3: 28px / 1.75rem
h4: 22px / 1.375rem
h5: 18px / 1.125rem
h6: 16px / 1rem

body: 16px / 1rem (maintain readable size)
```

**Tablet Scale** (768px - 1024px)
```css
h1: 42px / 2.625rem
h2: 36px / 2.25rem
h3: 30px / 1.875rem
(Interpolate between mobile and desktop)
```

### Font Weights

```css
light:   300  // Use sparingly, larger text only
regular: 400  // Default body text
medium:  500  // Emphasis, labels
semibold: 600 // Subheadings, buttons
bold:    700  // Headings, strong emphasis
```

### Line Heights

```css
tight:   1.2   // Large headings (h1, h2)
normal:  1.5   // UI elements, small headings
relaxed: 1.6   // Body text, longer content
loose:   1.8   // Dense content requiring extra breathing room
```

### Letter Spacing

```css
tighter: -0.02em  // Large headings (h1, h2)
tight:   -0.01em  // Medium headings (h3, h4)
normal:  0        // Body text, UI elements
wide:    0.02em   // Uppercase text, small labels
wider:   0.05em   // All-caps navigation items
```

### Responsive Typography Example

```css
/* Mobile-first approach */
.heading-primary {
  font-size: 2.25rem;      /* 36px */
  line-height: 1.2;
  font-weight: 700;
}

/* Tablet */
@media (min-width: 768px) {
  .heading-primary {
    font-size: 2.625rem;   /* 42px */
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .heading-primary {
    font-size: 3rem;        /* 48px */
  }
}
```

---

## 4. Spacing System

### Base Unit

**8px Grid System** - All spacing values are multiples of 8px for visual consistency.

### Spacing Scale

```css
0:  0px      // No spacing
1:  4px      // Micro spacing (icon padding)
2:  8px      // Tight spacing (inline elements)
3:  12px     // Small spacing (button padding)
4:  16px     // Base spacing (default gaps)
6:  24px     // Medium spacing (card padding)
8:  32px     // Large spacing (section padding)
12: 48px     // XL spacing (major sections)
16: 64px     // 2XL spacing (page sections)
20: 80px     // 3XL spacing (hero sections)
24: 96px     // 4XL spacing (major page divisions)
```

### Margin & Padding Conventions

**Component Internal Spacing**
```css
Button padding:     12px 24px (3 × 6)
Input padding:      12px 16px (3 × 4)
Card padding:       24px      (6)
Modal padding:      32px      (8)
Section padding:    48px      (12)
```

**Layout Spacing**
```css
Inline elements:    8px   (2)  // Badges, chips in a row
Stack elements:     16px  (4)  // Form fields, list items
Card gaps:          24px  (6)  // Cards in a grid
Section gaps:       48px  (12) // Major page sections
Page margins:       64px  (16) // Top/bottom page spacing
```

### Responsive Spacing

```css
/* Mobile */
section-padding-mobile: 24px
container-padding-mobile: 16px

/* Tablet */
section-padding-tablet: 32px
container-padding-tablet: 24px

/* Desktop */
section-padding-desktop: 48px
container-padding-desktop: 32px
```

---

## 5. Components

### Buttons

**Visual Structure**
```
┌─────────────────────────────┐
│    ▶  Button Text           │  Primary
└─────────────────────────────┘

┌─────────────────────────────┐
│      Button Text            │  Secondary
└─────────────────────────────┘

  Button Text                     Ghost/Text
  ~~~~~~~~~~~
```

**Variants**

**Primary Button**
- Background: `blue-500`, Text: `white`, Hover: `blue-600`, Active: `blue-700`
- Height: 40px (medium), 36px (small), 44px (large)
- Padding: `12px 24px` (medium), `10px 20px` (small), `14px 28px` (large)
- Border radius: `8px`
- Font weight: `600`
- Usage: Main actions, form submissions, primary CTAs

**Secondary Button**
- Background: `transparent`, Border: `2px solid blue-500`, Text: `blue-500`
- Hover: Background `blue-50`, border `blue-600`
- Same dimensions as primary
- Usage: Alternative actions, cancel operations

**Tertiary/Ghost Button**
- Background: `transparent`, Text: `blue-500`, Hover: `blue-50`
- No border, only text color
- Usage: Low-priority actions, inline links

**Icon Button**
- Square: `40px × 40px` (medium), `36px × 36px` (small)
- Icon size: `24px` (medium), `20px` (small)
- Background: `transparent`, Hover: `gray-100`
- Usage: Toolbars, compact interfaces, actions with clear icons

**States**
```css
Default:  Opacity 100%, normal cursor
Hover:    Background darken 10%, cursor pointer
Active:   Background darken 20%, scale(0.98)
Focus:    2px outline, blue-500, 2px offset
Disabled: Opacity 40%, cursor not-allowed, no pointer events
Loading:  Opacity 70%, spinner icon, cursor wait
```

**Accessibility**
- Minimum touch target: `44px × 44px`
- Focus indicator: `2px solid blue-500` with `2px` offset
- ARIA labels for icon-only buttons
- Disabled state: `aria-disabled="true"`, no hover effects

### Forms

**Input Fields**

```
Label                         ← 14px, gray-700, medium weight
┌─────────────────────────────┐
│ Placeholder text            │ ← 16px, gray-400
└─────────────────────────────┘
Helper text / Error message   ← 12px, gray-500 / error-500
```

**Text Input**
- Height: `44px`
- Padding: `12px 16px`
- Border: `1px solid gray-300`
- Border radius: `8px`
- Font size: `16px` (prevents iOS zoom)
- Focus: Border `2px solid blue-500`, shadow `0 0 0 3px rgba(25, 118, 210, 0.1)`
- Error: Border `error-500`, helper text in `error-500`

**Textarea**
- Min height: `120px`
- Resizable vertically only
- Same border, padding, focus styles as text input

**Select Dropdown**
```
┌─────────────────────────────┐
│ Selected option           ▼ │
└─────────────────────────────┘
    ┌─────────────────────────┐
    │ Option 1                │
    │ Option 2         ✓      │ ← Selected
    │ Option 3                │
    └─────────────────────────┘
```
- Height: `44px`, same styling as input
- Chevron icon: `20px`, `gray-600`, right-aligned
- Dropdown: Shadow `0 4px 16px rgba(0,0,0,0.1)`, max height `300px`, scrollable

**Checkbox**
```
☐  Unchecked    ☑  Checked    ☒  Indeterminate
```
- Size: `20px × 20px`
- Border: `2px solid gray-400`
- Border radius: `4px`
- Checked: Background `blue-500`, white checkmark
- Focus: Outline `2px solid blue-500`, `2px` offset

**Radio Button**
```
○  Unselected    ◉  Selected
```
- Size: `20px × 20px`
- Border: `2px solid gray-400`
- Selected: Border `blue-500`, inner dot `10px`, background `blue-500`

**Toggle Switch**
```
OFF:  ───○                ON:  ○───
```
- Width: `44px`, Height: `24px`
- Knob: `20px` diameter
- Off: Background `gray-300`, knob left
- On: Background `blue-500`, knob right
- Transition: `200ms ease`

### Cards

**Standard Card**
```
┌─────────────────────────────┐
│  Card Title            [•••]│  ← Header (optional)
│  ─────────────────────────  │
│                             │
│  Card content goes here     │  ← Content area
│  with text and other        │
│  elements                   │
│                             │
│  ─────────────────────────  │
│  [Cancel]      [Action]     │  ← Footer (optional)
└─────────────────────────────┘
```
- Background: `white`
- Border radius: `12px`
- Padding: `24px`
- Shadow: `0 1px 3px rgba(0,0,0,0.1)`

**Elevated Card**
- Shadow: `0 4px 12px rgba(0,0,0,0.1)`
- Hover: `0 8px 24px rgba(0,0,0,0.15)`, translate `Y -2px`
- Use for interactive cards, clickable items

**Outlined Card**
- Border: `1px solid gray-200`
- Shadow: None
- Use for subtle grouping, dense layouts

### Tables

**Standard Table**
```
┌──────────────┬──────────────┬──────────────┐
│ Header 1  ▲  │ Header 2     │ Header 3     │  ← thead, gray-50 bg
├──────────────┼──────────────┼──────────────┤
│ Cell data    │ Cell data    │ Cell data    │
│ Cell data    │ Cell data    │ Cell data    │  ← Hover: gray-50
│ Cell data    │ Cell data    │ Cell data    │
└──────────────┴──────────────┴──────────────┘
```
- Header: Background `gray-50`, font weight `600`, `14px`
- Cell padding: `16px`
- Border: `1px solid gray-200` (horizontal only)
- Row hover: Background `gray-50`

**Striped Table**
- Odd rows: `white`
- Even rows: `gray-50`
- Improves readability for dense data

**Sortable Columns**
- Clickable headers with sort icon (▲▼)
- Active sort: Icon `blue-500`, header text `blue-500`

### Badges

**Visual Examples**
```
┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
│ DEFAULT │  │ SUCCESS │  │ WARNING │  │  ERROR  │
└─────────┘  └─────────┘  └─────────┘  └─────────┘
```

**Specifications**
- Height: `24px`
- Padding: `4px 12px`
- Border radius: `12px` (pill shape)
- Font size: `12px`, weight `600`
- Text transform: `uppercase`, letter spacing `0.05em`

**Color Variants**
- Default: `gray-100` background, `gray-700` text
- Success: `success-50` background, `success-700` text
- Warning: `warning-50` background, `warning-700` text
- Error: `error-50` background, `error-700` text
- Info: `info-50` background, `info-700` text

### Chips/Tags

```
┌────────────────┐     ┌────────────────┬──┐
│  Chip Label    │     │  Removable Tag │ × │
└────────────────┘     └────────────────┴──┘
```

**Standard Chip**
- Height: `32px`
- Padding: `6px 16px`
- Border radius: `16px`
- Background: `gray-100`, hover `gray-200`
- Optional leading icon: `16px`, `gray-600`

**Removable Chip**
- Remove button: `20px × 20px`, hover `error-50`
- Icon: × (close), `16px`, `gray-600`, hover `error-500`

**Clickable Chip**
- Cursor: `pointer`
- Hover: Background `blue-50`, border `blue-500`
- Active: Background `blue-100`

### Progress Indicators

**Linear Progress**
```
────────────────────────────────
████████████░░░░░░░░░░░░░░░░░░░░  ← 40% complete
────────────────────────────────
```
- Height: `8px` (default), `4px` (thin), `12px` (thick)
- Background: `gray-200`
- Fill: `blue-500`
- Border radius: `4px`
- Animation: Indeterminate state with shimmer effect

**Circular Progress**
```
      ███
   ██     ██
  ██       ░░
 ██         ░░
 ██         ░░
  ██       ░░
   ██     ██
      ███
```
- Size: `40px` (default), `24px` (small), `64px` (large)
- Stroke width: `4px`
- Color: `blue-500`
- Background: `gray-200`

**Step Indicator**
```
 ●──────●──────○──────○
Done   Current  Todo   Todo
```
- Circle size: `32px`
- Line thickness: `2px`
- Completed: `blue-500` fill, white checkmark
- Current: `blue-500` border, white fill, number inside
- Todo: `gray-300` border, white fill

### Alerts

**Visual Structure**
```
┌─ ℹ ────────────────────────────────────── × ─┐
│                                              │
│  Alert Title                                 │
│  Detailed message providing context and      │
│  actionable information.                     │
│                                              │
│  [Dismiss]  [Action]                         │
└──────────────────────────────────────────────┘
```

**Variants**
- Success: `success-50` bg, `success-700` text, checkmark icon
- Warning: `warning-50` bg, `warning-800` text, exclamation icon
- Error: `error-50` bg, `error-700` text, error icon
- Info: `info-50` bg, `info-700` text, info icon

**Specifications**
- Padding: `16px`
- Border radius: `8px`
- Border left: `4px solid` (semantic color)
- Icon size: `24px`, aligned top
- Close button: Icon button, `24px`, top-right corner

### Modals/Dialogs

**Standard Modal**
```
        ┌──────────────────────────────┐
        │ Modal Title            [×]   │  ← Header
        ├──────────────────────────────┤
        │                              │
        │  Modal content with forms,   │  ← Content
        │  text, or other elements     │
        │                              │
        ├──────────────────────────────┤
        │         [Cancel]  [Confirm]  │  ← Footer
        └──────────────────────────────┘
```

**Specifications**
- Max width: `600px` (standard), `800px` (large), `400px` (small)
- Padding: `32px`
- Border radius: `16px`
- Background: `white`
- Shadow: `0 20px 60px rgba(0,0,0,0.3)`
- Overlay: `rgba(0,0,0,0.5)`, backdrop blur `4px`

**Confirmation Dialog**
- Smaller size: `400px` max width
- Centered text
- Warning icon for destructive actions
- Primary button for confirm, secondary for cancel

### Tooltips

```
     ▲
┌────────────┐
│  Tooltip   │
└────────────┘
```

**Specifications**
- Max width: `240px`
- Padding: `8px 12px`
- Background: `gray-900`, opacity `90%`
- Text: `white`, `12px`
- Border radius: `6px`
- Arrow: `8px` triangle, same color as background

**Positioning**
- Top, Bottom, Left, Right (auto-adjust based on viewport)
- Offset: `8px` from trigger element
- Show delay: `500ms`, hide delay: `0ms`

### Navigation

**Sidebar Navigation**
```
┌───────────────────┐
│  ☰  App Name      │  ← Header
├───────────────────┤
│  ⌂  Dashboard     │  ← Active: blue-50 bg
│  📝 Assessments   │
│  📊 Results       │
│  ⚙  Settings      │
├───────────────────┤
│  👤 User Name     │  ← Footer
└───────────────────┘
```
- Width: `280px` (desktop), `240px` (tablet), full-screen (mobile)
- Item height: `48px`
- Item padding: `12px 24px`
- Active state: `blue-50` background, `blue-700` text, `4px` left border `blue-500`
- Hover: `gray-50` background
- Icon size: `24px`, `gray-600` default, `blue-500` active

**Tabs**
```
 Active Tab    Tab 2    Tab 3
 ──────────    
```
- Height: `48px`
- Padding: `12px 24px`
- Active: `blue-500` text, `3px` bottom border `blue-500`
- Hover: `blue-50` background
- Font weight: `600` (active), `400` (inactive)

**Breadcrumbs**
```
Home  >  Assessments  >  Math Quiz
```
- Font size: `14px`
- Color: `gray-600`, current page `gray-900`
- Separator: `>` or `/`, `gray-400`
- Hover: Underline

**Pagination**
```
← Previous   1  [2]  3  4  5   Next →
```
- Item size: `36px × 36px`
- Active: `blue-500` background, `white` text
- Hover: `blue-50` background
- Disabled: `gray-300` color, not clickable

---

## 6. Iconography

### Icon Library

**Recommended: Material Icons**
- Comprehensive set covering all UI needs
- Multiple styles: Filled, Outlined, Rounded, Sharp
- Default: Use **Outlined** for consistency
- Use **Filled** for active/selected states

**Alternative: Heroicons**
- Modern, MIT licensed
- Clean, consistent design
- Solid and Outline variants

### Icon Sizes

```css
xs:  16px  // Inline with small text, badges
sm:  20px  // Input fields, small buttons
md:  24px  // Default UI icons, navigation
lg:  32px  // Feature cards, empty states
xl:  48px  // Hero sections, large CTAs
```

### Icon Usage Guidelines

**Navigation Icons**
- Use consistent metaphors: Home (house), Settings (gear), Profile (person)
- Size: `24px`
- Color: `gray-600` inactive, `blue-500` active

**Action Icons**
- Clear purpose: Edit (pencil), Delete (trash), Download (arrow down)
- Always include tooltips or labels
- Size: `20px` (small buttons), `24px` (standard buttons)

**Status Icons**
- Success: Checkmark circle, `success-500`
- Warning: Exclamation triangle, `warning-500`
- Error: X circle, `error-500`
- Info: Info circle, `info-500`
- Size: `20px` inline, `24px` standalone

**Decorative Icons**
- Larger sizes for empty states, onboarding
- Reduce opacity to `60%` for subtle emphasis
- Use illustrative style when available

### Custom Icons - Platform Features

**Assessment Icons**
- Multiple Choice: Circle with segments
- True/False: Checkmark and X
- Short Answer: Text lines
- Essay: Document with lines
- Fill in Blank: Underlined text

**Subject Icons**
- Math: Calculator or equation symbol
- Science: Beaker or atom
- English: Book or quote symbol
- History: Clock or scroll
- Arts: Palette or musical note

**Icon Color Usage**
- Default: `gray-600`
- Interactive hover: `gray-900`
- Active/Selected: `blue-500`
- Disabled: `gray-400`
- On colored backgrounds: `white` or `currentColor`

---

## 7. Layout Patterns

### Grid System

**12-Column Grid**
```
┌──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┐
│  │  │  │  │  │  │  │  │  │  │  │  │
│  │       6 cols       │   6 cols   │
│  │                    │            │
└──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┘
```

**Column Widths**
- 1 column:  8.33%
- 2 columns: 16.66%
- 3 columns: 25%
- 4 columns: 33.33%
- 6 columns: 50%
- 8 columns: 66.66%
- 12 columns: 100%

**Gutters**
- Desktop: `24px` (6 spacing units)
- Tablet: `16px` (4 spacing units)
- Mobile: `16px` (4 spacing units)

### Container Widths

```css
sm:   640px   // Mobile-first, narrow content
md:   768px   // Tablets, two-column forms
lg:   1024px  // Standard desktop content
xl:   1280px  // Wide desktop, dashboards
2xl:  1536px  // Ultra-wide, data-heavy interfaces
```

**Content Width Best Practices**
- Text content: Max `720px` for readability (60-80 characters per line)
- Forms: Max `600px` for single-column forms
- Dashboards: Full container width with grid
- Data tables: Horizontal scroll on mobile if needed

### Responsive Breakpoints

```css
/* Mobile First */
xs:  0px      // Mobile phones (default)
sm:  640px    // Large phones, small tablets
md:  768px    // Tablets
lg:  1024px   // Desktop
xl:  1280px   // Large desktop
2xl: 1536px   // Extra large desktop
```

### Page Layouts

**Dashboard Layout**
```
┌─────────────────────────────────────────┐
│  Header / Top Navigation                │
├──────┬──────────────────────────────────┤
│ Side │  ┌────────┐ ┌────────┐ ┌───────┐│
│ bar  │  │ Card 1 │ │ Card 2 │ │ Card 3││
│      │  └────────┘ └────────┘ └───────┘│
│ Nav  │                                  │
│      │  ┌──────────────────────────────┐│
│      │  │   Chart / Data Table         ││
│      │  └──────────────────────────────┘│
└──────┴──────────────────────────────────┘
```

**Form Layout**
```
┌─────────────────────────────────────────┐
│  ← Back    Form Title                   │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  Field Label                     │  │
│  │  [Input field            ]       │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  Field Label                     │  │
│  │  [Input field            ]       │  │
│  └──────────────────────────────────┘  │
│                                         │
├─────────────────────────────────────────┤
│               [Cancel]  [Submit]        │
└─────────────────────────────────────────┘
```

**List/Detail Layout**
```
┌─────────────────────────────────────────┐
│  Header                                 │
├───────────────────┬─────────────────────┤
│  List Item 1      │                     │
│  List Item 2  ◀───│  Detail View        │
│  List Item 3      │                     │
│  List Item 4      │  Content shows      │
│  List Item 5      │  selected item      │
│                   │                     │
└───────────────────┴─────────────────────┘
```

### Responsive Behavior

**Mobile (< 768px)**
- Sidebar collapses to hamburger menu
- Cards stack vertically (1 column)
- Tables scroll horizontally or transform to cards
- Reduce padding and spacing by 25-50%

**Tablet (768px - 1024px)**
- Sidebar may collapse or reduce width
- 2-column card layouts
- Maintain readable spacing

**Desktop (> 1024px)**
- Full sidebar visible
- 3-4 column card layouts
- Maximize screen real estate while maintaining readability

---

## 8. Motion & Animation

### Transition Durations

```css
instant:   0ms     // Immediate feedback (checkbox, toggle)
fast:      150ms   // Quick interactions (hover, ripple)
normal:    300ms   // Standard transitions (modals, dropdowns)
slow:      500ms   // Emphasis animations (page transitions)
very-slow: 700ms   // Special effects (onboarding, celebrations)
```

### Easing Functions

```css
/* Use case-specific easing */
ease-in:       cubic-bezier(0.4, 0, 1, 1)      // Decelerate (entering)
ease-out:      cubic-bezier(0, 0, 0.2, 1)      // Accelerate (exiting)
ease-in-out:   cubic-bezier(0.4, 0, 0.2, 1)    // Smooth both ends (default)
ease-bounce:   cubic-bezier(0.68, -0.55, 0.265, 1.55)  // Playful (success states)
ease-elastic:  cubic-bezier(0.68, -0.55, 0.265, 1.35)  // Attention-grabbing
```

### Animation Use Cases

**Hover Effects**
```css
button:hover {
  transition: background-color 150ms ease-out;
  background-color: var(--blue-600);
}
```
- Duration: `150ms`
- Easing: `ease-out`
- Properties: `background-color`, `border-color`, `color`

**Focus States**
```css
input:focus {
  transition: border-color 150ms ease-out, box-shadow 150ms ease-out;
  border-color: var(--blue-500);
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
}
```
- Duration: `150ms`
- Easing: `ease-out`
- Immediate visual feedback

**Modal Entry/Exit**
```css
/* Entry */
.modal-enter {
  opacity: 0;
  transform: scale(0.95);
}
.modal-enter-active {
  opacity: 1;
  transform: scale(1);
  transition: opacity 300ms ease-out, transform 300ms ease-out;
}

/* Exit */
.modal-exit {
  opacity: 1;
  transform: scale(1);
}
.modal-exit-active {
  opacity: 0;
  transform: scale(0.95);
  transition: opacity 200ms ease-in, transform 200ms ease-in;
}
```

**Loading States**
```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spinner {
  animation: spin 1s linear infinite;
}
```

**Page Transitions**
```css
.page-transition {
  transition: opacity 300ms ease-in-out, transform 300ms ease-in-out;
}

.page-exit {
  opacity: 1;
  transform: translateX(0);
}
.page-exit-active {
  opacity: 0;
  transform: translateX(-30px);
}

.page-enter {
  opacity: 0;
  transform: translateX(30px);
}
.page-enter-active {
  opacity: 1;
  transform: translateX(0);
}
```

**Success Celebrations**
```css
@keyframes celebrate {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.success-animation {
  animation: celebrate 500ms ease-bounce;
}
```

### Animation Principles

**Performance**
- Only animate `transform` and `opacity` for best performance
- Avoid animating `width`, `height`, `top`, `left` (triggers layout)
- Use `will-change` sparingly for complex animations

**Accessibility**
- Respect `prefers-reduced-motion` media query
- Reduce or disable animations for users with motion sensitivity
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Guidelines**
- Keep animations subtle and purposeful
- Faster on exit, slower on entry
- Use motion to guide attention and provide feedback
- Never delay critical interactions with animation

---

## 9. Accessibility Guidelines

### Color Contrast Requirements

**WCAG AA Compliance (Minimum)**
- Normal text (< 18px / < 14px bold): **4.5:1**
- Large text (≥ 18px / ≥ 14px bold): **3:1**
- UI components & graphics: **3:1**

**WCAG AAA Compliance (Enhanced)**
- Normal text: **7:1**
- Large text: **4.5:1**

**Testing Tools**
- WebAIM Contrast Checker
- Browser DevTools color picker (shows contrast ratio)
- Axe DevTools browser extension

### Keyboard Navigation

**Tab Order**
- Logical tab sequence following visual flow
- All interactive elements must be keyboard accessible
- Skip links for bypassing repeated content

**Focus Indicators**
- Always visible: `2px solid blue-500` outline
- Offset: `2px` for clarity
- Never remove focus styles with `outline: none` without replacement
```css
*:focus-visible {
  outline: 2px solid var(--blue-500);
  outline-offset: 2px;
}
```

**Keyboard Shortcuts**
- `Tab`: Move focus forward
- `Shift + Tab`: Move focus backward
- `Enter`: Activate buttons, links, submit forms
- `Space`: Toggle checkboxes, radio buttons, toggle switches
- `Esc`: Close modals, dropdowns, clear search
- `Arrow keys`: Navigate menus, tabs, radio groups

### Screen Reader Support

**Semantic HTML**
- Use proper heading hierarchy (h1 → h2 → h3)
- Use `<button>` for actions, `<a>` for navigation
- Use `<nav>`, `<main>`, `<aside>`, `<footer>` landmarks

**ARIA Labels**
```html
<!-- Icon-only buttons -->
<button aria-label="Close modal">
  <CloseIcon />
</button>

<!-- Form fields -->
<input type="text" aria-describedby="email-help" />
<span id="email-help">We'll never share your email</span>

<!-- Loading states -->
<div role="status" aria-live="polite" aria-busy="true">
  Loading results...
</div>

<!-- Error messages -->
<span role="alert" aria-live="assertive">
  Password is required
</span>
```

**ARIA Attributes**
- `aria-label`: Provides accessible name for elements
- `aria-describedby`: Links additional descriptive text
- `aria-hidden="true"`: Hides decorative elements from screen readers
- `aria-live`: Announces dynamic content changes
- `aria-expanded`: Indicates collapsible state
- `aria-selected`: Indicates selection in tabs, lists

### Touch Target Sizes

**Minimum Sizes**
- **44px × 44px** (WCAG AAA, iOS)
- **48px × 48px** (Material Design, Android)
- Recommended: **48px × 48px** for all interactive elements

**Spacing**
- Minimum `8px` between touch targets
- Use padding to increase touch area without visual bulk

### Form Accessibility

**Labels**
- Every input must have an associated `<label>`
- Use `for` attribute or wrap input inside label
```html
<label for="email">Email Address</label>
<input id="email" type="email" />
```

**Error Handling**
- Associate errors with inputs using `aria-describedby`
- Use `role="alert"` for critical errors
- Provide clear, actionable error messages
- Mark required fields visually and with `aria-required="true"`

**Validation**
- Inline validation on blur
- Clear success/error indicators
- Don't rely on color alone (use icons + text)

### Visual Considerations

**Text Readability**
- Minimum font size: `14px` (preferably `16px`)
- Line length: 60-80 characters for optimal readability
- Line height: `1.5` for body text, `1.6` for dense content

**Color Independence**
- Never use color as the only means of conveying information
- Pair color with icons, text labels, or patterns
- Good: Red text + X icon + "Error" label
- Bad: Red text only

**Motion Sensitivity**
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### Testing Checklist

- [ ] All text meets contrast ratios
- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible and clear
- [ ] Tab order is logical
- [ ] Screen reader announces all content correctly
- [ ] Forms properly labeled and validated
- [ ] Touch targets meet minimum size
- [ ] Content readable without color
- [ ] Animations respect motion preferences
- [ ] ARIA attributes used correctly

---

## 10. Implementation Guide

### Tailwind CSS Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary palette
        blue: {
          50: '#E3F2FD',
          100: '#BBDEFB',
          200: '#90CAF9',
          300: '#64B5F6',
          400: '#42A5F5',
          500: '#1976D2',
          600: '#1565C0',
          700: '#0D47A1',
          800: '#0A3D91',
          900: '#072C6F',
        },
        // Subject colors
        math: {
          50: '#FFEBEE',
          500: '#E53935',
          700: '#C62828',
        },
        science: {
          50: '#E8F5E9',
          500: '#43A047',
          700: '#2E7D32',
        },
        english: {
          50: '#E8EAF6',
          500: '#5E35B1',
          700: '#4527A0',
        },
        // Semantic colors
        success: {
          50: '#E8F5E9',
          500: '#2E7D32',
          700: '#1B5E20',
        },
        warning: {
          50: '#FFF3E0',
          500: '#ED6C02',
          700: '#E65100',
        },
        error: {
          50: '#FFEBEE',
          500: '#D32F2F',
          700: '#C62828',
        },
        info: {
          50: '#E3F2FD',
          500: '#0288D1',
          700: '#01579B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        body: ['Open Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.4' }],
        'sm': ['0.875rem', { lineHeight: '1.5' }],
        'base': ['1rem', { lineHeight: '1.6' }],
        'lg': ['1.125rem', { lineHeight: '1.6' }],
        'xl': ['1.25rem', { lineHeight: '1.5' }],
        '2xl': ['1.5rem', { lineHeight: '1.4' }],
        '3xl': ['1.875rem', { lineHeight: '1.3' }],
        '4xl': ['2.25rem', { lineHeight: '1.2' }],
        '5xl': ['3rem', { lineHeight: '1.2' }],
      },
      spacing: {
        '0': '0px',
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '6': '24px',
        '8': '32px',
        '12': '48px',
        '16': '64px',
        '20': '80px',
        '24': '96px',
      },
      borderRadius: {
        'sm': '4px',
        'DEFAULT': '8px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        'full': '9999px',
      },
      boxShadow: {
        'sm': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'DEFAULT': '0 4px 12px rgba(0, 0, 0, 0.1)',
        'md': '0 4px 12px rgba(0, 0, 0, 0.1)',
        'lg': '0 8px 24px rgba(0, 0, 0, 0.15)',
        'xl': '0 20px 60px rgba(0, 0, 0, 0.3)',
      },
      transitionDuration: {
        'fast': '150ms',
        'normal': '300ms',
        'slow': '500ms',
      },
    },
  },
  plugins: [],
};
```

### CSS Variables for Theming

```css
/* styles/variables.css */
:root {
  /* Colors */
  --color-primary: #1976D2;
  --color-primary-dark: #1565C0;
  --color-primary-light: #E3F2FD;
  
  --color-success: #2E7D32;
  --color-warning: #ED6C02;
  --color-error: #D32F2F;
  --color-info: #0288D1;
  
  --color-text-primary: #212121;
  --color-text-secondary: #616161;
  --color-text-disabled: #9E9E9E;
  
  --color-bg-page: #FAFAFA;
  --color-bg-card: #FFFFFF;
  --color-bg-elevated: #FFFFFF;
  
  --color-border: #E0E0E0;
  --color-divider: #EEEEEE;
  
  /* Spacing */
  --spacing-unit: 8px;
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* Typography */
  --font-family-primary: 'Inter', sans-serif;
  --font-family-body: 'Open Sans', sans-serif;
  --font-family-mono: 'JetBrains Mono', monospace;
  
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.5rem;
  --font-size-2xl: 2rem;
  
  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.15);
  
  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;
  
  /* Transitions */
  --transition-fast: 150ms ease-out;
  --transition-normal: 300ms ease-out;
  --transition-slow: 500ms ease-out;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --color-primary: #90CAF9;
    --color-primary-dark: #42A5F5;
    --color-primary-light: #1E1E1E;
    
    --color-text-primary: #FFFFFF;
    --color-text-secondary: #BDBDBD;
    --color-text-disabled: #757575;
    
    --color-bg-page: #121212;
    --color-bg-card: #1E1E1E;
    --color-bg-elevated: #2C2C2C;
    
    --color-border: #424242;
    --color-divider: #2C2C2C;
  }
}
```

### Component Library Structure

```
src/
├── components/
│   ├── ui/                    # Reusable UI components
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   └── Button.stories.tsx
│   │   ├── Input/
│   │   ├── Card/
│   │   ├── Badge/
│   │   └── ...
│   ├── forms/                 # Form-specific components
│   │   ├── TextField/
│   │   ├── Select/
│   │   ├── Checkbox/
│   │   └── ...
│   ├── layout/                # Layout components
│   │   ├── Container/
│   │   ├── Grid/
│   │   ├── Sidebar/
│   │   └── ...
│   └── feedback/              # Feedback components
│       ├── Alert/
│       ├── Toast/
│       ├── Modal/
│       └── ...
├── styles/
│   ├── variables.css          # CSS variables
│   ├── globals.css            # Global styles
│   └── utilities.css          # Utility classes
├── theme/
│   ├── colors.ts              # Color definitions
│   ├── typography.ts          # Typography scale
│   ├── spacing.ts             # Spacing scale
│   └── index.ts               # Theme exports
└── hooks/
    ├── useTheme.ts            # Theme management
    └── useMediaQuery.ts       # Responsive utilities
```

### Naming Conventions

**Component Files**
- PascalCase: `Button.tsx`, `TextField.tsx`
- Co-located tests: `Button.test.tsx`
- Storybook stories: `Button.stories.tsx`

**CSS Classes** (BEM methodology)
```css
/* Block */
.button { }

/* Element */
.button__icon { }
.button__text { }

/* Modifier */
.button--primary { }
.button--large { }
.button--disabled { }
```

**Tailwind Utility Classes**
```html
<!-- Follow consistent order: layout → spacing → typography → colors → effects -->
<button class="flex items-center px-6 py-3 text-base font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600">
  Submit
</button>
```

**TypeScript Interfaces**
```typescript
// Component props
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

// Theme types
interface ThemeColors {
  primary: ColorScale;
  success: ColorScale;
  warning: ColorScale;
  error: ColorScale;
  info: ColorScale;
}

interface ColorScale {
  50: string;
  100: string;
  // ... up to 900
}
```

### Example Component Implementation

```typescript
// components/ui/Button/Button.tsx
import React from 'react';
import clsx from 'clsx';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  onClick,
  children,
  className,
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 disabled:bg-gray-300',
    secondary: 'border-2 border-blue-500 text-blue-500 hover:bg-blue-50 active:bg-blue-100 disabled:border-gray-300 disabled:text-gray-400',
    ghost: 'text-blue-500 hover:bg-blue-50 active:bg-blue-100 disabled:text-gray-400',
  };
  
  const sizeClasses = {
    small: 'px-5 py-2.5 text-sm min-h-[36px]',
    medium: 'px-6 py-3 text-base min-h-[44px]',
    large: 'px-7 py-3.5 text-lg min-h-[48px]',
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      aria-busy={loading}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};
```

---

## Conclusion

This design system provides a comprehensive foundation for building a consistent, accessible, and scalable Student Assessment Platform. By following these guidelines, designers and developers can create cohesive user experiences across student and admin interfaces.

**Key Takeaways:**
- **Consistency:** Use defined colors, typography, spacing, and components throughout
- **Accessibility:** Meet WCAG AA standards minimum, strive for AAA where possible
- **Flexibility:** Design system accommodates both light and dark modes
- **Scalability:** Component-based architecture supports growth and customization
- **User-Focused:** Separate consideration for student (friendly, encouraging) and admin (efficient, data-focused) interfaces

**Next Steps:**
1. Implement component library based on this system
2. Create Storybook documentation for all components
3. Conduct accessibility audit and testing
4. Gather user feedback and iterate on designs
5. Establish design review process for new features

**Maintenance:**
- Review and update quarterly
- Version control design system changes
- Document breaking changes and migration guides
- Collect feedback from development team and end-users

---

**Version History:**
- v1.0.0 (July 2026): Initial release

**Contributors:**
Design System Team, UX Research Team, Accessibility Team, Development Team

**Resources:**
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Material Design](https://material.io/design)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Accessibility](https://reactjs.org/docs/accessibility.html)

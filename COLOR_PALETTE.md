# Cybermate Mastery Color Palette

## Quick Reference

### Background Colors
```
Navy 950 (Main BG)     #0f1729  rgb(15, 23, 41)    hsl(222, 47%, 11%)
Navy 900 (Cards)       #1a2235  rgb(26, 34, 53)    hsl(222, 45%, 15%)
Navy 800 (Secondary)   #293548  rgb(41, 53, 72)    hsl(222, 43%, 20%)
Navy 700 (Borders)     #3f4b5f  rgb(63, 75, 95)    hsl(222, 40%, 28%)
```

### Accent Colors - Purple (Primary Brand)
```
Purple 600 (Primary)   #a855f7  rgb(168, 85, 247)  hsl(271, 91%, 65%)
Purple 700 (Hover)     #9333ea  rgb(147, 51, 234)  hsl(271, 81%, 56%)
```

### Accent Colors - Cyan (Secondary Brand)
```
Cyan 400 (Highlight)   #22d3ee  rgb(34, 211, 238)  hsl(189, 94%, 63%)
Cyan 500 (Active)      #06b6d4  rgb(6, 182, 212)   hsl(189, 94%, 53%)
```

### Text Colors
```
White (Primary)        #ffffff  rgb(255, 255, 255)
Gray 300 (Body)        #d1d5db  rgb(209, 213, 219)
Gray 400 (Secondary)   #9ca3af  rgb(156, 163, 175)
Gray 500 (Muted)       #6b7280  rgb(107, 114, 128)
Gray 700 (Dividers)    #374151  rgb(55, 65, 81)
```

### Utility Colors
```
Green 400 (Success)    #4ade80  rgb(74, 222, 128)
Yellow 400 (Stars)     #facc15  rgb(250, 204, 21)
```

---

## Usage Examples

### Hero Section
- Background: Navy 950 gradient
- Headline: White
- Subhead: Gray 300
- Badge: Purple 600/20 opacity background, Cyan 400 text
- CTA: Purple 600 → Purple 500 gradient

### Feature Cards
- Background: Navy 900 → Navy 950 gradient
- Border: Gray 800 (default), Purple 500/50 (hover)
- Icon container: Purple 600 → Purple 500 gradient
- Title: White
- Description: Gray 400

### Testimonial Cards
- Background: Navy 900 → Navy 950 gradient
- Border: Gray 800
- Avatar: Purple 600 → Purple 400 gradient
- Name: White
- Title: Gray 400
- Quote: Gray 300

### Trust Badges
- Background: Purple 600/30 opacity
- Border: Purple 500/50 opacity
- Icon: Purple 400 or Cyan 400
- Text: White

---

## Gradient Combinations

### Primary Gradient (CTAs)
```css
background: linear-gradient(to right, #a855f7, #9f50e8, #a855f7);
/* Tailwind: from-purple-600 via-purple-500 to-purple-600 */
```

### Secondary Gradient (Icons, Badges)
```css
background: linear-gradient(to right, #06b6d4, #22d3ee);
/* Tailwind: from-cyan-500 to-cyan-400 */
```

### Text Gradient (Headlines)
```css
background: linear-gradient(to right, #c084fc, #d8b4fe, #22d3ee);
background-clip: text;
/* Tailwind: from-purple-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent */
```

### Background Gradient (Sections)
```css
background: linear-gradient(to bottom, #0f1729, #1a2235, #0f1729);
/* Tailwind: from-[#0f1729] via-[#1a2235] to-[#0f1729] */
```

---

## Accessibility

### Contrast Ratios (WCAG AA Compliant)
- White on Navy 950: 15.8:1 ✓
- Gray 300 on Navy 950: 10.2:1 ✓
- Purple 600 on Navy 950: 5.1:1 ✓
- Cyan 400 on Navy 950: 6.8:1 ✓

### Usage Guidelines
- Always use White (#ffffff) for primary headings
- Use Gray 300 (#d1d5db) for body text on dark backgrounds
- Purple 600 and Cyan 400 have sufficient contrast for buttons and badges
- Avoid Gray 500 or darker for body text (fails contrast requirements)

---

## Figma/Design Tool Values

### Tailwind Color Names
```
bg-[#0f1729]    - Navy 950
bg-[#1a2235]    - Navy 900
text-white      - White
text-gray-300   - Gray 300
text-gray-400   - Gray 400
text-purple-600 - Purple 600
text-cyan-400   - Cyan 400
border-gray-800 - Gray 800
border-purple-500/50 - Purple 500 at 50% opacity
```

### CSS Variables (from globals.css)
```css
--background: 222 47% 11%;        /* Navy 950 */
--card: 222 45% 15%;              /* Navy 900 */
--primary: 271 91% 65%;           /* Purple 600 */
--accent: 189 94% 53%;            /* Cyan 500 */
--foreground: 0 0% 98%;           /* White */
--muted-foreground: 0 0% 70%;    /* Gray 400 */
```

---

## Color Psychology

### Purple (#a855f7)
- **Associations**: Innovation, technology, premium quality, creativity
- **Use case**: Primary brand color, CTAs, emphasizing AI/tech features
- **Emotion**: Trust, sophistication, forward-thinking

### Cyan (#22d3ee)
- **Associations**: Clarity, communication, efficiency, digital
- **Use case**: Secondary highlights, data visualization, success states
- **Emotion**: Energy, precision, modernity

### Dark Navy (#0f1729)
- **Associations**: Professionalism, security, authority, depth
- **Use case**: Primary background, creating premium feel
- **Emotion**: Confidence, stability, seriousness

---

## Print/Export Formats

### Hex Codes (for web)
```
#0f1729  #1a2235  #a855f7  #9333ea  #22d3ee  #06b6d4
```

### RGB Values (for design tools)
```
rgb(15,23,41)    rgb(26,34,53)    rgb(168,85,247)
rgb(147,51,234)  rgb(34,211,238)  rgb(6,182,212)
```

### HSL Values (for CSS)
```
hsl(222,47%,11%)  hsl(222,45%,15%)  hsl(271,91%,65%)
hsl(271,81%,56%)  hsl(189,94%,63%)  hsl(189,94%,53%)
```

---

**Pro Tip**: When in doubt, use Purple for interactive elements (buttons, links, badges) and Cyan for informational elements (stats, icons, highlights).

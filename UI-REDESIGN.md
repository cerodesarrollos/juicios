# UI REDESIGN — Juicios Dashboard

## CRITICAL: Complete visual overhaul. The current dark theme is WRONG.

## Design Reference: "Donezo" style dashboard

### Color Palette
- **Background:** Light warm gray `#F3F4F6` (NOT dark)
- **Cards:** White `#FFFFFF` with `border border-gray-200 rounded-2xl`
- **Primary accent:** Dark green `#166534` (green-800)
- **Primary dark:** `#14532D` (green-900) — for highlighted stat cards, CTAs
- **Text primary:** `#111827` (gray-900)
- **Text secondary:** `#6B7280` (gray-500)
- **Success/Paid:** green-500 `#22C55E`
- **Error/Breach:** red-500 `#EF4444`
- **Warning/Pending:** yellow-500
- **Info/Service:** blue-500

### Layout
- **Sidebar:** White bg, ~220px wide, fixed left
  - Logo "⚖️ Juicios" at top, green icon + bold text
  - Nav items with icons, active = green-50 bg + green-800 text + left border
  - Menu items: Dashboard, Transacciones, Evidencia, Partes, Línea de Tiempo
- **Main area:** Light gray bg, padded content
- **Cards:** White, rounded-2xl, border gray-200, p-5, shadow-sm

### Stats Bar (Top of Dashboard)
- 4 cards in a row: grid-cols-4 gap-4
- First card (Deuda Total): dark green gradient bg (green-800 to green-900), white text
- Other 3 cards: white bg, border gray-200
- Big numbers: text-4xl font-bold
- Labels: text-sm text-gray-500

### Transaction List
- White cards, rounded-xl
- Each row: proof_id badge (green-800 bg, white text, rounded), title, date, amount
- Color-coded status badges:
  - cumplido: green-100 bg, green-700 text
  - incumplido: red-100 bg, red-700 text
  - parcial: yellow-100 bg, yellow-700 text
  - pendiente: gray-100 bg, gray-600 text
- Expandable rows to show evidence slots

### Evidence Page
- Grid of cards, each with file preview (image thumbnail or audio icon)
- Upload area: dashed border, drag & drop
- Status badges per slot

### Parties Page
- Cards per person, showing role badge, linked transactions count
- Role badges: colored pills

### Typography
- Font: Inter (or system sans-serif)
- Headings: text-2xl/3xl font-bold gray-900
- Subtitles: text-sm gray-500
- Body: text-sm gray-700

### DO NOT:
- Use dark background
- Use neon colors
- Make it look like a hacker terminal
- Use gray cards on gray background (use WHITE cards)

### DO:
- Clean, professional, legal-appropriate
- Plenty of white space
- Rounded corners (2xl)
- Subtle shadows
- Clear hierarchy
- Mobile responsive

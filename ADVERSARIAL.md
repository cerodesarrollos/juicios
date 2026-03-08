# Task: Build "Simulación Adversarial" page

## Context
This is a Next.js legal case dashboard (juicios.aidaptive.com.ar). 
We need a new page: Simulación Adversarial — an AI-powered adversarial legal analysis tool.
The system plays both sides of a legal case: prosecution builds the case, defense (AI) tries to tear it down.

## What to build

### 1. Add to Sidebar
In `src/components/Sidebar.tsx`, add a new nav item under the case sub-navigation:
```
⚔️ Simulación Adversarial
```
Link to: `/case/${caseSlug}/adversarial`

### 2. Create the page
Path: `src/app/case/[slug]/adversarial/page.tsx`

### 3. Page Layout (dual panel)
- **Header:** "⚔️ Simulación Adversarial" with case name
- **Split view (desktop: side by side, mobile: stacked):**
  - 🔴 LEFT: "ACUSACIÓN" panel (prosecution/plaintiff)
    - Shows the case arguments, evidence references, applicable legal articles
  - 🔵 RIGHT: "DEFENSA" panel (AI-generated defense)
    - Shows the best possible defense, counterarguments, weak points found
- **Rounds system:**
  - Each round shows: prosecution argument → defense counterargument
  - Score per round (who won that exchange)
  - Legal articles cited (with article number and brief text)
- **Action bar at bottom:**
  - [Iniciar Simulación] — generates Round 1 (reads case data + evidence + legal codes)
  - [Contraargumentar] — text input for manual counter
  - [Auto-round] — system plays both sides automatically
  - [Evaluar Fortaleza] — final strength analysis
- **Score panel (sidebar or bottom):**
  - Global score: Acusación X/10
  - Unresolved points: N
  - Resolved points: N
  - Articles applied: list

### 4. API Route
Create `src/app/api/adversarial/route.ts`
- POST: Accepts case_id, action (init/counter/auto/evaluate), optional user_input
- Uses Claude/GPT to generate arguments
- For now, use a placeholder that returns mock data structure
- The real AI integration will come later

### 5. Types
Add to `src/lib/types.ts`:
```typescript
interface AdversarialRound {
  number: number
  prosecution: {
    argument: string
    evidence_refs: string[]
    legal_articles: string[]
    strength: number // 1-10
  }
  defense: {
    counterargument: string
    evidence_refs: string[]
    legal_articles: string[]
    strength: number // 1-10
  }
  round_winner: 'prosecution' | 'defense' | 'draw'
}

interface AdversarialSession {
  id: string
  case_id: string
  rounds: AdversarialRound[]
  overall_score: {
    prosecution: number
    defense: number
    unresolved_points: number
    resolved_points: number
  }
  status: 'active' | 'completed'
}
```

### 6. Styling
- Match existing dashboard style (green theme, clean, professional)
- Prosecution panel: subtle red accent (border-red-500, bg-red-50)
- Defense panel: subtle blue accent (border-blue-500, bg-blue-50)
- Rounds: alternating cards, clear visual separation
- Score: progress bar or gauge
- Responsive: stack panels on mobile

### 7. Important Notes
- Use existing Supabase connection from `src/lib/supabase.ts`
- Follow patterns from existing pages (ChatPage, DocsPage)
- Keep it professional — this is for lawyers
- NO emojis in the actual UI except the ⚔️ in the title
- Spanish language throughout

When completely finished, run: openclaw system event --text "Done: Simulación Adversarial page built in juicios dashboard" --mode now

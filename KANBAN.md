# 🧠 LO$T$0LZ — Engagement Kanban

**Goal:** turn the site into an *experience people replay and share* — through satisfying feedback loops, novelty, discovery, and reward. Make visitors want to move the mouse, scroll again, and show a friend.

**Guardrails (non-negotiable):** stay 60fps, respect `prefers-reduced-motion` (offer a calm variant, never break it), keep it honest (no fake scarcity / deceptive dark patterns), and always mute-able. Delight > manipulation.

---

### Legend
- **Impact:** 🔥 high · ⚡ medium · ◽ low
- **Effort:** `S` small · `M` medium · `L` large
- **Mechanic (the dopamine lever):** `Feedback` `Novelty` `Reward` `Progress` `Discovery` `FOMO` `Play`

---

## 🟩 Done — already pulling weight
- **Cursor-tracking eyes** that follow you + periodic blink + bloom — the "it's alive / it noticed me" hook. `Feedback`
- **Counter-scrolling marquees** (formats + pipeline) — constant motion keeps the eye moving. `Novelty`
- **Magnetic buttons + custom crosshair cursor** — every hover feels physical. `Feedback`
- **Smooth Lenis scroll + blur-in reveals** — buttery, "expensive" feel. `Feedback`
- **Rotating DesignIO garment** (wireframe→shaded on scroll) — reward for scrolling. `Reward`
- **Count-up stats (50+, 35)** — numbers ticking = tiny hit of progress. `Progress`

---

## 🟨 Next Up — highest ROI, build these first
- **Sound design + mute toggle** — subtle UI blips on hover/click, a low ambient hum, an eye "whoosh." Audio is the single biggest immersion multiplier. Off by default with an obvious 🔊 toggle (respect autoplay rules). `🔥` `M` `Feedback`
- **Click & hover micro-bursts + haptics** — tiny particle burst / ripple on click, `navigator.vibrate` on mobile. Instant tactile payoff on every interaction. `🔥` `S` `Feedback`
- **Draggable / dressable 3D garment** — let people grab and spin the DesignIO gown (and swap fabric/color). Play = time-on-site + "I made that." `🔥` `L` `Play`
- **Live waitlist with position counter** — "You're #1,248 in line for DesignIO." Real number, real email capture. Reward + gentle FOMO + a reason to return. `🔥` `M` `FOMO`
- **Boot / "system online" intro** — a 1.5s HUD power-up sequence on first load (scanlines, "OPTICS CALIBRATED", eyes flicker awake). Anticipation → payoff. Skippable, once per session. `⚡` `M` `Reward`

---

## 🟧 In Progress
_(empty — pull from Next Up)_

---

## 🟦 Backlog — idea pool
### Discovery / secrets (high shareability)
- **Konami-code / triple-click the eyes** unlocks a hidden scene (eyes go red, "INTRUDER DETECTED", a secret garment). Screenshot-bait. `⚡` `M` `Discovery`
- **Hidden easter eggs** — click the logo 5×, hover the tagline, type "lost" — each does something small and delightful. `◽` `M` `Discovery`
- **Micro-copy rewards** — occasional "Nice.", "You found it.", "Keep going." on interaction. `◽` `S` `Reward`

### Feedback / juice
- **Cursor trail** — faint cyan particle wake following the crosshair. `⚡` `S` `Feedback`
- **Section "scan" transitions** — a glitch/scanline sweep as each section enters. `⚡` `M` `Novelty`
- **CTA confetti/spark burst** on "Get in touch" / waitlist submit. `⚡` `S` `Reward`
- **Button press physics** — springy squash/scale on click. `◽` `S` `Feedback`

### Progress / return
- **Scroll-progress scan line** + "sections discovered" ticks up the side. `⚡` `S` `Progress`
- **"Explored 100%" achievement toast** when they reach the footer. `⚡` `M` `Reward`
- **Remember return visitors** — "Welcome back" + restore scroll depth; eyes greet them. `◽` `M` `Reward`

### Novelty (fresh every visit)
- **Randomized eye mood/color** per visit (cyan / violet / amber) — no two loads identical. `⚡` `S` `Novelty`
- **Day/night state** — by local time the eyes "sleep" (half-lidded, dim) or are wide awake. `◽` `M` `Novelty`
- **Gyroscope parallax on mobile** — tilt the phone, the eyes + particles shift. `⚡` `M` `Play`

### Social proof / loop
- **"◉ N designers exploring now"** live-ish presence counter (real via a tiny KV, not faked). `⚡` `M` `FOMO`
- **Shareable OG per view** — "Share your calibration" generates a custom eye-banner image. `◽` `L` `Discovery`

### Craft / must-not-break
- **Perf budget guardrail** — profile FPS; engagement dies the instant it janks. `🔥` `M` `—`
- **Reduced-motion calm mode** — a tasteful low-motion variant of every effect above (not just "off"). `🔥` `M` `—`
- **Mobile-first pass** — touch equivalents for every hover/magnetic effect. `⚡` `M` `—`

---

## Suggested first sprint
1. Click/hover micro-bursts + haptics (`S`, instant win)
2. Sound design + mute toggle (`M`, biggest immersion jump)
3. Live waitlist + position counter (`M`, captures leads while it hooks)
4. Boot "system online" intro (`M`, sets the tone on load)

> Tip: ship #1 and #2 together — audio + tactile feedback compound. Then #3 gives the dopamine a *purpose* (get on the list).

# 🧠 LO$T$0LZ — Engagement Kanban · "out-engineer the Valley"

**Mission:** make lostsoulz.vercel.app an *experience people replay, screenshot, and send to a friend.* Every pixel should reward attention. 30 concrete todos below — each one specific enough to start today.

**Guardrails (never break):** 60fps or it doesn't ship · respect `prefers-reduced-motion` with a real *calm* variant (not just "off") · audio **off by default**, one-tap mute always visible · social proof must be **real** (no faked counters) · delight over manipulation.

### Legend
**Impact** 🔥 high · ⚡ med · ◽ low   |   **Effort** `S`/`M`/`L`   |   **Lever** `Feedback` `Reward` `Progress` `Play` `Novelty` `Discovery` `FOMO` `Social`

---

## 🟩 Done — already hooking
- Cursor-tracking eyes + blink + bloom · counter-scrolling marquees · magnetic buttons · custom crosshair cursor · Lenis smooth scroll + blur reveals · scroll-scrubbed rotating garment · count-up stats.

## 🟧 In Progress
_(pull from Next Up →)_

---

## 🟨 Next Up — Sprint 1 (audio + touch + a reason to stay)
- [x] **T01 · Web Audio UI sound engine** ✅ live — new `src/core/audio.ts`: a tiny synth (OscillatorNode + gain envelope) for hover blip, click tick, eye "whoosh," success chime. Master `GainNode`, `mute` persisted to `localStorage`, unlock on first pointerdown (autoplay policy). Wire into `cursor.ts` + buttons. `🔥` `M` `Feedback`
- [x] **T02 · Click micro-burst + haptics** ✅ live — on pointerdown, spawn a short-lived Three.js `InstancedMesh` spark burst at the cursor (reuse the hero renderer / a lightweight overlay canvas) + `navigator.vibrate(8)` on touch. Every tap pays out. `🔥` `S` `Feedback`
- [x] **T03 · Boot / "OPTICS ONLINE" intro** ✅ live — first-load HUD power-up (~1.6s): scanline wipe, mono readout "CALIBRATING OPTICS… ONLINE", eyes flicker awake, then content fades in. Skippable, once per session via `sessionStorage`. `⚡` `M` `Reward`
- [x] **T04 · Live waitlist + queue position** ✅ live — email field → Redis (Vercel Marketplace) counter via `api/waitlist.ts` (node-redis) → "You're **#N** in line." Atomic INCR + SADD dedupe, confetti on submit. Real number, real capture; store flushed for a clean #1 launch. `🔥` `M` `FOMO`
- [x] **T05 · Scroll-progress scan-line** ✅ live — fixed side rail with a cyan fill + `%` readout + a tick that "locks" as each section passes (IntersectionObserver). Progress you can feel. `⚡` `S` `Progress`
- [x] **T06 · "Explored 100%" achievement + confetti** ✅ live — reaching the footer fires a toast + particle burst; persists to `localStorage` so it only celebrates once. `⚡` `S` `Reward`

---

## 🟦 Backlog

### Feedback / juice
- [ ] **T07 · Cursor comet trail** — additive fading particle wake behind the crosshair (WebGL points or 2D canvas), throttled to rAF. `⚡` `S` `Feedback`
- [ ] **T08 · Magnetic everything** — extend `data-magnetic` to nav links, chips, and cards with springy GSAP `quickTo` return + subtle scale. `⚡` `S` `Feedback`
- [ ] **T09 · Button squash physics** — pointerdown → GSAP scale(0.94)/skew, spring back on release; pair with T01 tick. `◽` `S` `Feedback`
- [ ] **T10 · Heading decode-on-reveal** — reusable text-scramble util; headings decrypt char-by-char as they enter view. `⚡` `M` `Novelty`
- [ ] **T11 · Section "scan" transitions** — View Transitions API (fallback: GLSL scanline sweep) when jumping between anchors. `⚡` `M` `Novelty`
- [ ] **T12 · Scroll-velocity reactive post-fx** — map scroll speed → bloom strength + a touch of chromatic aberration in the hero composer. Fast scroll feels *fast*. `⚡` `M` `Feedback`

### Play / interactive 3D
- [x] **T13 · Draggable garment** ✅ live — drag to spin the DesignIO gown (pointer delta → `rotation.y`) with inertia + snap-back; disables scroll-scrub while dragging. `🔥` `M` `Play`
- [x] **T14 · Fabric/color swatcher** ✅ live — swatch row re-drapes the gown live (swap `MeshStandardMaterial` color/roughness/sheen) with a material-morph tween + sound. `🔥` `M` `Play`
- [ ] **T15 · Eyes "look where you click"** — global click → eyes saccade to the point (fast lerp + overshoot) + sonar ping ring + T01 whoosh. `⚡` `S` `Feedback`
- [ ] **T16 · Pointer force-field particles** — hero particle field repels/attracts around the cursor (add pointer uniform + force in `particles.vert`). `⚡` `M` `Play`
- [ ] **T17 · Gyro parallax (mobile)** — `DeviceOrientationEvent` (with iOS permission prompt) tilts eyes + particles + camera. `⚡` `M` `Play`
- [ ] **T18 · "Calibrate your optics" toy** — two draggable sliders that focus/converge the eyes; hitting "locked" pays out a chime + unlock. `◽` `M` `Play`

### Novelty / personalization (fresh every visit)
- [ ] **T19 · Randomized eye palette per visit** — seeded pick (cyan/violet/amber/crimson) applied to iris + glow uniforms; persist per session. `⚡` `S` `Novelty`
- [ ] **T20 · Day/night optics** — by local time the eyes go half-lidded + dim + slower ambient at night, wide + bright by day. `◽` `M` `Novelty`
- [ ] **T21 · Generative visitor "sigil"** — procedural emblem seeded by a random visitor id (shown in a corner HUD chip); becomes the share artifact in T28. `⚡` `M` `Novelty`
- [ ] **T22 · Idle "the site notices you left"** — after ~20s idle the eyes drift, search, then "spot" you again on the next move. `◽` `S` `Novelty`

### Progress / return loop
- [ ] **T23 · Trophy system + panel** — small toasts for milestones (found a secret, dressed the gown, calibrated); a hidden trophies drawer, persisted. `⚡` `M` `Reward`
- [ ] **T24 · Return-visitor greeting** — `localStorage` "welcome back," restore last scroll depth, eyes greet with a blink + chime. `◽` `M` `Reward`
- [ ] **T25 · Visit streak** — track visit dates; "3-day streak → unlock a hidden colorway." `◽` `M` `FOMO`

### Discovery / ARG (the shareable, "more-than-SV" layer)
- [x] **T26 · Konami → INTRUDER mode** ✅ live — code (or triple-click an eye) flips eyes red, glitches the HUD, reveals a hidden garment + trophy. Screenshot bait. `⚡` `M` `Discovery`
- [x] **T27 · Backtick terminal** ✅ live — press `` ` `` to open a fake HUD console: `help`, `about`, `unlock`, `matrix`, `sudo forge`. Commands trigger effects/easter eggs. `⚡` `M` `Discovery`
- [ ] **T28 · Shareable generated card** — render the visitor's current eye/sigil state to a canvas → downloadable/shareable "MY CALIBRATION" image with the URL baked in. Built-in virality. `⚡` `L` `Discovery`
- [x] **T29 · Multi-step easter-egg hunt** ✅ live — 3 hidden triggers across sections; finding all opens a secret "VAULT" 3D scene + a real reward (early-access code). `⚡` `L` `Discovery`

### Social / craft
- [ ] **T30 · Live presence counter** — "◉ **N** exploring now" via Vercel KV + a 15s heartbeat serverless route; real concurrency, never faked. `⚡` `M` `Social`

---

## Recommended Sprint 1 (ship together)
**T01 + T02 + T05 + T06 + T03 + T04.** Audio + tactile feedback compound (T01/T02), progress + achievement give the loop a spine (T05/T06), the boot sequence sets the tone (T03), and the waitlist (T04) turns all that dopamine into captured leads. Then redeploy and watch session time climb.

> North-star metric: **median session duration** and **scroll-to-footer rate**. If a feature doesn't move one of those (or shares/waitlist signups), cut it.

---

## 🛰 SPRINT 2 — "Futuristic / Dopamine Max"
Way more futuristic, way more dopamine. Building straight down this list, shipping per card.

- [x] **F5 · Live "◉ N exploring now"** ✅ live — real concurrent-visitor count via `api/presence.ts` (node-redis, sorted-set heartbeat, 30s prune) + a pulsing HUD readout. Real social proof, never faked. `🔥` `M` `Social`
- [ ] **F2 · Comet cursor trail + target-lock reticle** — additive particle trail behind the crosshair; over interactive elements it snaps into a rotating 4-corner "LOCK" bracket. `🔥` `S` `Feedback`
- [ ] **F3 · Scroll-warp** — fast scroll ramps hero bloom + a chromatic-aberration/scanline overlay + per-section scan wipes. Scrolling feels like warping. `⚡` `M` `Feedback`
- [ ] **F1 · Audio-reactive ambient + reactive eyes** — an evolving synth pad (when unmuted) + an AnalyserNode drives the eyes' bloom/pulse/particles. The site breathes to sound. `🔥` `M` `Feedback`
- [ ] **F7 · Holographic depth** — mouse + gyro tilt-parallax on layered elements + a faint CRT scanline/RGB-fringe overlay. The page reads like a projected hologram. `⚡` `M` `Novelty`
- [ ] **F4 · Idle ATTRACT MODE** — after ~18s idle, a self-playing arcade demo: wandering eyes, auto-spinning garment cycling fabrics, streaming telemetry. Any input exits. `⚡` `M` `Novelty`
- [ ] **F6 · Shareable "MY CALIBRATION" card** — a generative per-visitor optic-sigil rendered to a 1080×1350 share image with the vault code → download / native share. Built-in virality. `⚡` `L` `Discovery`

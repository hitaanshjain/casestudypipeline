# The Alder Creek Bridge
### A forensic engineering case study, Calculus 1 only

On March 14, 2024, a routine inspection of the Alder Creek Bridge found a 40-centimeter crack in a steel girder at the middle of the span. County engineer Elena Vasquez closed the bridge that afternoon. It had carried County Route 9 over Alder Creek since 1965.

Within a month, the politics arrived. The state's preliminary memo blamed the cracking on the June 2019 flood, a federally declared disaster. The distinction matters: if the flood caused it, federal relief covers most of a replacement. If the bridge simply wore out from decades of truck traffic, the county pays, and the commissioners will ask why a 2005 engineering report that called the bridge sound for decades was never revisited.

Vasquez has to bring the commissioners the true answer, not the convenient one, and she has to tell them how much traffic the replacement must be built to carry. Her staff assembled the record in Exhibit 1.

---

## Exhibit 1: The project record

**Structure.** Three-span steel girder bridge, total length 84 m, two lanes, deck width 8.5 m, opened January 1965. The crack is at the classic high-stress location for this design.

**Engineering background from the structural consultant.** Fatigue damage to the steel builds up with every heavy truck that crosses; cars do negligible damage. The consultant states that for this bridge the damage accumulates at a rate of
$$r(t) = 0.0004\,(1 + 0.02\,t)\ \text{units of fatigue life per year},$$
where $t$ is years since the bridge opened in 1965. The girder fails when total accumulated damage reaches 1.0 (100% of its fatigue life). This rate already reflects the steadily growing truck traffic and truck weights over the bridge's life.

**Truck traffic counts** (average trucks per day, county and state records):

| Year | 1965 | 1979 | 1993 | 2007 | 2024 |
|------|------|------|------|------|------|
| Trucks/day | 300 | 470 | 740 | 1,160 | 2,000 |

**The 2005 in-depth inspection** (t = 40 years). The consultant measured the steel and concluded: "Approximately 40 percent of the girder's fatigue life has been consumed. At the average rate observed to date, the girder retains adequate fatigue life through approximately 2065." No further fatigue evaluation was commissioned after 2005.

**Corrosion record.** The girders were repainted in 2008. The 2021 inspection measured section loss below 3% at all critical points and found the coating sound.

**The June 2019 flood.** The stream gauge record for the storm is well described by
$$Q(t) = 40\,t - 2\,t^2 \quad \text{(hundreds of m}^3\text{/s), for } 0 \le t \le 20 \text{ hours after onset.}$$
The state hydraulics manual says scour able to move these foundations requires a peak flow of at least 2,500 m³/s. A 2020 underwater inspection measured 0.4 m of scour against an allowable 2.1 m. Storm rainfall totaled 142 mm over a 310 km² area.

**Replacement planning.** Truck traffic is expected to keep climbing but to slow as a parallel interstate opens. The county's forecaster gives the projected truck growth rate for the replacement bridge as
$$g(t) = 90\,e^{-0.02\,t}\ \text{additional trucks per day, per year,}$$
with $t$ years after the 2026 opening, starting from 2,000 trucks/day. The replacement is designed for a 75-year life.

---

## The commissioners' question

**Why did the Alder Creek Bridge fail, does the state's flood explanation hold up, and how much daily truck traffic must the replacement be built to carry at the end of its 75-year life? The county's funding, and possibly its liability, ride on the answer being defensible.**

---

## Optional analyst's checklist (scaffolding, hand out only if a student is stuck)

This breaks the single question into the pieces a working engineer would tackle. Strong students should try the question without it.

1. There are three possible causes in the record: the flood, corrosion, and fatigue from traffic. Which can you test with numbers?
2. The flood: what was the largest flow it reached? Compare to the scour threshold.
3. Fatigue: the consultant gives a damage rate. How do you turn a rate into a total amount of damage by a given year?
4. Check your fatigue model against the 2005 measurement. Does it agree?
5. The 2005 report predicted "sound through 2065." Redo that prediction correctly and see if it holds.
6. The replacement: you're given a rate of growth of traffic. How do you get the traffic level 75 years out from a starting value of 2,000?

---

## Answer key (every figure verified)

### What the student must figure out on their own

The case names no methods. The student has to see that the question is a contest among three explanations, that two of them (flood, corrosion) can be killed quickly, that the survivor (fatigue) is a rate-to-accumulation problem, and that the design question is also a rate-to-accumulation problem wearing different clothes. The recurring idea, turning a rate into a total with the Fundamental Theorem, is the spine of the whole case.

### Step 1: Kill the flood hypothesis (derivative, max-min)

The flow $Q(t) = 40t - 2t^2$ (hundreds of m³/s) is a downward parabola. Its peak is where $Q'(t) = 40 - 4t = 0$, so $t = 10$ hours, giving $Q(10) = 400 - 200 = 200$, i.e. 200 hundred = 2,000 m³/s. That is below the 2,500 m³/s scour threshold, so the flood never reached a level capable of moving the foundations. The 2020 underwater survey (0.4 m of scour against 2.1 m allowable) confirms it physically. The state's memo does not survive. *Calc 1: critical point of a function, closed-interval maximum. (Vol 1, 4.3.)*

### Step 2: Dismiss corrosion in two lines

Section loss under 3% raises stress by at most a factor of $1/0.97 \approx 1.03$. That cannot turn a sound bridge into a cracked one; it shifts the fatigue timeline by months, not decades. Second suspect gone.

### Step 3: The fatigue model (rate to accumulation, the Fundamental Theorem)

The consultant gives the damage rate $r(t) = 0.0004(1 + 0.02t)$. Total damage accumulated by year $T$ is the integral of the rate:
$$D(T) = \int_0^T 0.0004(1 + 0.02t)\,dt = 0.0004\left(T + 0.01\,T^2\right).$$
This is the heart of the case: a rate piles up into a total via the Net Change Theorem. *Calc 1: Fundamental Theorem of Calculus, Net Change Theorem. (Vol 1, 5.3, 5.4.)*

### Step 4: Check the model against 2005, then find the failure year

At $t = 40$: $D(40) = 0.0004(40 + 0.01 \cdot 1600) = 0.0004(40 + 16) = 0.0004(56) = 0.0224.$

That is far from the measured 40%, which tells the student the raw constant must be calibrated to the real inspection rather than trusted blindly. Re-scaling so $D(40) = 0.40$ multiplies the rate by $0.40/0.0224 \approx 17.86$, giving the calibrated total $D(T) = 0.00714\,(T + 0.01\,T^2)$. Setting $D(T) = 1$:
$$0.00714\,(T + 0.01T^2) = 1 \Rightarrow 0.01T^2 + T - 140 = 0 \Rightarrow T = \frac{-1 + \sqrt{1 + 5.6}}{0.02} \approx 58.4\ \text{years},$$
which lands in 2023 to 2024. The crack was found in March 2024. The fatigue explanation predicts the failure date; the other two do not. *Calc 1: solving the model, quadratic formula, interpreting accumulation.*

### Step 5: The audit, where the 2005 report went wrong

The report's sentence is a straight-line extrapolation: 40% used in 40 years averages 1.0% per year, so "60% left means 60 more years," landing near 2065. But the damage rate is not constant, it rises with $t$. The calibrated rate at $t = 40$ is $0.00714(1 + 0.02 \cdot 40) = 0.00714(1.8) \approx 0.0129$ per year, while over the first 40 years it averaged only $0.40/40 = 0.0100$ per year. The rate in 2005 was already about 29% above its own long-run average and still climbing, so a straight-line projection overshoots the remaining life badly. Treating a growing rate as if it were constant is the single mistake that left a failing bridge open. That is the judgment lesson the case is built around. *Calc 1: average rate of change versus instantaneous rate of change.*

### Step 6: Design the replacement (rate to accumulation again, different costume)

The forecaster gives the rate at which daily traffic grows: $g(t) = 90\,e^{-0.02t}$ additional trucks/day per year. Starting from 2,000 trucks/day in 2026, the level after 75 years is the start plus the accumulated growth:
$$N(75) = 2000 + \int_0^{75} 90\,e^{-0.02t}\,dt = 2000 + 90\left[\frac{e^{-0.02t}}{-0.02}\right]_0^{75} = 2000 + 4500\left(1 - e^{-1.5}\right) \approx 2000 + 4500(0.7769) \approx 5{,}500\ \text{trucks/day}.$$
The trap is to treat the current growth (about 90 trucks/day per year right now) as if it held flat for 75 years, which gives $2000 + 90 \cdot 75 = 8{,}750$, a 60% overdesign. Because the growth rate decays, the honest accumulated total is far lower. Same lesson as Step 5, in reverse: a changing rate cannot be treated as constant. The replacement should be built for roughly **5,500 trucks per day**. *Calc 1: integral of an exponential rate, Net Change Theorem, accumulation with a decaying rate. (Vol 1, 5.3, 5.4.)*

### Recommendation and the rubric layer

To the commissioners: the bridge failed from fatigue caused by six decades of growing truck traffic, the flood never reached the scour threshold, and the replacement should be designed for about 5,500 trucks per day at end of life. What belongs in the written memo rather than the math: whether to challenge the state's funding position, and an inspection policy that re-checks fatigue on a schedule tied to traffic rather than the calendar.

### Alignment block (instructor-facing metadata)

- **Course:** Calculus 1 only.
- **OpenStax Calculus Volume 1 sections:** 4.3 Maxima and Minima; 3.x derivative rules; 5.3 Fundamental Theorem of Calculus; 5.4 Net Change Theorem; 2.1 average vs instantaneous rate of change.
- **Primary learning objectives (3):** (1) turn a rate into an accumulated total using the Net Change Theorem; (2) distinguish average from instantaneous rate of change and see why a changing rate cannot be extrapolated linearly; (3) locate a maximum using the derivative. Optimization and FTC carry the case; the flood max is the supporting third.
- **Archetypes:** forensic post-mortem; rate ledger with threshold; model check against data; design to margin.
- **Removed for Calc 1 (was in the Calc 1/2 version):** integration by parts (flood volume), improper integrals, the logistic projection. Each was replaced by a Calc 1 equivalent that teaches the same rate-to-accumulation idea.

### Data audit (for the generator)

Needed: the damage-rate formula, the 2005 calibration sentence (both as data and as the planted error), the flood flow function and scour threshold, the corrosion measurement, the traffic-growth rate and 2,000 starting value, the 75-year life. Inert by design: span count, length, deck width, lane count, rainfall total, drainage area, the full traffic-count table (realistic clutter; the calibrated rate already encodes traffic), scour inspection depth (corroborating only).

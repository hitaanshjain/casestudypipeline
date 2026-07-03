# The Food Bank Warehouse Decision
*A nonprofit operations decision  •  Calculus 1*

Every winter, the Riverside Food Bank gets slammed with holiday donations. Its director, Marcus, is worried about two different things at once. The warehouse might physically overflow with food during the surge, and his volunteer crew might not be able to sort donations fast enough on the busiest day. Both problems point to the same expensive fix: leasing a second warehouse and recruiting more volunteers. Marcus wants to decide with numbers, not panic. His records are below.

**MARCUS'S RECORDS  (everything you need)**

| **The holiday surge** | Donations arrive at the rate **I(t) = 120t − 10t²**  (crates per day), where t = days since the surge began. The surge lasts **12 days**. Meanwhile, partner pantries pick up a steady **100 crates per day** the whole time. |
| --- | --- |
| **Right now** | The warehouse currently holds **2,000 crates** and can hold at most **3,500**. Volunteers can sort at most **300 crates per day**. The warehouse is a converted textile mill on Route 9. |

## Your questions

- **Will the warehouse overflow during the surge?**

The change in what's stored is the food coming *in* minus the food going *out*. Find the net change in inventory over the 12 days, which is the integral of (donations − pickups) = ∫₀¹² (120t − 10t² − 100) dt. Add that to the 2,000 crates already there. Does the total go past the 3,500 the warehouse can hold?

- **On the single busiest day, can the volunteers keep up?**

Find the busiest day of the surge and the peak donation rate. (Hint: I(t) is an upside-down parabola, so its peak is where the slope I′(t) equals zero.) Compare that peak to the 300 crates/day the volunteers can sort. Are they keeping up or falling behind?

- **A board member's shortcut.**

At a meeting, a board member says: "We'll get about 360 crates a day for 12 days, so budget for 360 × 12 = 4,320 crates of donations." Find the *actual* total donations over the surge (the integral of the donation rate) and explain why the board member's number is too high. *(Hint: is the donation rate really 360 every day?)*

*Write Marcus a 2–3 sentence recommendation: should he lease the second warehouse and recruit more volunteers, and what do the numbers say?*

---

## Optional checklist (hand out only if a student is stuck)

1. "Net change" means in minus out. What's the rate of food coming in? Going out? Subtract, then integrate over the 12 days.
2. Add that net change to the starting 2,000 crates and compare to 3,500.
3. The busiest day: where is the donation rate largest? Use the derivative.
4. Compare that peak rate to what the volunteers can handle.

---

## ANSWER KEY  (instructor)

**Q1.  Overflow?**  Net change in inventory over 12 days:
$$\int_0^{12}(120t - 10t^2 - 100)\,dt = \Big[60t^2 - \tfrac{10}{3}t^3 - 100t\Big]_0^{12} = 8640 - 5760 - 1200 = \mathbf{1680 \text{ crates gained.}}$$
Ending inventory = 2000 + 1680 = **3,680 crates**, which is past the 3,500 limit. **The warehouse overflows** (by about 180 crates). *(Skill: net change, turning an inflow-minus-outflow rate into a total with the integral / Net Change Theorem.)*

**Q2.  Busiest day?**  I′(t) = 120 − 20t = 0 → t = 6, so the peak is **day 6**. Peak rate I(6) = 720 − 360 = **360 crates/day**. Since 360 > 300, the volunteers fall behind by about **60 crates on the peak day**. *(Skill: maximum via the derivative.)*

**Q3.  The shortcut.**  Actual total donations:
$$\int_0^{12}(120t - 10t^2)\,dt = \Big[60t^2 - \tfrac{10}{3}t^3\Big]_0^{12} = 8640 - 5760 = \mathbf{2880 \text{ crates.}}$$
The board member multiplied the *peak* rate (360, which only happens on day 6) by all 12 days. The rate climbs to 360 and then falls back, so the honest total is the integral, **2,880**, not 4,320. (The average is 2880 ÷ 12 = 240 crates/day.) *(Skill: a changing rate cannot be treated as constant.)*

**Verdict.**  Both signals say **expand**. Inventory will overflow the warehouse (3,680 > 3,500) and the volunteers cannot keep up on the busiest day (360 > 300). Marcus should lease the second warehouse and recruit extra holiday volunteers, and budget around the real donation total of 2,880 crates, not the inflated 4,320.

---

### Alignment block (instructor-facing)

- **Course:** Calculus 1 only.
- **OpenStax Calculus Volume 1 sections:** 4.3 Maxima and Minima; 5.3 Fundamental Theorem of Calculus; 5.4 Net Change Theorem; 5.2 (average value of a function).
- **Learning objectives (3):** (1) turn a *net* rate (inflow minus outflow) into an accumulated total using the integral; (2) find a maximum with the derivative and compare it to a capacity; (3) recognize that a changing rate cannot be multiplied as if constant.
- **What makes this different from a peak-and-project case:** the accumulation here is a *net* quantity (donations in minus pickups out), and it tracks an inventory level against a capacity, not a demand against a threshold.
- **Inert distractor (flavor only):** the converted-textile-mill detail and the Route 9 location. Nothing in the math needs them.

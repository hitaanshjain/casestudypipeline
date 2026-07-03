# The Community Garden Decision
*A neighborhood nonprofit decision  •  Calculus 1*

A neighborhood nonprofit just got a vacant lot donated and wants to turn it into a community garden. Two questions are holding up the plan. First, they have a limited amount of fencing, and they want to enclose the largest growing area they can. Second, they already promised the local food pantry a share of the harvest, and they need to be sure the garden will actually produce enough. The board asked a volunteer with some calculus to check the numbers before they commit. The details are below.

**PROJECT DETAILS  (everything you need)**

| **The build** | The nonprofit has **240 feet of fencing**. The lot backs onto an existing brick wall, so only the **other three sides** need fencing. They want the **largest possible rectangular growing area**. |
| --- | --- |
| **The season** | Once planted, the garden's harvest rate is **h(t) = 12t − (3/4)t²**  (pounds per week), where t = weeks into the **16-week season**. The nonprofit promised the food pantry at least **400 pounds** this season. |

## Your questions

- **What layout gives the most growing space?**

Because the wall covers one side, the 240 feet of fencing only has to cover three sides. Call the two sides sticking out from the wall **x** each; the side running along the wall uses whatever fence is left. Write the enclosed area as a function of x, then find the x that makes it as large as possible. (Hint: it's an upside-down parabola, so the max is where the slope equals zero.) Report the dimensions and the area.

- **Will the garden keep the 400-pound promise?**

The total harvest over the season is the **integral of the harvest rate**: ∫₀¹⁶ (12t − (3/4)t²) dt. Does it reach the 400 pounds they promised?

- **A volunteer's estimate.**

A volunteer says: "The garden peaks at 48 pounds a week, and the season is 16 weeks, so we'll get about 48 × 16 = 768 pounds. Let's promise the pantry that much." Would you promise on 768 pounds? Find the peak weekly rate to check where the 48 comes from, and explain why 768 is not a safe number. *(Hint: does the garden really produce 48 pounds every week?)*

*Write the board a 2–3 sentence recommendation: should they build the garden, and can they keep the promise?*

---

## Optional checklist (hand out only if a student is stuck)

1. Three sides are fenced: two of length x, one of length y. Write the fencing equation, solve it for y.
2. Area = x times y. Substitute your y so area depends only on x, then maximize with the derivative.
3. Total harvest is the integral of the harvest rate over the 16 weeks.
4. For the last part, find the peak of h(t), then ask whether the garden produces that peak amount every week.

---

## ANSWER KEY  (instructor)

**Q1.  Largest area.**  Three fenced sides: 2x + y = 240, so y = 240 − 2x. Area:
$$A(x) = x\,y = x(240 - 2x) = 240x - 2x^2, \qquad A'(x) = 240 - 4x = 0 \Rightarrow x = 60.$$
Then y = 240 − 120 = 120, and A = 60 × 120 = **7,200 square feet**, from a garden **60 ft deep and 120 ft wide**. *(Skill: optimization with a constraint, substitute the constraint, then maximize.)*

**Q2.  The promise.**  Total harvest:
$$\int_0^{16}\left(12t - \tfrac{3}{4}t^2\right)dt = \Big[6t^2 - \tfrac{1}{4}t^3\Big]_0^{16} = 1536 - 1024 = \mathbf{512 \text{ pounds.}}$$
Since 512 > 400, the garden **keeps the promise**, with about 112 pounds to spare. *(Skill: accumulation, turning a rate into a total with the integral.)*

**Q3.  The estimate.**  Peak rate: h′(t) = 12 − (3/2)t = 0 → t = 8, and h(8) = 96 − 48 = **48 lb/week**. That 48 only happens at week 8; the rate climbs to 48 and then falls back to 0 by week 16. The honest total is the integral, **512 pounds**, not 768. Promising 768 would overcommit the garden by 50%. (The average is 512 ÷ 16 = 32 lb/week.) *(Skill: a changing rate cannot be treated as constant.)*

**Verdict.**  **Build it.** The best layout is 60 ft by 120 ft for 7,200 square feet of growing space, and the season should yield about **512 pounds**, comfortably above the 400-pound promise. Promise the pantry based on 512, not the volunteer's inflated 768.

---

### Alignment block (instructor-facing)

- **Course:** Calculus 1 only.
- **OpenStax Calculus Volume 1 sections:** 4.7 Applied Optimization Problems; 5.3 Fundamental Theorem of Calculus; 5.4 Net Change Theorem; 5.2 (average value of a function).
- **Learning objectives (3):** (1) set up and solve a constrained optimization by substituting the constraint; (2) turn a rate into an accumulated total with the integral and compare it to a target; (3) recognize that a changing rate cannot be multiplied as if constant.
- **What makes this different from the taco truck:** the optimization here is a *constrained* max-area problem (build the objective, substitute the constraint, then maximize), which is a different and harder-to-recognize move than finding the peak of a curve you were handed.

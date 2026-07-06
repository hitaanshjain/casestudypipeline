# Calculus Volume 1 (Strang/Herman) Sec 5.4: Integration Formulas and the Net Change Theorem

**OER:** Calculus Volume 1 (Gilbert Strang and Edwin "Jed" Herman, CC BY-NC-SA 4.0)
**Source:** https://openstax.org/books/calculus-volume-1
**License:** Creative Commons Attribution Non-Commercial ShareAlike 4.0 International License (CC BY-NC-SA 4.0)
**Attribution required:** Access for free at openstax.org.

## Section Outcomes / Learning Objectives
- Apply the basic integration formulas.
- Explain the significance of the net change theorem.
- Use the net change theorem to solve applied problems.
- Apply the integrals of odd and even functions.

## Section Topics
- basic integration formulas
- net change theorem
- net displacement
- total distance traveled
- rate of change
- even function
- odd function
- symmetric interval

## Content

This section develops the basic power-rule antiderivative formulas (for n != -1, the antiderivative of $t^n$ is $t^{n+1}/(n+1)$, and constants and sums/differences integrate term by term) and then uses them to state and apply the net change theorem, which converts a rate-of-change function into the total change it produces over an interval.

#### thm 1: Net Change Theorem {#openstax_calc1-5.4-thm-1}
If a quantity changes according to a rate function $F'(x)$, then the new value equals the initial value plus the integral of the rate of change:
$$F(b) = F(a) + \int_a^b F'(x)\,dx,$$
equivalently
$$\int_a^b F'(x)\,dx = F(b) - F(a).$$
Net change applies to area, distance, volume, and any other accumulated quantity, and automatically accounts for a rate that varies (even one that is sometimes negative), without needing to split the integral by hand. For example, applying the theorem to a velocity function $v(t)$ gives net displacement directly as $\int_a^b v(t)\,dt$: if a car travels north at 40 mph from 2 p.m. to 4 p.m., then south at 30 mph from 4 p.m. to 5 p.m., its net displacement is $\int_2^4 40\,dt + \int_4^5 (-30)\,dt = 80 - 30 = 50$ mi north, even though the rate (velocity) was not constant across the whole trip.

#### ex 1: How Many Gallons of Gasoline Are Consumed {#openstax_calc1-5.4-ex-1}
Problem: if a motorboat's motor is started at $t=0$ and it consumes gasoline at the rate of $(5 - 0.1t^3)$ gal/hr, how much gasoline is used in the first 2 hours?

Solution: express the question as a definite integral of the rate function over $[0,2]$ and evaluate using the evaluation theorem:
$$\int_0^2 (5 - 0.1t^3)\,dt = \left[5t - 0.1\frac{t^4}{4}\right]_0^2 = \left[5(2) - 0.1\frac{(2)^4}{4}\right] - 0 = 10 - 0.4 = 9.6.$$
The motorboat uses 9.6 gallons of gas in the first 2 hours. This is the general pattern for any "gallons per hour rate, over a fixed hour window, find total gallons" question: integrate the rate function over the window using the evaluation theorem; the rate need not be constant, and the theorem's result already accounts for a rate that rises and falls across the window.

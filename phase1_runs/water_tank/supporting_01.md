# Calculus Volume 1 (Strang/Herman) Sec 4.3: Maxima and Minima

**OER:** Calculus Volume 1 (Gilbert Strang and Edwin "Jed" Herman, CC BY-NC-SA 4.0)
**Source:** https://openstax.org/books/calculus-volume-1
**License:** Creative Commons Attribution Non-Commercial ShareAlike 4.0 International License (CC BY-NC-SA 4.0)
**Attribution required:** Access for free at openstax.org.

## Section Outcomes / Learning Objectives
- Define absolute extrema.
- Define local extrema.
- Explain how to find the critical points of a function over a closed interval.
- Describe how to use critical points to locate absolute extrema over a closed interval.

## Section Topics
- absolute extrema
- local extrema
- critical number
- extreme value theorem
- fermat's theorem
- closed interval method
- endpoint extremum

## Content

This section develops how to use derivatives to find the largest and smallest values a function takes over an interval.

#### def 1: Critical Number {#openstax_calc1-4.3-def-1}
Let $c$ be an interior point in the domain of $f$. Then $c$ is a critical number of $f$ if $f'(c) = 0$ or $f'(c)$ is undefined; the point $(c, f(c))$ is called a critical point. If $f$ has a local extremum at $c$ and is differentiable there, then $f'(c)=0$ (Fermat's theorem); critical points are candidates for extrema, not guarantees (for example $f(x)=x^3$ has a critical point at $x=0$ that is not a local extremum).

#### thm 1: Extreme Value Theorem {#openstax_calc1-4.3-thm-1}
If $f$ is continuous over a closed, bounded interval $[a,b]$, then $f$ attains an absolute maximum and an absolute minimum somewhere on $[a,b]$. A related result narrows down where: the absolute maximum and minimum of $f$ over $[a,b]$ must occur either at an endpoint of $[a,b]$ or at a critical point of $f$ inside $(a,b)$.

#### proc 1: Locating Absolute Extrema over a Closed Interval {#openstax_calc1-4.3-proc-1}
For a continuous function $f$ on a closed interval $[a,b]$:
1. Evaluate $f$ at the endpoints $x=a$ and $x=b$.
2. Find all critical points of $f$ in the open interval $(a,b)$ and evaluate $f$ at each one.
3. Compare all values from steps 1 and 2: the largest is the absolute maximum of $f$ on $[a,b]$; the smallest is the absolute minimum.

#### ex 1: Locating Absolute Extrema {#openstax_calc1-4.3-ex-1}
Problem: find the absolute maximum and minimum of $f(x) = -x^2 + 3x - 2$ over $[1,3]$, and where they occur.

Solution: Step 1, endpoints: $f(1) = -1+3-2 = 0$; $f(3) = -9+9-2=-2$. Step 2, critical points: $f'(x) = -2x+3$ is defined everywhere, so solve $f'(x)=0$: $x = 3/2$, which lies in $[1,3]$, so $f(3/2) = -(3/2)^2+3(3/2)-2 = -9/4+9/2-2 = 1/4$ is a candidate. Step 3, compare: $f(1)=0$, $f(3/2)=1/4$, $f(3)=-2$; the absolute maximum is $1/4$ at $x=3/2$, and the absolute minimum is $-2$ at $x=3$.

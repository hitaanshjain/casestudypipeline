# OpenStax Calculus Volume 1, Section 4.3: Maxima and Minima

## Learning Objectives
- Define absolute extrema.
- Define local extrema.
- Explain how to find the critical points of a function over a closed interval.
- Describe how to use critical points to locate absolute extrema over a closed interval.

## Topic Keywords
- absolute extrema
- local extrema
- critical number
- extreme value theorem
- fermat's theorem
- closed interval method
- endpoint extremum

## Content

Given a particular function, we are often interested in the largest and smallest values the function takes. This
matters for graphing and for optimization problems (maximizing profit, minimizing material used in
manufacturing, finding a maximum height). This section develops how to use derivatives to find these largest
and smallest values.

### Absolute Extrema

Consider the function f(x) = x^2 + 1 over the interval (-infinity, infinity). As x -> +/-infinity, f(x) -> infinity,
so the function does not have a largest value. However, since x^2 + 1 >= 1 for all real numbers x and x^2 + 1 = 1
when x = 0, the function has a smallest value, 1, when x = 0. We say that 1 is the absolute minimum of
f(x) = x^2 + 1 and that it occurs at x = 0. We say that f(x) = x^2 + 1 does not have an absolute maximum.

### Definition: absolute maximum and absolute minimum
Let f be a function defined over an interval I and let c be in I. We say f has an absolute maximum on I at c if
f(c) >= f(x) for all x in I. We say f has an absolute minimum on I at c if f(c) <= f(x) for all x in I. If f has an
absolute maximum on I at c or an absolute minimum on I at c, we say f has an absolute extremum on I at c.

The term "absolute" here does not refer to absolute value: an absolute extremum may be positive, negative, or
zero. If f has an absolute extremum over I at c, the absolute extremum is the value f(c); the point c is where it
occurs. For example, consider f(x) = 1/(x^2+1) over (-infinity, infinity). Since f(0) = 1 >= 1/(x^2+1) = f(x) for
all real x, f has an absolute maximum over (-infinity, infinity) at x = 0, and the absolute maximum value is
f(0) = 1. A function may have both an absolute maximum and an absolute minimum, just one of the two, or
neither, depending on the function and the interval.

### Theorem: Extreme Value Theorem
If f is a continuous function over a closed, bounded interval [a, b], then there is a point in [a, b] at which f has
an absolute maximum over [a, b], and there is a point in [a, b] at which f has an absolute minimum over [a, b].

For this theorem to apply, the function must be continuous over a closed, bounded interval. If the interval is
open, or the function has even one point of discontinuity, the function may fail to have an absolute maximum
or an absolute minimum over that interval.

### Local Extrema and Critical Points

### Definition: local maximum and local minimum
A function f has a local maximum at c if there exists an open interval I containing c such that I is contained in
the domain of f and f(c) >= f(x) for all x in I. A function f has a local minimum at c if there exists an open
interval I containing c such that I is contained in the domain of f and f(c) <= f(x) for all x in I. A function f has
a local extremum at c if f has a local maximum at c or f has a local minimum at c.

If f has an absolute extremum at c and f is defined over an interval containing c, then f(c) is also considered a
local extremum. If an absolute extremum for f occurs at an endpoint of the domain, it is not called a local
extremum but instead an endpoint extremum.

### Definition: critical number
Let c be an interior point in the domain of f. We say c is a critical number of f if f'(c) = 0 or f'(c) is undefined.
The point (c, f(c)) is also called a critical point of f; the two terms are often used interchangeably.

If f has a local extremum at a point x = c, then c must be a critical number of f. This fact is known as Fermat's
theorem.

### Theorem: Fermat's Theorem
If f has a local extremum at c and f is differentiable at c, then f'(c) = 0.

(Proof idea: if f has, say, a local maximum at c, then f(x) - f(c) <= 0 for x near c. Looking at the difference
quotient (f(x)-f(c))/(x-c) from the right (x > c) gives f'(c) <= 0, while looking at it from the left (x < c) gives
f'(c) >= 0. Since f is differentiable at c, both one-sided limits equal f'(c), so f'(c) = 0. The local-minimum case
is handled the same way.)

Fermat's theorem does not claim the converse: a critical point need not be a local extremum. For example,
f(x) = x^3 has f'(x) = 3x^2 = 0 at x = 0, so x = 0 is a critical number, but f(x) = x^3 is increasing over
(-infinity, infinity), so f has no local extremum at x = 0. Critical points are candidates for local extrema, not
guarantees.

**EXAMPLE 4.12 (Locating Critical Points).** For each of the following functions, find all critical points, and
determine (using a graph) whether the function has a local extremum at each one.
a. f(x) = (1/3)x^3 - (5/2)x^2 + 4x
b. f(x) = (x^2 - 1)^3
c. f(x) = 4x/(1+x^2)

Solution:
a. The derivative f'(x) = x^2 - 5x + 4 is defined for all real x, so we only need where f'(x) = 0. Factoring,
f'(x) = (x-4)(x-1), so the critical numbers are x = 1 and x = 4. From the graph of f, f has a local maximum at
x = 1 and a local minimum at x = 4.

b. By the chain rule, f'(x) = 3(x^2-1)^2 (2x) = 6x(x^2-1)^2. This is zero when x = 0 and when x^2 - 1 = 0, so the
critical numbers are x = 0, 1, -1. From the graph of f, f has a local (and absolute) minimum at x = 0, but does
not have a local extremum at x = 1 or at x = -1.

c. By the quotient rule, f'(x) = [(1+x^2)(4) - 4x(2x)]/(1+x^2)^2 = (4 - 4x^2)/(1+x^2)^2. This derivative is defined
everywhere, so we only need where f'(x) = 0: 4 - 4x^2 = 0 implies x = +/-1, so the critical numbers are x = 1
and x = -1. From the graph of f, f has an absolute maximum of f(1) = 2 at x = 1 and an absolute minimum of
f(-1) = -2 at x = -1; since neither point is an endpoint of the domain (-infinity, infinity), both are also local
extrema.

### Locating Absolute Extrema

### Theorem: Location of Absolute Extrema
Let f be a continuous function over a closed, bounded interval I. The absolute maximum of f over I and the
absolute minimum of f over I must occur at endpoints of I or at critical points of f in I.

### Problem-Solving Strategy: locating absolute extrema over a closed interval
Consider a continuous function f defined over a closed interval [a, b].
1. Evaluate f at the endpoints x = a and x = b.
2. Find all critical points of f that lie in the open interval (a, b) and evaluate f at those critical points.
3. Compare all the values from steps 1 and 2. The largest of these values is the absolute maximum of f; the
smallest is the absolute minimum of f.

**EXAMPLE 4.13 (Locating Absolute Extrema).** For each of the following functions, find the absolute maximum
and absolute minimum over the specified interval, and state where those values occur.
a. f(x) = -x^2 + 3x - 2 over [1, 3]
b. f(x) = x^2 - 3x^(2/3) over [0, 2]

Solution:
a. Step 1: evaluate the endpoints. f(1) = -1 + 3 - 2 = 0 and f(3) = -9 + 9 - 2 = -2.
Step 2: f'(x) = -2x + 3 is defined for all real x, so there are no critical points where f' is undefined; it remains
to check where f'(x) = 0. Setting -2x + 3 = 0 gives x = 3/2, which lies in [1, 3], so f(3/2) is a candidate. We find
f(3/2) = -(3/2)^2 + 3(3/2) - 2 = -9/4 + 9/2 - 2 = 1/4.
Step 3: comparing the three values, f(1) = 0, f(3/2) = 1/4, f(3) = -2, the absolute maximum of f over [1, 3] is
1/4, occurring at x = 3/2, and the absolute minimum is -2, occurring at x = 3.

b. Step 1: evaluate the endpoints. f(0) = 0 - 0 = 0 and f(2) = 4 - 3(2)^(2/3) = 4 - 3*4^(1/3) ~= -0.762.
Step 2: the derivative is f'(x) = 2x - 2x^(-1/3) = (2x^(4/3) - 2)/x^(1/3), defined for x != 0. Setting the numerator
to zero, 2x^(4/3) - 2 = 0 implies x^(4/3) = 1, so x = +/-1; the derivative is undefined at x = 0. So the critical
numbers of f are x = 0, 1, -1. The point x = 0 is an endpoint already evaluated in step 1; x = -1 is not in [0, 2],
so it is discarded; only x = 1 remains to evaluate. We find f(1) = 1 - 3(1)^(2/3) = 1 - 3 = -2.
Step 3: comparing f(0) = 0, f(1) = -2, f(2) ~= -0.762, the absolute maximum of f over [0, 2] is 0, occurring at
x = 0, and the absolute minimum is -2, occurring at x = 1.

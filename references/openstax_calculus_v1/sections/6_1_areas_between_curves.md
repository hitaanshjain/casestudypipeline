# OpenStax Calculus Volume 1, Section 6.1: Areas between Curves

## Learning Objectives
- Determine the area of a region between two curves by integrating with respect to the independent variable.
- Find the area of a compound region.
- Determine the area of a region between two curves by integrating with respect to the dependent variable.

## Topic Keywords
- area between curves
- integration with respect to x
- integration with respect to y
- compound region
- absolute value of a difference
- points of intersection
- riemann sum
- definite integral

## Content

This section extends the area-under-a-curve idea from earlier in the chapter to the area between two curves.
We start with curves that are functions of x, beginning with the simple case where one function value is
always at least as large as the other on the interval of interest, then handle the case where the graphs of
the functions cross, so which curve is on top changes across the interval. Last, we consider how to find the
area between two curves that are functions of y.

### Area of a Region between Two Curves

Let f(x) and g(x) be continuous functions on an interval [a,b] such that f(x) >= g(x) on [a,b]. To find the
area between the graphs, partition [a,b] into n subintervals via a regular partition, choose a sample point
x_i* in each subinterval [x_(i-1), x_i], and on that subinterval construct a rectangle that extends vertically
from g(x_i*) up to f(x_i*). The height of each rectangle is f(x_i*) - g(x_i*) and the width is delta x, so the
area is approximated by the sum from i = 1 to n of [f(x_i*) - g(x_i*)] delta x. This is a Riemann sum, so
taking the limit as n -> infinity gives A = the integral from a to b of [f(x) - g(x)] dx.

### Theorem 6.1: Finding the Area between Two Curves
Let f(x) and g(x) be continuous functions such that f(x) >= g(x) over an interval [a,b]. Let R denote the
region bounded above by the graph of f(x), below by the graph of g(x), and on the left and right by the lines
x = a and x = b, respectively. Then the area of R is given by
A = the integral from a to b of [f(x) - g(x)] dx.

The book's first worked example (its Example 6.1) uses this theorem directly on a fixed interval [1,4] with
f(x) = x + 4 and g(x) = 3 - x/2, giving area 57/4 square units; it is omitted here as redundant with the next
example, which additionally requires locating the interval of integration rather than being given one.

**EXAMPLE 6.2 (Finding the Area of a Region between Two Curves 2).** If R is the region bounded above by the
graph of f(x) = 9 - (x/2)^2 and below by the graph of g(x) = 6 - x, find the area of R.

Solution: No interval is given, so first find where the graphs intersect by setting f(x) = g(x):
9 - (x/2)^2 = 6 - x, so 9 - x^2/4 = 6 - x. Multiplying both sides by 4 gives 36 - x^2 = 24 - 4x, so
x^2 - 4x - 12 = 0, which factors as (x - 6)(x + 2) = 0. The graphs intersect at x = -2 and x = 6, and
f(x) >= g(x) on [-2,6], so integrate over that interval:

A = the integral from -2 to 6 of [(9 - (x/2)^2) - (6 - x)] dx = the integral from -2 to 6 of [3 - x^2/4 + x] dx
= [3x - x^3/12 + x^2/2] evaluated from -2 to 6 = (18 - 18 + 18) - (-6 + 2/3 + 2) = 18 - (-10/3) = 64/3.

The area of the region is 64/3 square units. (Recomputed independently: matches the book's stated 64/3.)

### Areas of Compound Regions

So far f(x) >= g(x) was required over the whole interval, but when the graphs of the two functions cross,
neither one stays on top the entire time. The process is modified by using the absolute value function: over
stretches where f(x) >= g(x) the integrand is f(x) - g(x), and over stretches where g(x) >= f(x) the integrand
is g(x) - f(x), so folding both cases together gives |f(x) - g(x)| as the integrand.

### Theorem 6.2: Finding the Area of a Region between Curves That Cross
Let f(x) and g(x) be continuous functions over an interval [a,b]. Let R denote the region between the graphs
of f(x) and g(x), bounded on the left and right by the lines x = a and x = b, respectively. Then the area of R
is given by
A = the integral from a to b of |f(x) - g(x)| dx.
In practice, applying this theorem requires breaking up the interval [a,b] at every point where the graphs
cross and evaluating one integral over each piece, depending on which function value is greater there.

**EXAMPLE 6.3 (Finding the Area of a Region Bounded by Functions That Cross).** If R is the region between the
graphs of f(x) = sin(x) and g(x) = cos(x) over the interval [0, pi], find the area of R.

Solution: The graphs intersect at x = pi/4. For x in [0, pi/4], cos(x) >= sin(x), so
|f(x) - g(x)| = cos(x) - sin(x). For x in [pi/4, pi], sin(x) >= cos(x), so |f(x) - g(x)| = sin(x) - cos(x).
Splitting the integral at x = pi/4:

A = the integral from 0 to pi of |sin(x) - cos(x)| dx
= the integral from 0 to pi/4 of (cos(x) - sin(x)) dx + the integral from pi/4 to pi of (sin(x) - cos(x)) dx
= [sin(x) + cos(x)] evaluated from 0 to pi/4 + [-cos(x) - sin(x)] evaluated from pi/4 to pi
= (sqrt(2) - 1) + (1 + sqrt(2)) = 2 sqrt(2).

The area of the region is 2 sqrt(2) square units. (Recomputed independently: [sin(pi/4)+cos(pi/4)] -
[sin(0)+cos(0)] = sqrt(2) - 1, and [-cos(pi)-sin(pi)] - [-cos(pi/4)-sin(pi/4)] = 1 + sqrt(2); the sum is
2 sqrt(2), matching the book.)

Deviation note: the book also works a second compound-region example (its Example 6.4: f(x) = x^2 and
g(x) = 2 - x, meeting at x = 1, region bounded below by the x-axis, split into two integrals over [0,1] and
[1,2] for a combined area of 5/6 square units). It is condensed to a one-line callback in Example 6.5 below
rather than fully re-solved, since Example 6.5 restates the identical region.

### Regions Defined with Respect to y

Some regions are more naturally handled by solving the bounding curves for x as functions of y. Let u(y) and
v(y) be continuous functions on an interval [c,d] such that u(y) >= v(y) for all y in [c,d]. Partitioning [c,d]
on the y-axis and building a rectangle on each subinterval that extends horizontally from v(y_i*) to u(y_i*)
gives rectangles of height delta y and width u(y_i*) - v(y_i*), so the area is approximated by the Riemann sum
sum from i = 1 to n of [u(y_i*) - v(y_i*)] delta y, whose limit as n -> infinity is again a definite integral.

### Theorem 6.3: Finding the Area between Two Curves, Integrating along the y-axis
Let u(y) and v(y) be continuous functions such that u(y) >= v(y) for all y in [c,d]. Let R denote the region
bounded on the right by the graph of u(y), on the left by the graph of v(y), and above and below by the lines
y = d and y = c, respectively. Then the area of R is given by
A = the integral from c to d of [u(y) - v(y)] dy.

**EXAMPLE 6.5 (Integrating with Respect to y).** Let R be the region bounded above by f(x) = x^2, above-right
by g(x) = 2 - x, and below by the x-axis: the same region as the book's Example 6.4 above, where integrating
with respect to x required splitting at x = 1 into two integrals (area 1/3 on [0,1] under f, plus area 1/2 on
[1,2] under g, for a total of 5/6). Find the area of R by integrating with respect to y instead.

Solution: Solved for x as functions of y, the left boundary (from f(x) = x^2 with x >= 0) is x = v(y) =
sqrt(y), and the right boundary (from g(x) = 2 - x) is x = u(y) = 2 - y. The region is bounded below by y = 0
(the x-axis), and its upper limit is the point where the two curves intersect, (1,1), so [c,d] = [0,1]. Then

A = the integral from 0 to 1 of [(2 - y) - sqrt(y)] dy = [2y - y^2/2 - (2/3) y^(3/2)] evaluated from 0 to 1
= (2 - 1/2 - 2/3) - 0 = 5/6.

The area of the region is 5/6 square units, matching Example 6.4's two-integral answer but requiring only one
integral here, which is the payoff of integrating with respect to y for a region like this one. (Recomputed
independently: 2 - 0.5 - 0.6667 = 0.8333 = 5/6, matches.)

# OpenStax Calculus Volume 1, Section 4.5: Derivatives and the Shape of a Graph

## Learning Objectives
- Explain how the sign of the first derivative affects the shape of a function's graph.
- State the first derivative test for critical points.
- Use concavity and inflection points to explain how the sign of the second derivative affects the shape of a function's graph.
- Explain the concavity test for a function over an open interval.
- Explain the relationship between a function and its first and second derivatives.
- State the second derivative test for local extrema.

## Topic Keywords
- critical point
- local extrema
- first derivative test
- increasing function
- decreasing function
- concavity
- inflection point
- second derivative test

## Content

### Local extrema occur at critical points
A continuous function f has a local maximum at a point c if and only if f switches from increasing to decreasing at c, and f has a local minimum at c if and only if f switches from decreasing to increasing at c. If f is continuous over an interval I containing c and differentiable over I except possibly at c, the only way f can switch from increasing to decreasing (or vice versa) at c is if f' changes sign as x increases through c, and the only way f' can change sign as x increases through c is if f'(c) = 0 or f'(c) is undefined. Consequently, to locate local extrema for a function f, we look for points c in the domain of f such that f'(c) = 0 or f'(c) is undefined; these are the critical points of f. A function need not have a local extremum at a critical point: the critical points are only candidates for local extrema.

### Theorem 4.9: First Derivative Test
Suppose that f is a continuous function over an interval I containing a critical point c. If f is differentiable over I, except possibly at c, then f(c) satisfies one of the following:
i. If f' changes sign from positive when x < c to negative when x > c, then f(c) is a local maximum of f.
ii. If f' changes sign from negative when x < c to positive when x > c, then f(c) is a local minimum of f.
iii. If f' has the same sign for x < c and x > c, then f(c) is neither a local maximum nor a local minimum of f.

### Problem-Solving Strategy: Using the First Derivative Test
Consider a function f that is continuous over an interval I.
1. Find all critical points of f and divide the interval I into smaller intervals using the critical points as endpoints.
2. Analyze the sign of f' in each of the subintervals. If f' is continuous over a given subinterval, the sign of f' does not change over that subinterval and can be determined by choosing an arbitrary test point x in the subinterval and evaluating the sign of f' there. Use the sign analysis to determine whether f is increasing or decreasing over that interval. (Note: if f' is not continuous throughout I, include points of discontinuity along with critical points as endpoints when dividing I into subintervals.)
3. Use the first derivative test and the results of step 2 to determine whether f has a local maximum, a local minimum, or neither at each critical point.

**EXAMPLE 4.17 (Using the First Derivative Test to Find Local Extrema).** Use the first derivative test to find the location of all local extrema for f(x) = x^3 - 3x^2 - 9x - 1.

Solution:
Step 1. The derivative is f'(x) = 3x^2 - 6x - 9. To find the critical points, solve f'(x) = 0. Factoring, 3(x^2 - 2x - 3) = 3(x - 3)(x + 1) = 0, so the critical points are x = 3, -1. Divide (-infinity, infinity) into the smaller intervals (-infinity, -1), (-1, 3), and (3, infinity).
Step 2. Since f' is continuous, choose one test point in each subinterval: x = -2, x = 0, and x = 4. At x = -2: (+)(-)(-) = +, so f is increasing on (-infinity, -1). At x = 0: (+)(-)(+) = -, so f is decreasing on (-1, 3). At x = 4: (+)(+)(+) = +, so f is increasing on (3, infinity).
Step 3. Since f' switches sign from positive to negative as x increases through -1, f has a local maximum at x = -1. Since f' switches sign from negative to positive as x increases through 3, f has a local minimum at x = 3. A graph of f confirms these analytical results: f rises to a local max near x = -1, falls to a local min near x = 3, then rises again.

**EXAMPLE 4.18 (Using the First Derivative Test).** Use the first derivative test to find the location of all local extrema for f(x) = 5x^(1/3) - x^(5/3).

Solution:
Step 1. The derivative is f'(x) = (5/3)x^(-2/3) - (5/3)x^(2/3) = 5/(3x^(2/3)) - 5x^(2/3)/3 = (5 - 5x^(4/3))/(3x^(2/3)) = 5(1 - x^(4/3))/(3x^(2/3)). f'(x) = 0 when 1 - x^(4/3) = 0, i.e., x = +/-1, and f'(x) is undefined at x = 0. Therefore there are three critical points: x = -1, 0, 1. Divide (-infinity, infinity) into (-infinity, -1), (-1, 0), (0, 1), and (1, infinity).
Step 2. Since f' is continuous over each subinterval, test x = -2, x = -1/2, x = 1/2, and x = 2. At x = -2, the sign is (+)(-)/(+) = -, so f is decreasing on (-infinity, -1). At x = -1/2, the sign is (+)(+)/(+) = +, so f is increasing on (-1, 0). At x = 1/2, the sign is (+)(+)/(+) = +, so f is increasing on (0, 1). At x = 2, the sign is (+)(-)/(+) = -, so f is decreasing on (1, infinity).
Step 3. Since f is decreasing on (-infinity, -1) and increasing on (-1, 0), f has a local minimum at x = -1. Since f is increasing on both (-1, 0) and (0, 1), f does not have a local extremum at x = 0, even though x = 0 is a critical point. Since f is increasing on (0, 1) and decreasing on (1, infinity), f has a local maximum at x = 1.

### Concavity and points of inflection
Beyond where a function increases or decreases, the shape of its graph also depends on whether the graph curves upward or curves downward; this is the concavity of the function. If a function f has a graph that curves upward, the slope of the tangent line increases as x increases, so f' is an increasing function and we say f is concave up. If the graph curves downward, the slope of the tangent line decreases as x increases, so f' is a decreasing function and we say f is concave down.

### Definition: concave up, concave down
Let f be a function that is differentiable over an open interval I. If f' is increasing over I, we say f is concave up over I. If f' is decreasing over I, we say f is concave down over I.

By the same reasoning used to relate the sign of a derivative to increasing and decreasing behavior, f' is increasing exactly when its own derivative f'' is positive, and f' is decreasing exactly when f'' is negative. This gives a test for concavity in terms of the second derivative.

### Theorem 4.10: Test for Concavity
Let f be a function that is twice differentiable over an interval I.
i. If f''(x) > 0 for all x in I, then f is concave up over I.
ii. If f''(x) < 0 for all x in I, then f is concave down over I.

A function f can switch concavity, but a continuous function can switch concavity only at a point x where f''(x) = 0 or f''(x) is undefined (note that f need not actually change concavity at such a point). To determine the intervals where a function is concave up and concave down, find all points where f''(x) = 0 or f''(x) is undefined, divide the domain of f into smaller intervals using these points as endpoints, and determine the sign of f'' over each interval.

### Definition: inflection point
If f is continuous at a and f changes concavity at a, the point (a, f(a)) is an inflection point of f.

**EXAMPLE 4.19 (Testing for Concavity).** For the function f(x) = x^3 - 6x^2 + 9x + 30, determine all intervals where f is concave up and all intervals where f is concave down. List all inflection points for f.

Solution:
The first derivative is f'(x) = 3x^2 - 12x + 9, so the second derivative is f''(x) = 6x - 12. Since f'' is defined for all real numbers x, concavity can only change where f''(x) = 0. Solving 6x - 12 = 0 gives x = 2 as the only place f could change concavity. Test the intervals (-infinity, 2) and (2, infinity) using test points x = 0 and x = 3. At x = 0, f''(0) = -12, which is negative, so f is concave down on (-infinity, 2). At x = 3, f''(3) = 6, which is positive, so f is concave up on (2, infinity). Since f changes concavity at x = 2, the point (2, f(2)) = (2, 32) is an inflection point.

Combining the first and second derivative together (as in the book's Table 4.1) summarizes what the derivatives tell us about the graph: if f' is positive and f'' is positive, f is increasing and concave up; if f' is positive and f'' is negative, f is increasing and concave down; if f' is negative and f'' is positive, f is decreasing and concave up; if f' is negative and f'' is negative, f is decreasing and concave down.

### The second derivative test
The first derivative test always locates local extrema, but the second derivative test can sometimes be a simpler method. Let f be a twice-differentiable function such that f'(a) = 0 and f'' is continuous over an open interval I containing a. If f''(a) < 0, then, since f'' is continuous, f''(x) < 0 for all x in I, so f' is a decreasing function over I; since f'(a) = 0, it follows that f'(x) > 0 for x < a and f'(x) < 0 for x > a, so by the first derivative test f has a local maximum at x = a. Symmetrically, if instead f'(b) = 0 and f''(b) > 0, then f' is increasing over an interval I containing b, so f'(x) < 0 for x < b and f'(x) > 0 for x > b, and by the first derivative test f has a local minimum at x = b.

### Theorem 4.11: Second Derivative Test
Suppose f'(c) = 0 and f'' is continuous over an interval containing c.
i. If f''(c) > 0, then f has a local minimum at c.
ii. If f''(c) < 0, then f has a local maximum at c.
iii. If f''(c) = 0, then the test is inconclusive.

When f''(c) = 0, f may have a local maximum, a local minimum, or neither at c. For example, the functions f(x) = x^4, f(x) = -x^4, and f(x) = x^3 all have a critical point at x = 0 with second derivative zero there, but f(x) = x^4 has a local minimum at x = 0, f(x) = -x^4 has a local maximum at x = 0, and f(x) = x^3 has no local extremum at x = 0.

**EXAMPLE 4.20 (Using the Second Derivative Test).** Use the second derivative to find the location of all local extrema for f(x) = x^5 - 5x^3.

Solution:
To apply the second derivative test, first find critical points c where f'(c) = 0. The derivative is f'(x) = 5x^4 - 15x^2 = 5x^2(x^2 - 3), so f'(x) = 0 when x = 0, +/-sqrt(3). The second derivative is f''(x) = 20x^3 - 30x = 10x(2x^2 - 3). Evaluate f'' at each critical point: at x = -sqrt(3), f''(-sqrt(3)) = -30*sqrt(3), which is negative, so f has a local maximum at x = -sqrt(3). At x = sqrt(3), f''(sqrt(3)) = 30*sqrt(3), which is positive, so f has a local minimum at x = sqrt(3). At x = 0, f''(0) = 0, so the second derivative test is inconclusive there. To determine whether f has a local extremum at x = 0, fall back on the first derivative test: evaluate the sign of f'(x) = 5x^2(x^2 - 3) at test points x = -1 and x = 1, both between -sqrt(3) and sqrt(3). Since f'(-1) < 0 and f'(1) < 0, f is decreasing on both sides of x = 0, so f does not have a local extremum at x = 0.

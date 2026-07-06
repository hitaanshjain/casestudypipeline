# OpenStax Calculus Volume 1, Section 4.4: The Mean Value Theorem

## Learning Objectives
- Explain the meaning of Rolle's theorem.
- Describe the significance of the Mean Value Theorem.
- State three important consequences of the Mean Value Theorem.

## Topic Keywords
- rolle's theorem
- mean value theorem
- secant line slope
- continuity hypothesis
- differentiability hypothesis
- constant function corollary
- constant difference theorem
- increasing function test
- decreasing function test

## Content

### Rolle's theorem
Informally, Rolle's theorem states that if the outputs of a differentiable function f are equal at the endpoints
of an interval, then there must be an interior point c where f'(c) = 0.

### Theorem: Rolle's Theorem
Let f be a continuous function over the closed interval [a, b] and differentiable over the open interval (a, b)
such that f(a) = f(b). There then exists at least one c in (a, b) such that f'(c) = 0.

Proof: Let k = f(a) = f(b). Three cases cover all possibilities. (1) If f(x) = k for all x in (a, b), then
f'(x) = 0 for all x in (a, b). (2) If there exists x in (a, b) with f(x) > k, then since f is continuous over the
closed, bounded interval [a, b], the extreme value theorem guarantees f has an absolute maximum; since some
interior value exceeds k, that maximum is greater than k and so cannot occur at either endpoint, meaning it occurs
at an interior point c in (a, b). Because f is differentiable at c and has a maximum there, Fermat's theorem gives
f'(c) = 0. (3) If there exists x in (a, b) with f(x) < k, the argument is analogous to case 2 with maximum
replaced by minimum.

An important point about Rolle's theorem is that the differentiability of f is critical: if f fails to be
differentiable even at a single point, the conclusion may not hold. For example, f(x) = |x| - 1 is continuous over
[-1, 1] with f(-1) = 0 = f(1), but f'(c) != 0 for any c in (-1, 1), because f is not differentiable at x = 0.

**EXAMPLE 4.14 (Using Rolle's Theorem).** For each of the following functions, verify that the function satisfies
the criteria stated in Rolle's theorem and find all values c in the given interval where f'(c) = 0.
a. f(x) = x^2 + 2x over [-2, 0]
b. f(x) = x^3 - 4x over [-2, 2]

Solution:
a. Since f is a polynomial, it is continuous and differentiable everywhere. In addition, f(-2) = 0 = f(0).
Therefore f satisfies the criteria of Rolle's theorem, so there exists at least one c in (-2, 0) such that
f'(c) = 0. Since f'(x) = 2x + 2 = 2(x + 1), f'(c) = 2(c + 1) = 0 implies c = -1.
b. As in part a, f is a polynomial and therefore continuous and differentiable everywhere. Also f(-2) = 0 = f(2),
so f satisfies the criteria of Rolle's theorem. Differentiating, f'(x) = 3x^2 - 4, so f'(c) = 0 when
x = +/- 2/sqrt(3). Both points lie in [-2, 2], so both satisfy the conclusion of Rolle's theorem.

### The Mean Value Theorem and its meaning
Rolle's theorem is a special case of the Mean Value Theorem: in Rolle's theorem f is defined on a closed interval
[a, b] with f(a) = f(b), and the Mean Value Theorem generalizes this by considering functions that do not
necessarily have equal values at the endpoints (it can be viewed as a slanted version of Rolle's theorem). The
Mean Value Theorem states that if f is continuous over [a, b] and differentiable over (a, b), then there exists a
point c in (a, b) such that the tangent line to the graph of f at c is parallel to the secant line connecting
(a, f(a)) and (b, f(b)).

### Theorem: The Mean Value Theorem
Let f be continuous over the closed interval [a, b] and differentiable over the open interval (a, b). Then there
exists at least one point c in (a, b) such that
f'(c) = (f(b) - f(a))/(b - a).

Proof: The proof follows from Rolle's theorem by introducing a function that satisfies its criteria. The line
connecting (a, f(a)) and (b, f(b)) has slope (f(b) - f(a))/(b - a) and passes through (a, f(a)), so its equation
is y = [(f(b) - f(a))/(b - a)](x - a) + f(a). Let g(x) denote the vertical difference between the point (x, f(x))
and the point (x, y) on that line: g(x) = f(x) - [(f(b) - f(a))/(b - a) (x - a) + f(a)]. Since the graph of f
intersects the secant line at x = a and x = b, g(a) = 0 = g(b). Because f is differentiable over (a, b) and
continuous over [a, b], so is g, so g satisfies the criteria of Rolle's theorem: there exists c in (a, b) with
g'(c) = 0. Since g'(x) = f'(x) - (f(b) - f(a))/(b - a), we get g'(c) = f'(c) - (f(b) - f(a))/(b - a) = 0, so
f'(c) = (f(b) - f(a))/(b - a).

**EXAMPLE 4.15 (Verifying that the Mean Value Theorem Applies).** For f(x) = sqrt(x) over the interval [0, 9],
show that f satisfies the hypothesis of the Mean Value Theorem, and therefore there exists at least one value
c in (0, 9) such that f'(c) is equal to the slope of the line connecting (0, f(0)) and (9, f(9)). Find these
values c guaranteed by the Mean Value Theorem.

Solution:
f(x) = sqrt(x) is continuous over [0, 9] and differentiable over (0, 9), so f satisfies the hypotheses of the
Mean Value Theorem. The derivative is f'(x) = 1/(2 sqrt(x)). The slope of the line connecting (0, f(0)) and
(9, f(9)) is (f(9) - f(0))/(9 - 0) = (sqrt(9) - sqrt(0))/9 = 3/9 = 1/3. We want c such that f'(c) = 1/3, that is,
1/(2 sqrt(c)) = 1/3. Solving for c gives c = 9/4. At this point the slope of the tangent line equals the slope of
the line joining the endpoints.

One application that helps illustrate the Mean Value Theorem involves velocity: if we drive a car for 1 h down a
straight road with average velocity 45 mph, and s(t), v(t) denote position and velocity for 0 <= t <= 1 (with s
differentiable), the Mean Value Theorem guarantees a time c in (0, 1) at which the instantaneous speed
v(c) = s'(c) = (s(1) - s(0))/(1 - 0) = 45 mph exactly.

**EXAMPLE 4.16 (Mean Value Theorem and Velocity).** If a rock is dropped from a height of 100 ft, its position t
seconds after it is dropped until it hits the ground is given by s(t) = -16t^2 + 100.
a. Determine how long it takes before the rock hits the ground.
b. Find the average velocity v_avg of the rock from when it is released until it hits the ground.
c. Find the time t guaranteed by the Mean Value Theorem when the instantaneous velocity of the rock is v_avg.

Solution:
a. The rock hits the ground when s(t) = 0. Solving -16t^2 + 100 = 0 gives t = +/- 5/2 sec; since t >= 0, the rock
hits the ground 5/2 sec after it is dropped.
b. v_avg = (s(5/2) - s(0))/(5/2 - 0) = (0 - 100)/(5/2) = -40 ft/sec.
c. We need a time t with v(t) = s'(t) = v_avg = -40 ft/sec. Since s is continuous over [0, 5/2] and differentiable
over (0, 5/2), the Mean Value Theorem guarantees a point c in (0, 5/2) such that
s'(c) = (s(5/2) - s(0))/(5/2 - 0) = -40. Since s'(t) = -32t, the equation reduces to s'(c) = -32c = -40, so
c = 5/4. Therefore 5/4 sec after the rock is dropped, its instantaneous velocity equals its average velocity over
the fall, -40 ft/sec.

### Corollaries of the Mean Value Theorem
Three corollaries of the Mean Value Theorem have important consequences used throughout the rest of the chapter.
We already know the derivative of any constant function is zero; the Mean Value Theorem lets us conclude that the
converse is also true.

### Corollary 1: Functions with a Derivative of Zero
Let f be differentiable over an interval I. If f'(x) = 0 for all x in I, then f(x) = constant for all x in I.

Proof: Since f is differentiable over I, f is continuous over I. Suppose f is not constant for all x in I. Then
there exist a, b in I with a != b and f(a) != f(b); choose notation so a < b. Then (f(b) - f(a))/(b - a) != 0.
Since f is differentiable, the Mean Value Theorem guarantees c in (a, b) with f'(c) = (f(b) - f(a))/(b - a), so
f'(c) != 0, contradicting the assumption that f'(x) = 0 for all x in I. Therefore f must be constant on I.

From Corollary 1, it follows that if two functions have the same derivative, they differ by, at most, a constant.

### Corollary 2: Constant Difference Theorem
If f and g are differentiable over an interval I and f'(x) = g'(x) for all x in I, then f(x) = g(x) + C for some
constant C.

Proof: Let h(x) = f(x) - g(x). Then h'(x) = f'(x) - g'(x) = 0 for all x in I. By Corollary 1, there is a constant
C such that h(x) = C for all x in I, so f(x) = g(x) + C for all x in I.

This fact matters because it means that for a given function f, if there exists a function F such that
F'(x) = f(x), then the only other functions with derivative equal to f are F(x) + C for some constant C.

The third corollary discusses when a function is increasing and when it is decreasing. A function f is increasing
over I if f(x1) < f(x2) whenever x1 < x2, and f is decreasing over I if f(x1) > f(x2) whenever x1 < x2. Using the
Mean Value Theorem, we can show that if the derivative of a function is positive, the function is increasing, and
if the derivative is negative, the function is decreasing.

### Corollary 3: Increasing and Decreasing Functions
Let f be continuous over the closed interval [a, b] and differentiable over the open interval (a, b).
i. If f'(x) > 0 for all x in (a, b), then f is an increasing function over [a, b].
ii. If f'(x) < 0 for all x in (a, b), then f is a decreasing function over [a, b].

Proof (part i; part ii is similar): Suppose f is continuous and differentiable over an interval I with f'(x) > 0
for all x in I. By way of contradiction, suppose f is not increasing on I. Then there exist a, b in I with a < b
but f(a) > f(b). Since f is differentiable over I, the Mean Value Theorem guarantees some c in (a, b) with
f'(c) = (f(b) - f(a))/(b - a). Since a < b, b - a > 0; since f(a) > f(b), f(b) - f(a) < 0, so
f'(c) = (f(b) - f(a))/(b - a) < 0. But f'(x) > 0 for all x in I, including c, a contradiction. So the assumption
that f is not increasing is false, and f must be increasing throughout I.

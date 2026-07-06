# OpenStax Calculus Volume 1, Section 1.1: Review of Functions

## Learning Objectives
- Use functional notation to evaluate a function.
- Determine the domain and range of a function.
- Draw the graph of a function.
- Find the zeros of a function.
- Recognize a function from a table of values.
- Make new functions from two or more given functions.
- Describe the symmetry properties of a function.

## Topic Keywords
- functions
- domain and range
- function notation
- piecewise-defined functions
- vertical line test
- zeros and intercepts
- increasing and decreasing functions
- function composition
- even and odd functions

## Content

### Definition: Function
A function consists of a set of inputs, a set of outputs, and a rule for assigning each
input to exactly one output. The set of inputs is called the domain of the function.
The set of outputs is called the range of the function. For a function f with domain D,
we use x to denote the input and y = f(x) to denote the output. x is the independent
variable and y is the dependent variable.

### Set-builder and interval notation
{x | x has some property} reads "the set of real numbers x such that x has some
property." For example (1, 5) = {x | 1 < x < 5}, [1, 5] = {x | 1 <= x <= 5},
[0, infinity) = {x | 0 <= x}, (-infinity, 0] = {x | x <= 0}, and
(-infinity, infinity) is the set of all real numbers. The symbols infinity and
-infinity are not real numbers; they indicate the set is unbounded in that direction.

### Piecewise-defined functions
A function may be defined by different formulas on different parts of its domain, e.g.

    f(x) = { 3x + 1,  x >= 2
            { x^2,     x < 2

To evaluate f at an input, first determine which piece applies, then substitute.

**EXAMPLE 1.1 (Evaluating Functions).** For f(x) = 3x^2 + 2x - 1, evaluate
a. f(-2)  b. f(sqrt(2))  c. f(a + h).

Solution:
a. f(-2) = 3(-2)^2 + 2(-2) - 1 = 12 - 4 - 1 = 7
b. f(sqrt(2)) = 3(sqrt(2))^2 + 2 sqrt(2) - 1 = 6 + 2 sqrt(2) - 1 = 5 + 2 sqrt(2)
c. f(a + h) = 3(a+h)^2 + 2(a+h) - 1 = 3(a^2 + 2ah + h^2) + 2a + 2h - 1
             = 3a^2 + 6ah + 3h^2 + 2a + 2h - 1

**EXAMPLE 1.2 (Finding Domain and Range).** Determine the (i) domain and
(ii) range of each function.
a. f(x) = (x - 4)^2 + 5
b. f(x) = sqrt(3x + 2) - 1
c. f(x) = 3/(x - 2)

Solution:
a. i. f(x) is a real number for any real x, so the domain is (-infinity, infinity).
   ii. Since (x-4)^2 >= 0, f(x) >= 5, so the range is a subset of {y | y >= 5}. Solving
   y = (x-4)^2 + 5 for x gives x - 4 = +/- sqrt(y - 5), which is defined whenever
   y >= 5. Hence the range is {y | y >= 5}.
b. i. We need 3x + 2 >= 0, so the domain is {x | x >= -2/3}.
   ii. Since sqrt(3x+2) >= 0, f(x) >= -1, so the range is a subset of {y | y >= -1}.
   Solving sqrt(3x+2) - 1 = y for x: sqrt(3x+2) = y+1, so 3x+2 = (y+1)^2, and
   x = (1/3)(y+1)^2 - 2/3, which is >= -2/3 whenever y >= -1. The range is
   {y | y >= -1}.
c. i. Since 3/(x-2) is defined when the denominator is nonzero, the domain is
   {x | x != 2}.
   ii. Setting y = 3/(x-2) and solving for x gives x = 3/y + 2, which exists for any
   y != 0. The range is {y | y != 0}.

### Zeros, intercepts, and the vertical line test
The zeros of a function f are the values of x where f(x) = 0; they are the x-intercepts
of the graph of f. The y-intercept, if it exists, is (0, f(0)). A function has at most one
y-intercept because it has exactly one output for each input.

Rule: Vertical Line Test. Given a function f, every vertical line that may be drawn
intersects the graph of f no more than once. If any vertical line intersects a set of
points more than once, the set of points does not represent a function.

Reference formulas used for building functions from context: area of a circle of
radius r is A(r) = pi r^2; height of an object thrown upward with initial velocity v0
from the ground is s(t) = -16t^2 + v0 t (t in seconds, s in feet); the balance after t
years of P dollars invested at continuously compounded annual rate r is A(t) = P e^(rt).

**EXAMPLE 1.3 (Finding Zeros and y-Intercepts).** Consider f(x) = -4x + 2.
a. Find all zeros of f.  b. Find the y-intercept.  c. Sketch the graph.

Solution:
a. Solve -4x + 2 = 0, giving one zero at x = 1/2.
b. The y-intercept is (0, f(0)) = (0, 2).
c. f is linear (form f(x) = mx + b) through (1/2, 0) and (0, 2).

**EXAMPLE 1.4 (Using Zeros and y-Intercepts to Sketch a Graph).** Consider
f(x) = sqrt(x + 3) + 1.
a. Find all zeros of f.  b. Find the y-intercept.  c. Sketch the graph.

Solution:
a. Solve sqrt(x+3) + 1 = 0, i.e. sqrt(x+3) = -1. Since sqrt(x+3) >= 0 for all x in the
domain, this equation has no solution, so f has no zeros.
b. The y-intercept is (0, f(0)) = (0, sqrt(3) + 1).
c. Using a table of values for x >= -3 (e.g. x = -3, -2, 1 giving f(x) = 1, 2, 3), and
noting the graph resembles y = sqrt(x) shifted left 3 and up 1, we sketch the curve
through (-3, 1), (-2, 2), (0, 1 + sqrt(3)), (1, 3).

### Increasing and decreasing functions
Definition: A function f is increasing on interval I if for all x1, x2 in I,
f(x1) <= f(x2) whenever x1 < x2 (strictly increasing if f(x1) < f(x2)). A function f is
decreasing on interval I if for all x1, x2 in I, f(x1) >= f(x2) whenever x1 < x2
(strictly decreasing if f(x1) > f(x2)). A function can be increasing on part of its
domain and decreasing on another part.

### Combining functions with mathematical operators
Given functions f and g: (f+g)(x) = f(x)+g(x), (f-g)(x) = f(x)-g(x),
(f*g)(x) = f(x)*g(x), (f/g)(x) = f(x)/g(x) (domain excludes zeros of g).

**EXAMPLE (Combining Functions).** Given f(x) = 2x - 3 and g(x) = x^2 - 1:
(f+g)(x) = x^2 + 2x - 4, domain (-infinity, infinity).
(f-g)(x) = -x^2 + 2x - 2, domain (-infinity, infinity).
(f*g)(x) = 2x^3 - 3x^2 - 2x + 3, domain (-infinity, infinity).
(f/g)(x) = (2x-3)/(x^2-1), domain {x | x != +/-1}.

### Function composition
Definition: Consider f with domain A and range B, and g with domain D and range E.
If B is a subset of D, the composite function (g compose f)(x) is the function with
domain A such that (g compose f)(x) = g(f(x)). In general (f compose g)(x) is not equal
to (g compose f)(x); order matters.

**EXAMPLE 1.9 (Application Involving a Composite Function).** A store advertises
20% off all merchandise; a coupon gives an additional 15% off any item, including sale
merchandise. For an item originally x dollars, what is the final price after applying
the coupon to the sale price?

Solution: The sale price is f(x) = 0.80x. Applying the coupon to a price of y dollars
gives g(y) = 0.85y. The final price is g(f(x)) = 0.85(0.80x) = 0.68x.

### Symmetry: even and odd functions
Definition: If f(-x) = f(x) for all x in the domain of f, then f is an even function; an
even function is symmetric about the y-axis. If f(-x) = -f(x) for all x in the domain of
f, then f is an odd function; an odd function is symmetric about the origin. For
example f(x) = x^2 is even because f(-x) = (-x)^2 = x^2 = f(x); f(x) = x^3 is odd
because f(-x) = (-x)^3 = -x^3 = -f(x).

The absolute value function is defined as f(x) = { -x, x < 0; x, x >= 0 }; it is even and
its range is {y | y >= 0}.

**EXAMPLE 1.10 (Even and Odd Functions).** Determine whether each function is
even, odd, or neither.
a. f(x) = -5x^4 + 7x^2 - 2
b. f(x) = 2x^5 - 4x + 5
c. f(x) = 3x/(x^2 + 1)

Solution: Evaluate f(-x) and compare to f(x) and -f(x).
a. f(-x) = -5x^4 + 7x^2 - 2 = f(x). f is even.
b. f(-x) = -2x^5 + 4x + 5, which equals neither f(x) nor -f(x) = -2x^5 + 4x - 5.
f is neither even nor odd.
c. f(-x) = -3x/(x^2+1) = -f(x). f is odd.

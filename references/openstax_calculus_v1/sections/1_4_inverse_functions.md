# OpenStax Calculus Volume 1, Section 1.4: Inverse Functions

## Learning Objectives
- Determine the conditions for when a function has an inverse.
- Use the horizontal line test to recognize when a function is one-to-one.
- Find the inverse of a given function.
- Draw the graph of an inverse function.
- Evaluate inverse trigonometric functions.

## Topic Keywords
- inverse functions
- one-to-one functions
- horizontal line test
- restricted domain
- inverse trigonometric functions
- graphing inverses

## Content

### Definition: inverse function
Given a function f with domain D and range R, its inverse function (if it exists) is
the function f^(-1) with domain R and range D such that f^(-1)(y) = x if f(x) = y. That
is, f^(-1)(f(x)) = x for all x in D, and f(f^(-1)(y)) = y for all y in R. Note f^(-1)(x)
is not the same as 1/f(x).

### Definition: one-to-one function
A function f is one-to-one if f(x1) != f(x2) whenever x1 != x2. Only a one-to-one
function can have an inverse, because an inverse must map each output back to a single
input.

Rule: Horizontal Line Test. A function f is one-to-one if and only if every horizontal
line intersects the graph of f no more than once. (The vertical line test checks
whether a graph is a function; the horizontal line test checks whether that function is
one-to-one.)

### Problem-solving strategy: finding an inverse function
1. Solve the equation y = f(x) for x.
2. Interchange the variables x and y and write y = f^(-1)(x).

**EXAMPLE 1.29 (Finding an Inverse Function).** Find the inverse of f(x) = 3x - 4.
State the domain and range of the inverse and verify f^(-1)(f(x)) = x.

Solution: Step 1: if y = 3x - 4, then 3x = y + 4 and x = (1/3)y + 4/3.
Step 2: rewrite as y = (1/3)x + 4/3, so f^(-1)(x) = (1/3)x + 4/3. Since the domain and
range of f are both (-infinity, infinity), so are the domain and range of f^(-1).
Verification: f^(-1)(f(x)) = (1/3)(3x-4) + 4/3 = x - 4/3 + 4/3 = x.

### Graphing inverse functions
If (a, b) is on the graph of f, then (b, a) is on the graph of f^(-1); the graph of
f^(-1) is the reflection of the graph of f about the line y = x.

### Restricting domains
A function that is not one-to-one on its full domain (e.g. f(x) = x^2) can be made
one-to-one by restricting its domain, which then has a genuine inverse. For example,
g(x) = x^2 restricted to [0, infinity) has inverse g^(-1)(x) = sqrt(x); h(x) = x^2
restricted to (-infinity, 0] has inverse h^(-1)(x) = -sqrt(x).

**EXAMPLE 1.31 (Restricting the Domain).** Consider f(x) = (x+1)^2.
a. Show f is not one-to-one on its natural domain.
b. Show f is one-to-one on the restricted domain [-1, infinity), and find a formula
for its inverse there.

Solution:
a. The graph of f is y = x^2 shifted left 1 unit; a horizontal line intersects it more
than once, so f is not one-to-one on all reals.
b. On [-1, infinity), f is one-to-one. The domain of f^(-1) is [0, infinity) (the range
of f) and the range of f^(-1) is [-1, infinity) (the domain of f). Solving y = (x+1)^2
for x gives x = -1 +/- sqrt(y); since x >= -1 we need x = -1 + sqrt(y). Interchanging x
and y: f^(-1)(x) = -1 + sqrt(x).

### Inverse trigonometric functions
Because the trigonometric functions are periodic, they are not one-to-one, so their
inverses are defined on restricted domains.
sin^(-1)(x) = y if and only if sin(y) = x and -pi/2 <= y <= pi/2 (domain -1<=x<=1).
cos^(-1)(x) = y if and only if cos(y) = x and 0 <= y <= pi (domain -1<=x<=1).
tan^(-1)(x) = y if and only if tan(y) = x and -pi/2 < y < pi/2 (domain all reals).
cot^(-1)(x) = y if and only if cot(y) = x and 0 < y < pi (domain all reals).
csc^(-1)(x) = y if and only if csc(y) = x and -pi/2 <= y <= pi/2, y != 0 (domain |x|>=1).
sec^(-1)(x) = y if and only if sec(y) = x and 0 <= y <= pi, y != pi/2 (domain |x|>=1).
The graph of each inverse trigonometric function is the reflection about y = x of the
corresponding restricted trigonometric function.

Composition facts: sin(sin^(-1)(y)) = y for -1<=y<=1, and sin^(-1)(sin(x)) = x only for
-pi/2<=x<=pi/2 (similarly cos(cos^(-1)(y)) = y for -1<=y<=1, and cos^(-1)(cos(x)) = x
only for 0<=x<=pi); outside the restricted interval the round-trip identity can fail
even though both expressions are individually defined.

**EXAMPLE 1.32 (Evaluating Expressions Involving Inverse Trigonometric
Functions).** Evaluate:
a. sin^(-1)(-sqrt(3)/2)  b. tan(tan^(-1)(-1/sqrt(3)))  c. cos^(-1)(cos(5pi/4))
d. sin^(-1)(cos(2pi/3))

Solution:
a. Need theta with sin(theta) = -sqrt(3)/2 and -pi/2<=theta<=pi/2: theta = -pi/3.
b. Since tan^(-1)(-1/sqrt(3)) = -pi/6 is in the domain of tan, tan(tan^(-1)(-1/sqrt(3)))
= -1/sqrt(3) directly by the composition identity.
c. cos(5pi/4) = -sqrt(2)/2; need theta with cos(theta) = -sqrt(2)/2 and 0<=theta<=pi:
theta = 3pi/4. So cos^(-1)(cos(5pi/4)) = 3pi/4 (not 5pi/4, since 5pi/4 is outside
[0, pi]).
d. cos(2pi/3) = -1/2; need theta with sin(theta) = -1/2 and -pi/2<=theta<=pi/2:
theta = -pi/6. So sin^(-1)(cos(2pi/3)) = -pi/6.

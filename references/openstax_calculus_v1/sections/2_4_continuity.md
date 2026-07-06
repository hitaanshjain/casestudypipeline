# OpenStax Calculus Volume 1, Section 2.4: Continuity

## Learning Objectives
- Explain the three conditions for continuity at a point.
- Describe three kinds of discontinuities.
- Define continuity on an interval.
- State the theorem for limits of composite functions.
- Provide an example of the intermediate value theorem.

## Topic Keywords
- continuity
- discontinuity
- removable discontinuity
- jump discontinuity
- infinite discontinuity
- continuity on an interval
- composite function theorem
- intermediate value theorem

## Content

### Definition: continuity at a point
A function f(x) is continuous at a point a if and only if the following three conditions
are satisfied:
i. f(a) is defined
ii. lim_(x->a) f(x) exists
iii. lim_(x->a) f(x) = f(a)
A function is discontinuous at a point a if it fails to be continuous at a.

### Problem-solving strategy: determining continuity at a point
1. Check to see if f(a) is defined. If f(a) is undefined, we need go no further; the
function is not continuous at a. If f(a) is defined, continue to step 2.
2. Compute lim_(x->a) f(x). In some cases this requires first computing lim_(x->a^-) f(x)
and lim_(x->a^+) f(x). If lim_(x->a) f(x) does not exist (that is, it is not a real
number), the function is not continuous at a and the problem is solved. If lim_(x->a) f(x)
exists, continue to step 3.
3. Compare f(a) and lim_(x->a) f(x). If lim_(x->a) f(x) != f(a), the function is not
continuous at a. If lim_(x->a) f(x) = f(a), the function is continuous at a.

### Theorem: continuity of polynomials and rational functions
Polynomials and rational functions are continuous at every point in their domains. (For
polynomials p(x) and q(x), lim_(x->a) p(x) = p(a) for every polynomial and every a, and
lim_(x->a) p(x)/q(x) = p(a)/q(a) as long as q(a) != 0; hence a rational function is
continuous at every point of its domain, i.e. everywhere except where its denominator is
zero.)

### Definition: types of discontinuities
If f(x) is discontinuous at a, then:
1. f has a removable discontinuity at a if lim_(x->a) f(x) exists. (Saying lim_(x->a) f(x)
exists means lim_(x->a) f(x) = L for some real number L.)
2. f has a jump discontinuity at a if lim_(x->a^-) f(x) and lim_(x->a^+) f(x) both exist
but lim_(x->a^-) f(x) != lim_(x->a^+) f(x). (Saying both exist means both are real-valued;
neither takes on the value +infinity or -infinity.)
3. f has an infinite discontinuity at a if lim_(x->a^-) f(x) = +infinity or -infinity,
and/or lim_(x->a^+) f(x) = +infinity or -infinity.
Intuitively, a removable discontinuity leaves a hole in the graph, a jump discontinuity
occurs where the two sides of the function do not meet up, and an infinite discontinuity
occurs at a vertical asymptote. Not all discontinuities fit neatly into these three
categories.

### Continuity from the right and from the left
A function f(x) is continuous from the right at a if lim_(x->a^+) f(x) = f(a).
A function f(x) is continuous from the left at a if lim_(x->a^-) f(x) = f(a).

### Continuity over an interval
A function is continuous over an open interval if it is continuous at every point in the
interval. A function f(x) is continuous over a closed interval [a, b] if it is continuous
at every point in (a, b), is continuous from the right at a, and is continuous from the
left at b. Analogously, a function f(x) is continuous over an interval of the form (a, b]
if it is continuous over (a, b) and is continuous from the left at b (similarly for
[a, b)). Continuity over other types of intervals is defined in a similar fashion.

### Theorem: composite function theorem
If f(x) is continuous at L and lim_(x->a) g(x) = L, then
lim_(x->a) f(g(x)) = f(lim_(x->a) g(x)) = f(L).

### Theorem: continuity of trigonometric functions
Trigonometric functions are continuous over their entire domains. (sin(x) and cos(x) are
continuous at every real number a; since the remaining trigonometric functions can be
expressed as quotients of sin(x) and cos(x), their continuity on their domains follows
from the quotient limit law.)

### Theorem: the intermediate value theorem
Let f be continuous over a closed, bounded interval [a, b]. If z is any real number
between f(a) and f(b), then there is a number c in [a, b] satisfying f(c) = z.

**EXAMPLE 2.27 (Determining Continuity at a Point, Condition 2).** Using the definition,
determine whether the function f(x) = { -x^2 + 4 if x <= 3; 4x - 8 if x > 3 } is
continuous at x = 3. Justify the conclusion.

Solution:
Step 1: f(3) = -(3^2) + 4 = -5, so f(3) is defined.
Step 2: Compute lim_(x->3) f(x) by computing both one-sided limits:
lim_(x->3^-) f(x) = -(3^2) + 4 = -5, and lim_(x->3^+) f(x) = 4(3) - 8 = 4.
Since -5 != 4, lim_(x->3) f(x) does not exist. Therefore f(x) is not continuous at 3.

**EXAMPLE 2.31 (Classifying a Discontinuity).** In Example 2.27 we showed that
f(x) = { -x^2 + 4 if x <= 3; 4x - 8 if x > 3 } is discontinuous at x = 3. Classify this
discontinuity as removable, jump, or infinite.

Solution: We showed f is discontinuous at 3 because lim_(x->3) f(x) does not exist.
However, lim_(x->3^-) f(x) = -5 and lim_(x->3^+) f(x) = 4 both exist as real numbers, so
the function has a jump discontinuity at 3.

**EXAMPLE 2.34 (Continuity over an Interval).** State the interval(s) over which the
function f(x) = sqrt(4 - x^2) is continuous.

Solution: From the limit laws, lim_(x->a) sqrt(4 - x^2) = sqrt(4 - a^2) for all values of a
in (-2, 2). We also know lim_(x->-2^+) sqrt(4 - x^2) = 0 exists and
lim_(x->2^-) sqrt(4 - x^2) = 0 exists. Therefore f(x) is continuous over the interval
[-2, 2].

**EXAMPLE 2.35 (Limit of a Composite Cosine Function).** Evaluate
lim_(x->pi/2) cos(x - pi/2).

Solution: The given function is a composite of cos(x) and x - pi/2. Since
lim_(x->pi/2) (x - pi/2) = 0 and cos(x) is continuous at 0, we may apply the composite
function theorem:
lim_(x->pi/2) cos(x - pi/2) = cos(lim_(x->pi/2) (x - pi/2)) = cos(0) = 1.

**EXAMPLE 2.36 (Application of the Intermediate Value Theorem).** Show that
f(x) = x - cos(x) has at least one zero.

Solution: Since f(x) = x - cos(x) is continuous over (-infinity, infinity), it is
continuous over any closed interval [a, b]. If f(a) and f(b) have opposite signs, the
Intermediate Value Theorem guarantees a real number c in (a, b) with f(c) = 0. Note that
f(0) = 0 - cos(0) = -1 < 0 and f(pi/2) = pi/2 - cos(pi/2) = pi/2 > 0. Since f(0) and
f(pi/2) have opposite signs, the Intermediate Value Theorem gives a real number c in
[0, pi/2] satisfying f(c) = 0. Therefore f(x) = x - cos(x) has at least one zero.

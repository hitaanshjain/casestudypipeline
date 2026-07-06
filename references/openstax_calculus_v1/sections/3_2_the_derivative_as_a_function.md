# OpenStax Calculus Volume 1, Section 3.2: The Derivative as a Function

## Learning Objectives
- Define the derivative function of a given function.
- Graph a derivative function from the graph of a given function.
- State the connection between derivatives and continuity.
- Describe three conditions for when a function does not have a derivative.
- Explain the meaning of a higher-order derivative.

## Topic Keywords
- derivative function
- differentiability
- differentiability implies continuity
- leibniz notation
- vertical tangent
- corner point
- higher-order derivatives
- acceleration

## Content

### Definition: The Derivative Function
Let f be a function. The derivative function, denoted by f', is the function whose domain
consists of those values of x such that the following limit exists:
    f'(x) = lim_(h->0) [f(x+h) - f(x)] / h.
A function f(x) is said to be differentiable at a if f'(a) exists. More generally, a
function is said to be differentiable on S if it is differentiable at every point in an
open set S, and a differentiable function is one in which f'(x) exists on its domain.

**EXAMPLE 3.12 (Finding the Derivative of a Quadratic Function).** Find the derivative of
the function f(x) = x^2 - 2x.

Solution: Substitute f(x+h) = (x+h)^2 - 2(x+h) and f(x) = x^2 - 2x into
f'(x) = lim_(h->0) [f(x+h)-f(x)]/h:
    f'(x) = lim_(h->0) [((x+h)^2 - 2(x+h)) - (x^2 - 2x)] / h.
Expand (x+h)^2 - 2(x+h) and simplify the numerator:
    = lim_(h->0) (2xh - 2h + h^2) / h.
Factor out h from the numerator and cancel the common factor of h:
    = lim_(h->0) (2x - 2 + h).
Evaluate the limit:
    = 2x - 2.

### Notation for the derivative
For y = f(x), each of the following notations represents the derivative of f(x): f'(x),
dy/dx, y', d/dx(f(x)). In place of f'(a) we may also use dy/dx|_(x=a). The dy/dx notation
(called Leibniz notation) is common in engineering and physics: the derivative of a
function at a point is the limit of the slopes of secant lines as the secant lines
approach the tangent line. The slopes of secant lines are often expressed as
Delta y / Delta x, where Delta y is the difference in the y-values corresponding to the
difference Delta x in the x-values. Thus the derivative, the instantaneous rate of change
of y with respect to x, is expressed as
    dy/dx = lim_(Delta x->0) Delta y / Delta x.

### Graphing a derivative from the graph of f
Since f'(x) gives the slope of the tangent line to f(x), the graphs of f and f' correspond
in predictable ways: where f is increasing, its tangent slopes are positive, so
f'(x) > 0; where f is decreasing, f'(x) < 0; where f has a horizontal tangent, f'(x) = 0.
For example, for f(x) = x^2 - 2x (above), f is decreasing for x < 1 with f'(x) < 0 there,
increasing for x > 1 with f'(x) > 0 there, and f has a horizontal tangent at x = 1 with
f'(1) = 0. As another example, if f is increasing on (-2, 3) (so f'(x) > 0 there) and
decreasing on (-infinity, -2) and (3, infinity) (so f'(x) < 0 there), then f has horizontal
tangents at x = -2 and x = 3, and f'(-2) = 0 and f'(3) = 0. A vertical tangent to f
produces an infinite or undefined value of f': for f(x) = sqrt(x), f'(x) = 1/(2 sqrt(x));
f'(0) is undefined and lim_(x->0^+) f'(x) = +infinity, corresponding to the vertical
tangent to f at x = 0.

### Theorem 3.1: Differentiability Implies Continuity
Let f(x) be a function and a be in its domain. If f(x) is differentiable at a, then f is
continuous at a.

Proof: If f(x) is differentiable at a, then f'(a) exists and
    f'(a) = lim_(x->a) [f(x) - f(a)] / (x - a).
We want to show that f(x) is continuous at a by showing that lim_(x->a) f(x) = f(a). Thus,
multiplying and dividing f(x) - f(a) by x - a,
    lim_(x->a) f(x) = lim_(x->a) (f(x) - f(a) + f(a))
                     = lim_(x->a) ( [f(x)-f(a)]/(x-a) * (x-a) ) + lim_(x->a) f(a)
                     = ( lim_(x->a) [f(x)-f(a)]/(x-a) ) * ( lim_(x->a) (x-a) ) + f(a)
                     = f'(a) * 0 + f(a) = f(a).
Therefore, since f(a) is defined and lim_(x->a) f(x) = f(a), we conclude that f is
continuous at a.

### The converse fails: continuity does not imply differentiability
A function that is continuous at a point need not be differentiable there; in fact, a
continuous function can fail to be differentiable at a point for any of several reasons.
- f(x) = |x| is continuous everywhere, but f'(0) = lim_(x->0) |x|/x does not exist, because
  lim_(x->0^-) |x|/x = -1 and lim_(x->0^+) |x|/x = 1. The graph has a sharp corner at
  x = 0.
- f(x) = x^(1/3) = cbrt(x) is continuous everywhere, but f'(0) = lim_(x->0) cbrt(x)/x =
  lim_(x->0) 1/cbrt(x^2) = +infinity, so f'(0) does not exist; the graph has a vertical
  tangent at x = 0.
- f(x) = x sin(1/x) for x != 0 and f(0) = 0 is continuous at 0, but f'(0) =
  lim_(x->0) [x sin(1/x) - 0]/(x-0) = lim_(x->0) sin(1/x), which does not exist because the
  slopes of the secant lines continuously change direction as they approach 0.

In summary: (1) if a function is not continuous at a point, it cannot be differentiable
there, since every differentiable function must be continuous, but a continuous function
may still fail to be differentiable; (2) a function fails to be differentiable at a point
where the left- and right-hand limits of the difference quotient disagree, producing a
sharp corner (as with |x|); (3) a function fails to be differentiable at a point with a
vertical tangent line (as with cbrt(x)); (4) a function may fail to be differentiable at a
point in other, more complicated ways as well (as with x sin(1/x)).

**EXAMPLE 3.14 (A Piecewise Function that is Continuous and Differentiable).** A toy
company designs a track for a toy car that starts along a parabolic curve and then
converts to a straight line: f(x) = (1/10)x^2 + bx + c if x < -10, and
f(x) = -(1/4)x + 5/2 if x >= -10, where x and f(x) are in inches. For the car to move
smoothly along the track, f must be both continuous and differentiable at -10. Find values
of b and c that make f both continuous and differentiable.

Solution: For f to be continuous at x = -10, lim_(x->-10^-) f(x) = f(-10). Since
lim_(x->-10^-) f(x) = (1/10)(-10)^2 - 10b + c = 10 - 10b + c and f(-10) = 5, we need
10 - 10b + c = 5, i.e. c = 10b - 5.
For f to be differentiable at -10, f'(-10) = lim_(x->-10) [f(x)-f(-10)]/(x+10) must exist,
so the left- and right-hand limits of this difference quotient must agree. From the left,
substituting c = 10b - 5 and factoring by grouping:
    lim_(x->-10^-) [f(x)-f(-10)]/(x+10) = lim_(x->-10^-) [(x+10)(x-10+10b)]/[10(x+10)]
                                         = b - 2.
From the right:
    lim_(x->-10^+) [f(x)-f(-10)]/(x+10) = lim_(x->-10^+) [-(x+10)/4]/(x+10) = -1/4.
Setting these equal, b - 2 = -1/4, so b = 7/4 and c = 10(7/4) - 5 = 25/2.

### Higher-order derivatives
The derivative of a function is itself a function, so we can find the derivative of a
derivative; the result is called the second derivative. Continuing to differentiate gives
the third derivative, fourth derivative, and so on; collectively these are called
higher-order derivatives. For a position function, the derivative is velocity, and the
derivative of velocity (the second derivative of position) is acceleration. The notation
for the higher-order derivatives of y = f(x) can be expressed in any of the following
forms:
    f''(x), f'''(x), f^(4)(x), ..., f^(n)(x)
    y''(x), y'''(x), y^(4)(x), ..., y^(n)(x)
    d^2y/dx^2, d^3y/dx^3, d^4y/dx^4, ..., d^n y/dx^n.
The notation d^2y/dx^2 may be viewed as an attempt to express d/dx(dy/dx) more compactly;
analogously, d/dx(d/dx(dy/dx)) = d/dx(d^2y/dx^2) = d^3y/dx^3.

**EXAMPLE 3.16 (Finding Acceleration).** The position of a particle along a coordinate axis
at time t (seconds) is given by s(t) = 3t^2 - 4t + 1 (meters). Find the function that
describes its acceleration at time t.

Solution: Since v(t) = s'(t) and a(t) = v'(t) = s''(t), first find the derivative of s(t)
from the definition:
    s'(t) = lim_(h->0) [s(t+h)-s(t)]/h = lim_(h->0) [3(t+h)^2 - 4(t+h) + 1 - (3t^2-4t+1)]/h
          = 6t - 4.
Next, take the derivative of s'(t) = 6t - 4 the same way:
    s''(t) = lim_(h->0) [s'(t+h)-s'(t)]/h = lim_(h->0) [6(t+h)-4-(6t-4)]/h = lim_(h->0) 6 = 6.
Thus, a = 6 m/s^2.

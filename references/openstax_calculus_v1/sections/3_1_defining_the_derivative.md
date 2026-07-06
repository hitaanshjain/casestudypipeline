# OpenStax Calculus Volume 1, Section 3.1: Defining the Derivative

## Learning Objectives
- Recognize the meaning of the tangent to a curve at a point.
- Calculate the slope of a tangent line.
- Identify the derivative as the limit of a difference quotient.
- Calculate the derivative of a given function at a point.
- Describe the velocity as a rate of change.
- Explain the difference between average velocity and instantaneous velocity.
- Estimate the derivative from a table of values.

## Topic Keywords
- difference quotient
- secant line
- tangent line
- limit definition of the derivative
- derivative at a point
- differentiation
- average velocity
- instantaneous velocity
- instantaneous rate of change

## Content

### Difference quotients and secant lines
For a function f defined on an interval I containing a, the slope of the secant line through (a, f(a)) and a nearby
point (x, f(x)) on the graph is m_sec = (f(x) - f(a))/(x - a). Equivalently, writing the nearby point as a + h for h
close to 0 (so the second point is (a+h, f(a+h))), the secant slope is m_sec = (f(a+h) - f(a))/h.

### Definition: difference quotient
Let f be a function defined on an interval I containing a. If x != a is in I, then Q = (f(x) - f(a))/(x - a) is a
difference quotient. Also, if h != 0 is chosen so that a+h is in I, then Q = (f(a+h) - f(a))/h is a difference
quotient with increment h.

As x approaches a (or, equivalently, as h approaches 0), the secant lines through (a, f(a)) and the nearby point
approach a single limiting line, the tangent line to f at a; the slope of that limiting line is the rate of change of f
at a.

### Definition: tangent line
Let f(x) be a function defined in an open interval containing a. The tangent line to f(x) at a is the line passing
through the point (a, f(a)) having slope
m_tan = lim_(x->a) (f(x) - f(a))/(x - a),
provided this limit exists. Equivalently, the tangent line to f(x) at a is the line passing through (a, f(a)) having
slope
m_tan = lim_(h->0) (f(a+h) - f(a))/h,
provided this limit exists.

**EXAMPLE 3.1 (Finding a Tangent Line).** Find an equation of the line tangent to the graph of f(x) = x^2 at
x = 3.

Solution:
First find the slope, using the definition: m_tan = lim_(x->3) (f(x) - f(3))/(x - 3) = lim_(x->3) (x^2 - 9)/(x - 3).
Factor the numerator to evaluate the limit: = lim_(x->3) (x-3)(x+3)/(x-3) = lim_(x->3) (x+3) = 6. Since
f(3) = 9, the tangent line passes through (3, 9). Using the point-slope equation with slope m = 6 and point
(3, 9): y - 9 = 6(x - 3), which simplifies to y = 6x - 9. (Recomputing with the equivalent h-based definition on
the same function and point gives the same slope, m_tan = 6, confirming the two forms are interchangeable.)

### Definition: the derivative of a function at a point
Let f(x) be a function defined in an open interval containing a. The derivative of the function f(x) at a, denoted
f'(a), is defined by
f'(a) = lim_(x->a) (f(x) - f(a))/(x - a),
provided this limit exists. Alternatively, the derivative of f(x) at a may also be defined as
f'(a) = lim_(h->0) (f(a+h) - f(a))/h.
The process of finding a derivative is called differentiation. Both defining limits give the same value whenever
they exist, so either may be used. The derivative can also be estimated numerically: evaluating the difference
quotient (f(x) - f(a))/(x - a) at values of x just below and just above a and observing the trend the values
approach gives an estimate of f'(a) (for example, tabulating (x^2 - 9)/(x - 3) at x = 2.9, 2.99, 2.999, 3.001, 3.01,
3.1 shows the values closing in on 6, matching f'(3) = 6 for f(x) = x^2).

**EXAMPLE 3.5 (Finding a Derivative).** For f(x) = 3x^2 - 4x + 1, find f'(2) by using the limit definition
f'(a) = lim_(x->a) (f(x) - f(a))/(x - a).

Solution:
Substitute the function and the value directly into the definition. Since f(2) = 3(2)^2 - 4(2) + 1 = 5,
f'(2) = lim_(x->2) [(3x^2 - 4x + 1) - 5]/(x - 2) = lim_(x->2) (3x^2 - 4x - 4)/(x - 2). Factor the numerator:
(3x^2-4x-4)/(x-2) = (x-2)(3x+2)/(x-2). Cancel the common factor (x - 2) and evaluate the limit:
f'(2) = lim_(x->2) (3x + 2) = 8.

### Velocities and rates of change
If s(t) is the position of an object moving along a coordinate axis, the average velocity of the object over the
interval [a, t] (for t > a, or [t, a] for t < a) is given by the difference quotient
v_ave = (s(t) - s(a))/(t - a).
As the values of t approach a, v_ave approaches the instantaneous velocity at a, denoted v(a), given by
v(a) = s'(a) = lim_(t->a) (s(t) - s(a))/(t - a).
The slope of the secant line through (a, s(a)) and (t, s(t)) is the average velocity over [a, t]; the slope of the
tangent line at a is the instantaneous velocity at a.

### Definition: instantaneous rate of change
The instantaneous rate of change of a function f(x) at a value a is its derivative f'(a). The same limiting
process that produces a tangent-line slope also produces velocity, acceleration, marginal cost, or any other
instantaneous rate of change, depending only on what f represents.

**EXAMPLE 3.7 (Estimating Velocity).** A lead weight on a spring is oscillating up and down so that its position
at time t (with respect to a fixed horizontal line) is s(t) = sin(t). Use a table of values to estimate v(0), the
instantaneous velocity at t = 0, then check the estimate using the limit definition.

Solution:
Compute average velocities (sin(t) - sin(0))/(t - 0) = sin(t)/t for values of t approaching 0 from both sides:
t = -0.1 gives 0.998334166; t = -0.01 gives 0.9999833333; t = -0.001 gives 0.999999833; t = 0.001 gives
0.999999833; t = 0.01 gives 0.9999833333; t = 0.1 gives 0.998334166. The values approach 1, so a good estimate
is v(0) = 1. Confirming with the limit definition: v(0) = s'(0) = lim_(t->0) (sin(t) - sin(0))/(t - 0) =
lim_(t->0) sin(t)/t = 1. Thus, in fact, v(0) = 1.

The section applies this same definition to further real-world instantaneous rates of change: estimating a car's
rate of change of velocity (its acceleration) from a table of speed-versus-time data, observing that the average
acceleration on shrinking time intervals approaching a fixed time is decreasing (Example 3.8); finding the
instantaneous rate of change of an oscillating indoor temperature T(t) = 0.4t^2 - 4t + 70 at a specific hour by
evaluating T'(3) = -1.6 directly from the limit definition (Example 3.9); and finding the rate of change of profit
P(x) = -0.01x^2 + 300x - 10,000 at a production level of x = 10,000 units by evaluating P'(10,000) = 100, and
concluding that since the rate of change of profit is positive there, the company should increase production
(Example 3.10).

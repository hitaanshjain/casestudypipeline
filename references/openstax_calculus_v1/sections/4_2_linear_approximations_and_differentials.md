# OpenStax Calculus Volume 1, Section 4.2: Linear Approximations and Differentials

## Learning Objectives
- Describe the linear approximation to a function at a point.
- Write the linearization of a given function.
- Draw a graph that illustrates the use of differentials to approximate the change in a quantity.
- Calculate the relative error and percentage error in using a differential approximation.

## Topic Keywords
- linear approximation
- linearization
- tangent line approximation
- differential
- propagated error
- relative error
- percentage error

## Content

### Linear approximation of a function at a point
Consider a function f that is differentiable at a point x = a. Recall that the tangent line to the graph of f at a is
given by the equation y = f(a) + f'(a)(x - a). For example, for f(x) = 1/x at a = 2, f'(x) = -1/x^2 so f'(2) = -1/4,
and the tangent line at a = 2 is y = 1/2 - (1/4)(x - 2). Because the graph of the tangent line stays close to the
graph of f for x near a, the tangent line's equation can be used to approximate f(x) for x near a: for x = 2.1 the
tangent line gives y = 1/2 - (1/4)(2.1-2) = 0.475, close to the actual value f(2.1) = 1/2.1 ~ 0.47619. For x values
far from a (e.g., x = 10), the tangent line no longer gives a good approximation.

In general, for a differentiable function f, f(x) ~ f(a) + f'(a)(x - a) for x near a.

### Definition: linear approximation and linearization
The linear function
L(x) = f(a) + f'(a)(x - a)
is called the linear approximation, or tangent line approximation, of f at x = a. This function L is also known as
the linearization of f at x = a.

**EXAMPLE 4.5 (Linear Approximation of sqrt(x)).** Find the linear approximation of f(x) = sqrt(x) at x = 9 and
use the approximation to estimate sqrt(9.1).

Solution:
Since the linear approximation is sought at x = 9, L(x) = f(9) + f'(9)(x - 9). We need f(9) and f'(9). Since
f(x) = sqrt(x), f(9) = sqrt(9) = 3. Since f'(x) = 1/(2 sqrt(x)), f'(9) = 1/(2 sqrt(9)) = 1/6. Therefore the linear
approximation is L(x) = 3 + (1/6)(x - 9). Using it, sqrt(9.1) = f(9.1) ~ L(9.1) = 3 + (1/6)(9.1 - 9) ~ 3.0167. (A
calculator gives sqrt(9.1) ~ 3.0166 to four decimal places, so the linear approximation is a good estimate for x
near 9.)

The same idea extends to other differentiable functions. The linear approximation of f(x) = sin(x) at x = pi/3
is L(x) = sqrt(3)/2 + (1/2)(x - pi/3); converting 62 degrees to 62*pi/180 radians and evaluating L there gives
sin(62 degrees) ~ sqrt(3)/2 + pi/180 ~ 0.88348 (Example 4.6). Linear approximations can also be used to estimate
roots and powers near 1: for f(x) = (1+x)^n at x = 0, f(0) = 1 and f'(0) = n, so L(x) = 1 + nx; taking n = 3 and
x = 0.01 estimates (1.01)^3 ~ L(0.01) = 1 + 3(0.01) = 1.03 (Example 4.7); the same idea extends to f(x) = (m+x)^n
to estimate roots and powers near a different number m.

### Differentials
When derivatives were first introduced, the Leibniz notation dy/dx represented the derivative of y with respect
to x, but the individual expressions dy and dx had no meaning on their own. Differentials give them meaning.
Suppose y = f(x) is a differentiable function. Let dx be an independent variable that can be assigned any nonzero
real number, and define the dependent variable dy by dy = f'(x) dx. The expressions dy and dx are called
differentials. Dividing both sides by dx recovers dy/dx = f'(x), the familiar expression for the derivative;
dy = f'(x) dx is known as the differential form of that expression.

**EXAMPLE 4.8 (Computing Differentials) (partial).** For y = x^2 + 2x, find dy and evaluate it when x = 3 and
dx = 0.1.

Solution:
Since f(x) = x^2 + 2x, f'(x) = 2x + 2, so dy = (2x + 2) dx. When x = 3 and dx = 0.1, dy = (2(3) + 2)(0.1) = 0.8.
(The book's part (b) applies the same differential-computation skill to y = cos(x), giving dy = -sin(x) dx and,
at the same point, dy = -0.1 sin(3); it is omitted here as a repeat of the same skill.)

Differentials connect directly back to linear approximations. If x changes from a to a + dx, the actual change
in y is Delta y = f(a + dx) - f(a). Since f(a + dx) ~ L(a + dx) for dx small, it follows that
Delta y = f(a + dx) - f(a) ~ L(a + dx) - f(a) = f'(a) dx = dy.
So the differential dy = f'(a) dx approximates the actual change Delta y in the function's output when the input
increases from a to a + dx (this is shown graphically as a small triangle formed by dx, dy, and Delta y sitting
against the tangent line at (a, f(a))).

**EXAMPLE 4.9 (Approximating Change with Differentials).** Let y = x^2 + 2x. Compute Delta y and dy at x = 3 if
dx = 0.1.

Solution:
The actual change in y as x changes from x = 3 to x = 3.1 is
Delta y = f(3.1) - f(3) = [(3.1)^2 + 2(3.1)] - [3^2 + 2(3)] = 0.81.
The approximate change in y is given by dy = f'(3) dx. Since f'(x) = 2x + 2, dy = f'(3) dx = (2(3)+2)(0.1) = 0.8,
which is close to the actual change of 0.81.

### Calculating the amount of error
Any measurement is prone to some error. Suppose the exact value of a measured quantity is a, but the measured
value is a + dx; the measurement error is dx (also written Delta x). The resulting error in a calculated quantity
f(x) is called a propagated error, given by Delta y = f(a + dx) - f(a). Since the exact value a is not known, the
propagated error cannot be found exactly, but if f is differentiable at a it can be approximated with a
differential: Delta y ~ dy = f'(a) dx; since a itself is unknown, the measured value is used in practice, giving
Delta y ~ dy ~ f'(a + dx) dx. For example, if a cube's side length is measured as 5 cm accurate to within
+/- 0.1 cm, then V = x^3 gives dV = 3x^2 dx, and using the measured side length, -3(5)^2(0.1) <= dV <= 3(5)^2(0.1),
i.e., -7.5 <= dV <= 7.5; checking directly against V(4.9) = 117.649 and V(5.1) = 132.651 compared with
V(5) = 125 shows the actual potential error is -7.351 <= Delta V <= 7.651, close to the differential estimate
(Example 4.10).

### Definition: relative error and percentage error
The measurement error dx (= Delta x) and the propagated error Delta y are absolute errors: they carry the same
units as the quantity itself. Given an absolute error Delta q for a particular quantity, the relative error is
Delta q / q, where q is the actual value of the quantity; the percentage error is the relative error expressed as
a percentage. Percentage error, not absolute error, indicates how precise a measurement really is: a 1-inch
absolute error measuring a 62-inch ladder height is only a 1/62 ~ 1.6% relative error, while a smaller 0.25-inch
absolute error measuring an 8-inch cardboard width is a larger 0.25/8 = 1/32 ~ 3.1% relative error.

**EXAMPLE 4.11 (Relative and Percentage Error).** An astronaut using a camera measures the radius of Earth as
4000 mi with an error of +/- 80 mi. Use differentials to estimate the relative and percentage error of using this
radius measurement to calculate the volume of Earth, assuming the planet is a perfect sphere.

Solution:
The radius measurement is accurate to within +/- 80, so -80 <= dr <= 80. Since the volume of a sphere is
V = (4/3) pi r^3, dV = 4 pi r^2 dr. Using the measured radius of 4000 mi, -4 pi (4000)^2 (80) <= dV <=
4 pi (4000)^2 (80). To estimate the relative error, consider dV/V; since the exact volume is unknown, use the
measured radius to estimate V ~ (4/3) pi (4000)^3, so the relative error satisfies
[-4 pi (4000)^2 (80)] / [4 pi (4000)^3 / 3] <= dV/V <= [4 pi (4000)^2 (80)] / [4 pi (4000)^3 / 3],
which simplifies to -0.06 <= dV/V <= 0.06. The relative error is 0.06 and the percentage error is 6%.

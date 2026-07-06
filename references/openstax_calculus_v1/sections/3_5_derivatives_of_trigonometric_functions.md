# OpenStax Calculus Volume 1, Section 3.5: Derivatives of Trigonometric Functions

## Learning Objectives
- Find the derivatives of the sine and cosine function.
- Find the derivatives of the standard trigonometric functions.
- Calculate the higher-order derivatives of the sine and cosine.

## Topic Keywords
- derivatives of sine and cosine
- limit definition of the derivative
- trigonometric limit identities
- product rule
- quotient rule
- derivatives of tangent, cotangent, secant, cosecant
- higher-order derivatives
- simple harmonic motion

## Content

Simple harmonic motion, the kind of motion associated with an object of mass oscillating
on a spring, can be described using sine or cosine functions. This section develops
derivative formulas for the six trigonometric functions: first sine and cosine, directly
from the limit definition of the derivative, and then the remaining four, by writing them
as quotients of sine and cosine and applying the quotient rule. Being able to
differentiate sine and cosine also lets us find the velocity and acceleration of simple
harmonic motion.

### Derivatives of the Sine and Cosine Functions
Recall the limit definition of the derivative, f'(x) = lim_(h->0) [f(x+h) - f(x)]/h, so
that for h very close to 0, f'(x) ~ [f(x+h) - f(x)]/h. Numerically approximating
d/dx(sin x) this way (using a small h such as h = 0.01) produces values that closely
match cos(x); carrying out the analogous approximation for d/dx(cos x) produces values
that closely match -sin(x). This motivates the following theorem.

### Theorem 3.8: The Derivatives of sin x and cos x
The derivative of the sine function is the cosine, and the derivative of the cosine
function is the negative sine:
d/dx(sin x) = cos x
d/dx(cos x) = -sin x

Proof (of d/dx(sin x) = cos x; the proof for cos x uses the same technique). The proof
needs two important trigonometric limits established in Section 2.3 by the squeeze
theorem, lim_(h->0) sin(h)/h = 1 and lim_(h->0) (cos(h) - 1)/h = 0, together with the
angle-sum identity sin(x + h) = sin(x)cos(h) + cos(x)sin(h). Then:
d/dx(sin x) = lim_(h->0) [sin(x+h) - sin x]/h
            = lim_(h->0) [sin x cos h + cos x sin h - sin x]/h
            = lim_(h->0) ( sin x * [(cos h - 1)/h] + cos x * [sin h / h] )
            = sin x * 0 + cos x * 1 = cos x.
Consequently, at points where sin x has a horizontal tangent, cos x = 0; where sin x is
increasing, cos x > 0; and where sin x is decreasing, cos x < 0.

**EXAMPLE 3.39 (Differentiating a Function Containing sin x).** Find the derivative of
f(x) = 5x^3 sin x.

Solution: Using the product rule,
f'(x) = d/dx(5x^3) * sin x + d/dx(sin x) * 5x^3 = 15x^2 * sin x + cos x * 5x^3.
After simplifying, f'(x) = 15x^2 sin x + 5x^3 cos x.

### Derivatives of Other Trigonometric Functions
Since the remaining four trigonometric functions can be written as quotients involving
sine, cosine, or both, the quotient rule gives formulas for their derivatives.

**EXAMPLE 3.42 (The Derivative of the Tangent Function).** Find the derivative of
f(x) = tan x.

Solution: Write tan x as the quotient of sin x and cos x: f(x) = tan x = sin x / cos x.
Apply the quotient rule:
f'(x) = [cos x * cos x - (-sin x) * sin x] / (cos x)^2 = (cos^2 x + sin^2 x) / cos^2 x.
Since cos^2 x + sin^2 x = 1 by the Pythagorean theorem, f'(x) = 1/cos^2 x, and using the
identity sec x = 1/cos x, this gives f'(x) = sec^2 x.

The remaining three derivatives can be obtained by similar techniques, giving the
following theorem.

### Theorem 3.9: Derivatives of tan x, cot x, sec x, and csc x
The derivatives of the remaining trigonometric functions are as follows:
d/dx(tan x) = sec^2 x
d/dx(cot x) = -csc^2 x
d/dx(sec x) = sec x tan x
d/dx(csc x) = -csc x cot x

### Higher-Order Derivatives
The higher-order derivatives of sin x and cos x follow a repeating pattern, which lets us
find any higher-order derivative of either function by locating its place in the pattern.

**EXAMPLE 3.45 (Finding Higher-Order Derivatives of y = sin x).** Find the first four
derivatives of y = sin x.

Solution: Each step is a direct application of Theorem 3.8:
y = sin x
dy/dx = cos x
d^2y/dx^2 = -sin x
d^3y/dx^3 = -cos x
d^4y/dx^4 = sin x.
Analysis: because the fourth derivative returns to sin x, the pattern repeats with period
4, so every fourth derivative of sin x equals sin x:
d^4/dx^4 (sin x) = d^8/dx^8 (sin x) = d^12/dx^12 (sin x) = ... = d^(4n)/dx^(4n) (sin x)
= sin x,
and, one step further along the pattern,
d^5/dx^5 (sin x) = d^9/dx^9 (sin x) = d^13/dx^13 (sin x) = ... = d^(4n+1)/dx^(4n+1)
(sin x) = cos x.
Any higher-order derivative of sin x (or, by the same reasoning, of cos x) can be found by
reducing its order modulo 4 and reading off the corresponding entry in this four-step
cycle.

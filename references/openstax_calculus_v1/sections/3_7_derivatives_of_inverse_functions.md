# OpenStax Calculus Volume 1, Section 3.7: Derivatives of Inverse Functions

## Learning Objectives
- Calculate the derivative of an inverse function.
- Recognize the derivatives of the standard inverse trigonometric functions.

## Topic Keywords
- inverse function theorem
- derivative of an inverse function
- power rule for rational exponents
- inverse trigonometric functions
- derivative of arcsin
- derivative of arctan
- chain rule with inverse trig functions
- tangent line to an inverse function

## Content

### The derivative of an inverse function
If f(x) is both invertible and differentiable, it seems reasonable that its inverse
f^(-1)(x) is also differentiable. This can be derived by recalling that
x = f(f^(-1)(x)) and differentiating both sides (applying the chain rule on the right),
which gives 1 = f'(f^(-1)(x)) * (f^(-1))'(x); solving for (f^(-1))'(x) gives
(f^(-1))'(x) = 1/f'(f^(-1)(x)).

### Theorem 3.11: Inverse Function Theorem
Let f(x) be a function that is both invertible and differentiable. Let y = f^(-1)(x) be
the inverse of f(x). For all x satisfying f'(f^(-1)(x)) != 0,
dy/dx = d/dx (f^(-1)(x)) = (f^(-1))'(x) = 1/f'(f^(-1)(x)).
Alternatively, if y = g(x) is the inverse of f(x), then g'(x) = 1/f'(g(x)).

**EXAMPLE 3.60 (Applying the Inverse Function Theorem).** Use the inverse function
theorem to find the derivative of g(x) = (x+2)/x. Compare the resulting derivative to
that obtained by differentiating the function directly.

Solution: The inverse of g(x) = (x+2)/x is f(x) = 2/(x-1). Since g'(x) = 1/f'(g(x)),
begin by finding f'(x): f'(x) = -2/(x-1)^2, so f'(g(x)) = -2/(g(x)-1)^2 =
-2/((x+2)/x - 1)^2 = -x^2/2. Finally, g'(x) = 1/f'(g(x)) = -2/x^2. Differentiating
g(x) = (x+2)/x directly with the quotient rule gives the same result, g'(x) = -2/x^2,
confirming the theorem.

### Theorem 3.12: Extending the Power Rule to Rational Exponents
The power rule may be extended to rational exponents. That is, if n is a positive
integer, then d/dx (x^(1/n)) = (1/n) x^((1/n)-1). Also, if n is a positive integer and m
is an arbitrary integer, then d/dx (x^(m/n)) = (m/n) x^((m/n)-1). Proof sketch: g(x) =
x^(1/n) is the inverse of f(x) = x^n; applying Theorem 3.11 with f'(x) = n x^(n-1) gives
g'(x) = 1/(n x^((n-1)/n)) = (1/n) x^((1/n)-1). Rewriting x^(m/n) as (x^(1/n))^m and
applying the chain rule extends this result to d/dx (x^(m/n)) = (m/n) x^((m/n)-1).

**EXAMPLE 3.62 (Applying the Power Rule to a Rational Power).** Find an equation of the
line tangent to the graph of y = x^(2/3) at x = 8.

Solution: First find dy/dx and evaluate it at x = 8. Since dy/dx = (2/3)x^(-1/3),
dy/dx|_(x=8) = (2/3)(8^(-1/3)) = (2/3)(1/2) = 1/3, so the slope of the tangent line at
x = 8 is 1/3. Substituting x = 8 into y = x^(2/3) gives y = 4, so the tangent line
passes through the point (8, 4). Substituting into the point-slope form gives the
tangent line y = (1/3)x + 4/3.

### Derivatives of inverse trigonometric functions
The derivatives of the inverse trigonometric functions are, perhaps surprisingly,
algebraic rather than trigonometric functions; this is the first place in the text
where the derivative of a function is not of the same type as the original function.
Each can be found from the inverse function theorem in the same way as above.

**EXAMPLE 3.63 (Derivative of the Inverse Sine Function).** Use the inverse function
theorem to find the derivative of g(x) = arcsin(x).

Solution: For x in the interval [-pi/2, pi/2], f(x) = sin(x) is the inverse of
g(x) = arcsin(x), so begin by finding f'(x). Since f'(x) = cos(x), f'(g(x)) =
cos(arcsin(x)) = sqrt(1-x^2), so g'(x) = d/dx arcsin(x) = 1/f'(g(x)) = 1/sqrt(1-x^2).
(To see cos(arcsin(x)) = sqrt(1-x^2): let theta = arcsin(x), so sin(theta) = x. For
0 < theta < pi/2, theta is an acute angle of a right triangle with hypotenuse 1 and
opposite side x, so by the Pythagorean theorem the adjacent side is sqrt(1-x^2) and
cos(theta) = sqrt(1-x^2); the cases theta <= 0 and the endpoints theta = +/-pi/2 give
the same identity, so cos(arcsin(x)) = sqrt(1-x^2) for all x in [-1,1].)

### Theorem 3.13: Derivatives of Inverse Trigonometric Functions
d/dx arcsin(x) = 1/sqrt(1-x^2)
d/dx arccos(x) = -1/sqrt(1-x^2)
d/dx arctan(x) = 1/(1+x^2)
d/dx arccot(x) = -1/(1+x^2)
d/dx arcsec(x) = 1/(|x| * sqrt(x^2-1))
d/dx arccsc(x) = -1/(|x| * sqrt(x^2-1))

**EXAMPLE 3.65 (Applying Differentiation Formulas to an Inverse Tangent Function).**
Find the derivative of f(x) = arctan(x^2).

Solution: Let g(x) = x^2, so g'(x) = 2x. Substituting into the arctan derivative rule,
f'(x) = [1/(1+(x^2)^2)] * (2x). Simplifying, f'(x) = 2x/(1+x^4).

**EXAMPLE 3.66 (Applying Differentiation Formulas to an Inverse Sine Function).** Find
the derivative of h(x) = x^2 * arcsin(x).

Solution: By the product rule, h'(x) = 2x*arcsin(x) + [1/sqrt(1-x^2)] * x^2.

**EXAMPLE 3.67 (Applying the Inverse Tangent Function).** The position of a particle at
time t is given by s(t) = arctan(1/t) for t >= 1/2. Find the velocity of the particle
at time t = 1.

Solution: Differentiate s(t) to find v(t): v(t) = s'(t) = [1/(1+(1/t)^2)] * (-1/t^2).
Simplifying, v(t) = -1/(t^2+1). Thus v(1) = -1/(1^2+1) = -1/2.

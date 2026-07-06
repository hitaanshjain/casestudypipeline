# OpenStax Calculus Volume 1, Section 5.5: Substitution

## Learning Objectives
- Use substitution to evaluate indefinite integrals.
- Use substitution to evaluate definite integrals.

## Topic Keywords
- substitution
- change of variables
- indefinite integral
- definite integral
- limits of integration
- chain rule
- u-substitution
- antiderivative

## Content

The Fundamental Theorem of Calculus gives a method to evaluate integrals without using Riemann sums, but the
drawback is that we must be able to find an antiderivative, and this is not always easy. This section covers a
technique called integration by substitution, which helps find antiderivatives when the integrand is the result
of a chain-rule derivative: an integrand of the form f[g(x)] g'(x) dx. For example, in the integral of
(x^2-3)^3 (2x) dx, we have f(x) = x^3, g(x) = x^2 - 3, and g'(x) = 2x, so f[g(x)] g'(x) = (x^2-3)^3 (2x), and the
integrand is in the required form. The method is called substitution because part of the integrand is replaced
with the variable u and part with du; it is also called change of variables because we are changing variables to
obtain an expression that is easier to integrate.

### Theorem 5.7: Substitution with Indefinite Integrals
Let u = g(x), where g'(x) is continuous over an interval, let f(x) be continuous over the corresponding range of
g, and let F(x) be an antiderivative of f(x). Then the integral of f[g(x)] g'(x) dx = the integral of f(u) du =
F(u) + C = F(g(x)) + C.

Proof: since F is an antiderivative of f, d/dx F(g(x)) = F'(g(x)) g'(x) = f[g(x)] g'(x). Integrating both sides
with respect to x gives the integral of f[g(x)] g'(x) dx = F(g(x)) + C. Substituting u = g(x) and du = g'(x) dx
into this equation gives the integral of f[g(x)] g'(x) dx = the integral of f(u) du = F(u) + C = F(g(x)) + C,
which is the theorem's claim.

Returning to the motivating example, let u = x^2 - 3, so du = 2x dx. Rewriting the integral entirely in terms of
u: the integral of (x^2-3)^3 (2x dx) = the integral of u^3 du. By the power rule for integrals, the integral of
u^3 du = u^4/4 + C. Substituting the original expression for x back into the solution: u^4/4 + C =
(x^2-3)^4/4 + C.

### Problem-Solving Strategy: Integration by Substitution
1. Look carefully at the integrand and select an expression g(x) within it to set equal to u; choose g(x) such
that g'(x) is also part of the integrand.
2. Substitute u = g(x) and du = g'(x) dx into the integral.
3. The integral should now be evaluable with respect to u alone; if it cannot be evaluated, go back and select a
different expression to use as u.
4. Evaluate the integral in terms of u.
5. Write the result in terms of x and the expression g(x).

**EXAMPLE 5.30 (Using Substitution to Find an Antiderivative).** Use substitution to find the antiderivative the
integral of 6x(3x^2+4)^4 dx.

Solution: Choose u = 3x^2 + 4, so du = 6x dx, and du is already present in the integrand. Rewrite the integral in
terms of u: the integral of 6x(3x^2+4)^4 dx = the integral of u^4 du. By the power rule for integrals, the
integral of u^4 du = u^5/5 + C. Substituting back, u^5/5 + C = (3x^2+4)^5/5 + C. This can be checked by
differentiating: letting y = (1/5)(3x^2+4)^5 + 1 (picking C = 1), y' = (1/5)(5)(3x^2+4)^4 (6x) = 6x(3x^2+4)^4,
which matches the original integrand.

Some substitutions require adjusting the constant multiplying du when it does not match the integrand exactly.
For instance, if u is chosen so that du = 2z dz, but the integrand contains only z dz, both sides of the du
equation can be multiplied by 1/2 to get (1/2)du = z dz; the resulting constant factor of 1/2 is then pulled
outside the integral sign before integrating in terms of u, and multiplied back in once the antiderivative in u
has been found.

**EXAMPLE 5.33 (Finding an Antiderivative Using u-Substitution).** Use substitution to find the antiderivative the
integral of x/sqrt(x-1) dx.

Solution: Let u = x - 1, so du = dx; this does not account for the x in the numerator of the integrand, so x must
be expressed in terms of u. Since u = x - 1, x = u + 1. Rewriting the integral in terms of u: the integral of
x/sqrt(x-1) dx = the integral of (u+1)/sqrt(u) du = the integral of (sqrt(u) + 1/sqrt(u)) du = the integral of
(u^(1/2) + u^(-1/2)) du. Integrating each term in the usual way: (2/3)u^(3/2) + 2u^(1/2) + C. Replacing u with the
original expression x - 1 and simplifying: (2/3)(x-1)^(3/2) + 2(x-1)^(1/2) + C =
(x-1)^(1/2) [(2/3)(x-1) + 2] + C = (x-1)^(1/2) [(2/3)x - 2/3 + 6/3] + C = (x-1)^(1/2) [(2/3)x + 4/3] + C =
(2/3)(x-1)^(1/2)(x+2) + C.

### Substitution for Definite Integrals
Substitution can also be used with definite integrals, but evaluating a definite integral by substitution
requires a change to the limits of integration: if the variable in the integrand is changed from x to u, the
limits of integration must change from values of x to the corresponding values of u = g(x), so that the final
numerical evaluation can be done directly in terms of u without first substituting back to x.

### Theorem 5.8: Substitution with Definite Integrals
Let u = g(x) and let g' be continuous over an interval [a, b], and let f be continuous over the range of
u = g(x). Then the integral from a to b of f(g(x)) g'(x) dx = the integral from g(a) to g(b) of f(u) du.

Justification: from the substitution rule for indefinite integrals, if F(x) is an antiderivative of f(x), the
integral of f(g(x)) g'(x) dx = F(g(x)) + C. Then the integral from a to b of f[g(x)] g'(x) dx = F(g(x)) evaluated
from x = a to x = b = F(g(b)) - F(g(a)) = F(u) evaluated from u = g(a) to u = g(b) = the integral from g(a) to
g(b) of f(u) du, which gives the desired result.

**EXAMPLE 5.34 (Using Substitution to Evaluate a Definite Integral).** Use substitution to evaluate the integral
from 0 to 1 of x^2 (1+2x^3)^5 dx.

Solution: Let u = 1 + 2x^3, so du = 6x^2 dx. Since the integrand includes one factor of x^2 and du = 6x^2 dx,
multiply both sides of the du equation by 1/6, giving (1/6)du = x^2 dx. To adjust the limits of integration: when
x = 0, u = 1 + 2(0) = 1, and when x = 1, u = 1 + 2(1) = 3. Then the integral from 0 to 1 of x^2(1+2x^3)^5 dx =
(1/6) times the integral from 1 to 3 of u^5 du. Evaluating this expression: (1/6) times the integral from 1 to 3
of u^5 du = (1/6)(u^6/6) evaluated from 1 to 3 = (1/36)[(3)^6 - (1)^6] = (1/36)[729 - 1] = 728/36 = 182/9.

Substitution may be only one of the techniques needed to evaluate a definite integral: an integrand involving
trigonometric functions may first need to be rewritten using a trigonometric identity before a substitution
applies, and once an antiderivative in u has been found there are two equally valid ways to finish. One option is
to change the limits of integration to values of u, as in Theorem 5.8, and evaluate the antiderivative directly
in terms of u. The other option is to skip changing the limits, substitute the original expression back in terms
of x once the antiderivative in u has been found, and evaluate at the original x limits; both approaches give the
same numerical result.

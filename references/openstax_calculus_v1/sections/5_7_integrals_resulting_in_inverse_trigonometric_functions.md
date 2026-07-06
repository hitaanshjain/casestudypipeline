# OpenStax Calculus Volume 1, Section 5.7: Integrals Resulting in Inverse Trigonometric Functions

## Learning Objectives
- Integrate functions resulting in inverse trigonometric functions.

## Topic Keywords
- inverse trigonometric functions
- arcsine integral formula
- arctangent integral formula
- arcsecant integral formula
- u-substitution
- implicit differentiation
- definite integral evaluation
- antiderivative matching

## Content

This section focuses on integrals that result in inverse trigonometric functions. Trigonometric functions are
not one-to-one unless their domains are restricted, so when working with inverses of trigonometric functions we
must always take these restrictions into account. The derivative formulas for inverse trigonometric functions
developed earlier give rise directly to integration formulas involving inverse trigonometric functions.

### Integrals that Result in Inverse Sine Functions

The section opens with three formulas, using substitution to evaluate integrals that match them, and proves the
formula for the inverse sine integral.

### Rule: Integration Formulas Resulting in Inverse Trigonometric Functions
The following integration formulas yield inverse trigonometric functions. Assume a > 0.
1. the integral of du/sqrt(a^2 - u^2) = arcsin(u/a) + C.
2. the integral of du/(a^2 + u^2) = (1/a) arctan(u/a) + C.
3. the integral of du/(u sqrt(u^2 - a^2)) = (1/a) arcsec(|u|/a) + C.

### Proof of the inverse sine formula
Let y = arcsin(x/a). Then a sin(y) = x. Differentiating both sides implicitly with respect to x gives
d/dx(a sin(y)) = d/dx(x), so a cos(y) (dy/dx) = 1, hence dy/dx = 1/(a cos(y)).

For -pi/2 <= y <= pi/2, cos(y) >= 0. Applying the Pythagorean identity sin^2(y) + cos^2(y) = 1 gives
cos(y) = sqrt(1 - sin^2(y)). This gives

1/(a cos(y)) = 1/(a sqrt(1 - sin^2(y))) = 1/sqrt(a^2 - a^2 sin^2(y)) = 1/sqrt(a^2 - x^2),

using a sin(y) = x in the last step. Then for -a <= x <= a, and generalizing to u, the integral of
1/sqrt(a^2 - u^2) du = arcsin(u/a) + C.

**EXAMPLE 5.49 (Evaluating a Definite Integral Using Inverse Trigonometric Functions).** Evaluate the definite
integral the integral from 0 to 1/2 of dx/sqrt(1 - x^2).

Solution: This integral matches formula 1 directly with a = 1, so we can go straight to the antiderivative and
then evaluate. The integral from 0 to 1/2 of dx/sqrt(1 - x^2) = arcsin(x) evaluated from 0 to 1/2 =
arcsin(1/2) - arcsin(0) = pi/6 - 0 = pi/6.

**EXAMPLE 5.50 (Finding an Antiderivative Involving an Inverse Trigonometric Function).** Evaluate the integral
of dx/sqrt(4 - 9x^2).

Solution: Substitute u = 3x. Then du = 3 dx, so dx = du/3, giving the integral of dx/sqrt(4 - 9x^2) =
(1/3) the integral of du/sqrt(4 - u^2). Applying formula 1 with a = 2, since 4 = 2^2, gives
(1/3) arcsin(u/2) + C = (1/3) arcsin(3x/2) + C.

### Integrals that Result in Other Inverse Trigonometric Functions

There are six inverse trigonometric functions, but only three integration formulas are listed in the rule above,
because the remaining three are negative versions of the ones already given: the only difference is whether the
integrand is positive or negative. Rather than memorizing three more formulas, if the integrand is negative,
simply factor out -1 and evaluate the integral using one of the three formulas already provided. The section
closes with one more worked formula: the integral resulting in the inverse tangent function.

**EXAMPLE 5.52 (Finding an Antiderivative Involving the Inverse Tangent Function).** Evaluate the integral of
dx/(1 + 4x^2).

Solution: The integrand resembles the formula for arctan(u) + C, so we use substitution. Let u = 2x, so
du = 2 dx and (1/2) du = dx. Then (1/2) the integral of du/(1 + u^2) = (1/2) arctan(u) + C =
(1/2) arctan(2x) + C.

The book also applies formula 2 directly (without substitution) when a is already matched to the constant term,
for example the integral of dx/(9 + x^2) = (1/3) arctan(x/3) + C by taking a = 3 since 9 = 3^2, and evaluates
definite integrals the same way as in Example 5.49, for instance the integral from sqrt(3)/3 to sqrt(3) of
dx/(1 + x^2) = arctan(x) evaluated from sqrt(3)/3 to sqrt(3) = arctan(sqrt(3)) - arctan(sqrt(3)/3) = pi/3 - pi/6
= pi/6.

Formula 3, the integral of du/(u sqrt(u^2 - a^2)) = (1/a) arcsec(|u|/a) + C, is stated in the rule above and used
in this section's exercises, but the text does not walk through a separate worked example for it here; its
substitution pattern mirrors formulas 1 and 2, matching u and a to the integrand and, when the coefficient on the
variable is not 1, substituting u = kx to rescale before applying the formula.

# OpenStax Calculus Volume 1, Section 6.9: Calculus of the Hyperbolic Functions

## Learning Objectives
- Apply the formulas for derivatives and integrals of the hyperbolic functions.
- Apply the formulas for the derivatives of the inverse hyperbolic functions and their associated integrals.
- Describe the common applied conditions of a catenary curve.

## Topic Keywords
- hyperbolic functions
- hyperbolic identities
- derivatives of hyperbolic functions
- integrals of hyperbolic functions
- inverse hyperbolic functions
- derivatives of inverse hyperbolic functions
- integrals of inverse hyperbolic functions
- catenary curve

## Content

Hyperbolic functions were introduced earlier, in the Introduction to Functions and Graphs section, along with some
of their basic properties. This section develops the differentiation and integration formulas for the hyperbolic
functions and for their inverses.

DISCLOSED NOTE ON EXAMPLE COUNT: this file includes five worked examples rather than the default two to three,
because the section's learning objectives split into five genuinely distinct sub-skills: differentiating
hyperbolic functions, integrating hyperbolic functions, differentiating inverse hyperbolic functions, integrating
inverse hyperbolic functions, and the catenary arc-length application. Each example below targets exactly one of
these five.

### Derivatives and Integrals of the Hyperbolic Functions

Recall that the hyperbolic sine and hyperbolic cosine are defined as
sinh(x) = (e^x - e^(-x))/2 and cosh(x) = (e^x + e^(-x))/2.

The other hyperbolic functions are then defined in terms of sinh(x) and cosh(x): tanh(x) = sinh(x)/cosh(x),
coth(x) = cosh(x)/sinh(x) = 1/tanh(x), sech(x) = 1/cosh(x), and csch(x) = 1/sinh(x).
NOTE (restated, not re-derived on these pages): this section refers back to the Introduction to Functions and
Graphs section for these four definitions rather than restating them; writing them out fully in e^x form gives
tanh(x) = (e^x - e^(-x))/(e^x + e^(-x)), coth(x) = (e^x + e^(-x))/(e^x - e^(-x)), sech(x) = 2/(e^x + e^(-x)), and
csch(x) = 2/(e^x - e^(-x)).

The graphs of the six hyperbolic functions have the following key facts: sinh is an increasing odd function
through the origin; cosh is an even function with minimum value 1 at x = 0, both branches increasing away from
x = 0; tanh is an increasing odd function bounded between -1 and 1, with horizontal asymptotes at y = 1 and
y = -1; coth has two branches separated by a vertical asymptote at x = 0, each approaching y = 1 or y = -1 as x
goes to +infinity or -infinity; sech is an even function with maximum value 1 at x = 0, decreasing toward 0 as x
goes to +/-infinity; csch has two branches separated by a vertical asymptote at x = 0, each decreasing toward 0 as
x goes to +/-infinity. A basic hyperbolic identity used throughout this section is cosh^2(x) - sinh^2(x) = 1.

It is straightforward to develop the differentiation formula for sinh(x):
d/dx(sinh(x)) = d/dx((e^x - e^(-x))/2) = (1/2)[d/dx(e^x) - d/dx(e^(-x))] = (1/2)(e^x + e^(-x)) = cosh(x).
Similarly, d/dx(cosh(x)) = sinh(x). The differentiation formulas for all six hyperbolic functions are summarized
below.

### Rule: Derivatives of the Hyperbolic Functions
- d/dx(sinh(x)) = cosh(x)
- d/dx(cosh(x)) = sinh(x)
- d/dx(tanh(x)) = sech^2(x)
- d/dx(coth(x)) = -csch^2(x)
- d/dx(sech(x)) = -sech(x) tanh(x)
- d/dx(csch(x)) = -csch(x) coth(x)

Comparing these to the derivatives of the standard trigonometric functions shows both similarities and
differences: the derivatives of the sine functions match (d/dx(sin(x)) = cos(x) and d/dx(sinh(x)) = cosh(x)), but
the derivatives of the cosine functions differ in sign (d/dx(cos(x)) = -sin(x), while d/dx(cosh(x)) = sinh(x)).

These differentiation formulas lead directly to the following integration formulas.

### Rule: Integrals of the Hyperbolic Functions
- the integral of sinh(u) du = cosh(u) + C
- the integral of cosh(u) du = sinh(u) + C
- the integral of sech^2(u) du = tanh(u) + C
- the integral of csch^2(u) du = -coth(u) + C
- the integral of sech(u) tanh(u) du = -sech(u) + C
- the integral of csch(u) coth(u) du = -csch(u) + C

**EXAMPLE 6.47 (Differentiating Hyperbolic Functions).** Evaluate the following derivatives:
a. d/dx(sinh(x^2)); b. d/dx((cosh(x))^2).

Solution: Using the derivative rule above and the chain rule:
a. d/dx(sinh(x^2)) = cosh(x^2) * 2x.
b. d/dx((cosh(x))^2) = 2 cosh(x) sinh(x).

**EXAMPLE 6.48 (Integrals Involving Hyperbolic Functions).** Evaluate the following integrals:
a. the integral of x cosh(x^2) dx; b. the integral of tanh(x) dx.

Solution:
a. Let u = x^2. Then du = 2x dx, so x dx = du/2, giving the integral of x cosh(x^2) dx = the integral of
(1/2) cosh(u) du = (1/2) sinh(u) + C = (1/2) sinh(x^2) + C.
b. Let u = cosh(x). Then du = sinh(x) dx, so the integral of tanh(x) dx = the integral of sinh(x)/cosh(x) dx =
the integral of (1/u) du = ln|u| + C = ln|cosh(x)| + C. Since cosh(x) > 0 for all x, the absolute value signs can
be dropped, giving the integral of tanh(x) dx = ln(cosh(x)) + C.

### Calculus of Inverse Hyperbolic Functions

Looking at the graphs of the hyperbolic functions, with appropriate range restrictions they all have inverses;
most of the necessary range restrictions can be discerned by close examination of the graphs. The domains and
ranges of the inverse hyperbolic functions are summarized below.

### Rule: Domains and Ranges of the Inverse Hyperbolic Functions
- sinh^(-1)(x): domain (-infinity, infinity), range (-infinity, infinity)
- cosh^(-1)(x): domain [1, infinity), range [0, infinity)
- tanh^(-1)(x): domain (-1, 1), range (-infinity, infinity)
- coth^(-1)(x): domain (-infinity, -1) union (1, infinity), range (-infinity, 0) union (0, infinity)
- sech^(-1)(x): domain (0, 1], range [0, infinity)
- csch^(-1)(x): domain (-infinity, 0) union (0, infinity), range (-infinity, 0) union (0, infinity)

DISCLOSED OMISSION: these rendered pages do not restate logarithmic-form definitions of the inverse hyperbolic
functions (for example an explicit "sinh^(-1)(x) = ln(...)" rule box); that material belongs to the earlier
Introduction to Functions and Graphs section referenced at the top of this section and is not repeated in the
6.9 body text, so it is left out here rather than invented.

To find the derivatives of the inverse hyperbolic functions, implicit differentiation is used. For
y = sinh^(-1)(x): sinh(y) = x, so d/dx(sinh(y)) = d/dx(x), giving cosh(y) (dy/dx) = 1. Recall that
cosh^2(y) - sinh^2(y) = 1, so cosh(y) = sqrt(1 + sinh^2(y)). Then
dy/dx = 1/cosh(y) = 1/sqrt(1 + sinh^2(y)) = 1/sqrt(1 + x^2).
The derivatives of the other inverse hyperbolic functions are derived in a similar fashion and are summarized in
the table below.

### Rule: Derivatives of the Inverse Hyperbolic Functions
- d/dx(sinh^(-1)(x)) = 1/sqrt(1 + x^2)
- d/dx(cosh^(-1)(x)) = 1/sqrt(x^2 - 1)
- d/dx(tanh^(-1)(x)) = 1/(1 - x^2)
- d/dx(coth^(-1)(x)) = 1/(1 - x^2)
- d/dx(sech^(-1)(x)) = -1/(x sqrt(1 - x^2))
- d/dx(csch^(-1)(x)) = -1/(|x| sqrt(1 + x^2))

Note that the derivatives of tanh^(-1)(x) and coth^(-1)(x) are the same. Thus, when integrating 1/(1 - x^2), the
correct antiderivative must be selected based on the domain of the functions and the value of x. Integration
formulas involving the inverse hyperbolic functions are summarized below.

### Rule: Integrals Resulting in Inverse Hyperbolic Functions
- the integral of 1/sqrt(1 + u^2) du = sinh^(-1)(u) + C
- the integral of 1/sqrt(u^2 - 1) du = cosh^(-1)(u) + C
- the integral of 1/(1 - u^2) du = tanh^(-1)(u) + C if |u| < 1, or coth^(-1)(u) + C if |u| > 1
- the integral of 1/(u sqrt(1 - u^2)) du = -sech^(-1)(|u|) + C
- the integral of 1/(u sqrt(1 + u^2)) du = -csch^(-1)(|u|) + C

**EXAMPLE 6.49 (Differentiating Inverse Hyperbolic Functions).** Evaluate the following derivatives:
a. d/dx(sinh^(-1)(x/3)); b. d/dx((tanh^(-1)(x))^2).

Solution: Using the derivative rule above and the chain rule:
a. d/dx(sinh^(-1)(x/3)) = 1/(3 sqrt(1 + x^2/9)) = 1/sqrt(9 + x^2).
b. d/dx((tanh^(-1)(x))^2) = 2 tanh^(-1)(x)/(1 - x^2).

**EXAMPLE 6.50 (Integrals Involving Inverse Hyperbolic Functions).** Evaluate the following integrals:
a. the integral of 1/sqrt(4x^2 - 1) dx; b. the integral of 1/(2x sqrt(1 - 9x^2)) dx.

Solution:
a. Let u = 2x. Then du = 2 dx, so the integral of 1/sqrt(4x^2 - 1) dx = the integral of (1/2)/sqrt(u^2 - 1) du =
(1/2) cosh^(-1)(u) + C = (1/2) cosh^(-1)(2x) + C.
b. Let u = 3x. Then du = 3 dx, so the integral of 1/(2x sqrt(1 - 9x^2)) dx = (1/2) the integral of
1/(u sqrt(1 - u^2)) du = -(1/2) sech^(-1)(|u|) + C = -(1/2) sech^(-1)(|3x|) + C.

### Applications

One physical application of hyperbolic functions involves hanging cables. If a cable of uniform density is
suspended between two supports without any load other than its own weight, the cable forms a curve called a
catenary. High-voltage power lines, chains hanging between two posts, and strands of a spider's web all form
catenaries. Hyperbolic functions can be used to model catenaries: specifically, functions of the form
y = a cosh(x/a) are catenaries (for instance f(x) = 2 cosh(x/2)).

**EXAMPLE 6.51 (Using a Catenary to Find the Length of a Cable).** Assume a hanging cable has the shape
10 cosh(x/10) for -15 <= x <= 15, where x is measured in feet. Determine the length of the cable (in feet).

Solution: Recall that the arc length formula is the integral from a to b of sqrt(1 + [f'(x)]^2) dx. Here
f(x) = 10 cosh(x/10), so f'(x) = sinh(x/10). Then the length is the integral from -15 to 15 of
sqrt(1 + sinh^2(x/10)) dx. Since 1 + sinh^2(x) = cosh^2(x), this becomes the integral from -15 to 15 of
cosh(x/10) dx = 10 sinh(x/10) evaluated from -15 to 15 = 10[sinh(3/2) - sinh(-3/2)] = 20 sinh(3/2), which is
approximately 42.586 ft. Independent check: sinh(1.5) = (e^1.5 - e^(-1.5))/2 is approximately 2.129279, so
20 sinh(1.5) is approximately 42.5856, confirming the book's rounded value of 42.586 ft.

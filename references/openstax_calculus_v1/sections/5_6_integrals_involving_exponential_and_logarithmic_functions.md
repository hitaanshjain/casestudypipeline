# OpenStax Calculus Volume 1, Section 5.6: Integrals Involving Exponential and Logarithmic Functions

## Learning Objectives
- Integrate functions involving exponential functions.
- Integrate functions involving logarithmic functions.

## Topic Keywords
- exponential integration
- integral of a^x
- integral of 1/x
- logarithmic integration
- u-substitution
- change of limits of integration
- population growth model
- price-demand function

## Content

Exponential and logarithmic functions are used to model population growth, cell growth, and financial growth, as
well as depreciation, radioactive decay, and resource consumption. This section develops the integration formulas
for these functions; most of the work pairs a basic differentiation formula with u-substitution.

### Integrals of Exponential Functions

The exponential function y = e^x is its own derivative and its own antiderivative, which makes it one of the most
efficient functions under the operations of calculus.

### Rule: Integrals of Exponential Functions (5.21)
Exponential functions can be integrated using the following formulas.
- the integral of e^x dx = e^x + C
- the integral of a^x dx = a^x/ln(a) + C

A common mistake is to treat the exponent on e the same way an exponent in a polynomial expression is treated;
the power rule for integrals does not apply to the exponent on e. This is especially easy to get wrong when an
expression mixes an exponential factor with a polynomial factor, so it is worth double-checking which rule
applies to which piece of an integrand before integrating.

**Example 5.39 (Using Substitution with an Exponential Function, full).** Use substitution to evaluate the
indefinite integral: the integral of 3x^2 e^(2x^3) dx.

Solution: Let u equal the expression in the exponent on e, so u = 2x^3 and du = 6x^2 dx. The original integrand
contains a factor of 3x^2, not 6x^2, so multiply both sides of the du equation by 1/2 to make the integrand in u
match the integrand in x: (1/2) du = 3x^2 dx. Then the integral of 3x^2 e^(2x^3) dx =
(1/2) * (the integral of e^u du) = (1/2) e^u + C. Substituting the original expression in x back in,
the integral of 3x^2 e^(2x^3) dx = (1/2) e^(2x^3) + C.

When a definite integral is evaluated by substitution, the limits of integration must also be converted from x
to u before the antiderivative is evaluated between them. The section demonstrates this on the integral of
e^(1-x) dx from x = 1 to x = 2 (letting u = 1 - x converts the limits to u = 0 and u = -1, and evaluating gives
1 - 1/e) and again on the integral of e^(1/x)/x^2 dx from x = 1 to x = 2 (letting u = x^(-1) converts the limits
to u = 1 and u = 1/2; since the converted limits come out with the larger number first, the integral is
multiplied by -1 and the limits are swapped back into increasing order before evaluating, giving e - sqrt(e)).

Exponential growth applications typically supply a rate function and an initial amount, then ask for the total
accumulated amount after integrating the rate.

**Example 5.42 (Growth of Bacteria in a Culture, full).** Suppose the rate of growth of bacteria in a Petri dish
is given by q(t) = 3^t, where t is measured in hours and q(t) is measured in thousands of bacteria per hour. If a
culture starts with 10,000 bacteria, find a function Q(t) that gives the number of bacteria in the Petri dish at
any time t. How many bacteria are in the dish after 2 hours?

Solution: Integrating the rate function with the a^x rule, Q(t) = the integral of 3^t dt = 3^t/ln(3) + C. The
culture starts with 10,000 bacteria, and Q(t) is measured in thousands, so the initial condition is Q(0) = 10:
10 = 3^0/ln(3) + C = 1/ln(3) + C, so C = 10 - 1/ln(3), which is approximately 10 - 0.910 = 9.090. This gives
Q(t) = 3^t/ln(3) + 9.090. At t = 2, Q(2) = 3^2/ln(3) + 9.090 = 9/ln(3) + 9.090, which is approximately
8.192 + 9.090 = 17.282. Since Q(t) is measured in thousands of bacteria, there are 17,282 bacteria in the dish
after 2 hours.

A similar rate-and-initial-value setup appears for a marginal price-demand function, the derivative of a price
function with respect to quantity: integrating the marginal price-demand function and solving for the constant
of integration from one known price-quantity pair recovers the full price-demand equation, which can then be
evaluated at any other quantity to find the price the market will support at that level of demand.

### Integrals Involving Logarithmic Functions

Integrating a function of the form f(x) = x^(-1) produces the absolute value of the natural log function, since
ln|x| is an antiderivative of 1/x everywhere on its domain (x != 0), not only for x > 0. Integral formulas for
ln(x) and for log_a(x) follow the same substitution pattern used for exponential integrands.

### Rule: Integration Formulas Involving Logarithmic Functions (5.22)
The following formulas can be used to evaluate integrals involving logarithmic functions.
- the integral of x^(-1) dx = ln|x| + C
- the integral of ln(x) dx = x ln(x) - x + C = x(ln(x) - 1) + C
- the integral of log_a(x) dx = [x/ln(a)] * (ln(x) - 1) + C

**Example 5.46 (Finding an Antiderivative of a Rational Function, full).** Find the antiderivative of
(2x^3 + 3x)/(x^4 + 3x^2).

Solution: Rewrite the integrand as (2x^3 + 3x)(x^4 + 3x^2)^(-1) and use substitution. Let u = x^4 + 3x^2, so
du = (4x^3 + 6x) dx = 2(2x^3 + 3x) dx, and therefore (1/2) du = (2x^3 + 3x) dx. Rewriting the integrand in u
gives the integral of (2x^3 + 3x)(x^4 + 3x^2)^(-1) dx = (1/2) * (the integral of u^(-1) du) = (1/2) ln|u| + C =
(1/2) ln|x^4 + 3x^2| + C.

The same u^(-1) pattern applies whenever substitution reduces an integrand to a constant multiple of 1/u, even
when the original integrand is built from other function families rather than a rational function of x. The
section shows this for a rational expression in a trigonometric function, the integral of sin(x)/(1+cos(x)) dx
from x = 0 to x = pi/2: letting u = 1 + cos(x) gives du = -sin(x) dx, converts the limits to u = 2 and u = 1, and
reduces the integral to the integral of u^(-1) du evaluated from u = 1 to u = 2, which is ln(2) - ln(1) = ln(2).

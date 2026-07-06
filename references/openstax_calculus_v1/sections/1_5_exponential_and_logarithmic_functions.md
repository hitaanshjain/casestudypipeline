# OpenStax Calculus Volume 1, Section 1.5: Exponential and Logarithmic Functions

## Learning Objectives
- Identify the form of an exponential function.
- Explain the difference between the graphs of x^b and b^x.
- Recognize the significance of the number e.
- Identify the form of a logarithmic function.
- Explain the relationship between exponential and logarithmic functions.
- Describe how to calculate a logarithm to a different base.
- Identify the hyperbolic functions, their graphs, and basic identities.

## Topic Keywords
- exponential functions
- laws of exponents
- the number e
- logarithmic functions
- properties of logarithms
- change of base
- hyperbolic functions
- inverse hyperbolic functions

## Content

### Exponential functions
Any function of the form f(x) = b^x, with base b > 0, b != 1, and variable exponent x,
is an exponential function (this differs from a power function f(x) = x^b, which has a
constant exponent). For b > 1, b^x is increasing on (-infinity, infinity), with
b^x -> infinity as x -> infinity and b^x -> 0 as x -> -infinity. For 0 < b < 1, b^x is
decreasing, with the opposite end behavior. The domain of b^x is all reals; the range
is (0, infinity).

Rule: Laws of Exponents. For constants a > 0, b > 0 and all x, y:
b^x b^y = b^(x+y); b^x/b^y = b^(x-y); (b^x)^y = b^(xy); (ab)^x = a^x b^x;
a^x/b^x = (a/b)^x.

### The number e
Compounding an investment P at annual rate r, n times per year, for t years gives
A(t) = P(1 + r/n)^(nt). Letting n -> infinity (continuous compounding) leads to the
definition of e as the limit of (1 + 1/m)^m as m -> infinity; e ~ 2.718282. Continuous
compounding gives A(t) = P e^(rt). The natural exponential function f(x) = e^x is the
only exponential b^x whose tangent line at x = 0 has slope 1.

**EXAMPLE 1.35 (Compounding Interest).** $500 is invested at an annual rate of
5.5%, compounded continuously.
a. Find A(t). b. Find the amount after 10 years and after 20 years.

Solution: a. A(t) = P e^(rt) with P = 500, r = 0.055, so A(t) = 500 e^(0.055t).
b. A(10) = 500 e^(0.55) ~ $866.63. A(20) = 500 e^(1.1) ~ $1,502.08.

### Logarithmic functions
Since f(x) = b^x is one-to-one with domain (-infinity,infinity) and range (0,infinity),
it has an inverse, the logarithmic function log_b(x), with domain (0,infinity) and
range (-infinity,infinity), satisfying y = log_b(x) if and only if b^y = x. The natural
logarithm ln(x) = log_e(x). Since b^x and log_b(x) are inverses, log_b(b^x) = x and
b^(log_b(x)) = x; their graphs are symmetric about y = x.

Rule: Properties of Logarithms. For a, b, c > 0, b != 1, and any real r:
log_b(ac) = log_b(a) + log_b(c) (product); log_b(a/c) = log_b(a) - log_b(c) (quotient);
log_b(a^r) = r log_b(a) (power).

Rule: Change-of-Base Formulas. For a > 0, b > 0, a,b != 1: a^x = b^(x log_b(a)) for
any real x (reduces to a^x = e^(x ln a) if b = e); log_a(x) = log_b(x)/log_b(a) for
x > 0 (reduces to log_a(x) = ln(x)/ln(a) if b = e).

**EXAMPLE 1.36a (Solving Equations Involving Exponential Functions).** Solve
5^x = 2 for x.
Solution: apply ln to both sides: ln(5^x) = ln 2, so x ln 5 = ln 2 by the power
property, giving x = ln(2)/ln(5).

**EXAMPLE 1.39 (Comparing Earthquakes with the Richter Scale).** The Richter
scale relates two earthquake magnitudes R1 > R2 and their amplitudes A1, A2 by
R1 - R2 = log10(A1/A2). Compare a magnitude-9 earthquake (Japan, 2011) to a
magnitude-7.3 earthquake (Haiti, 2010).

Solution: 9 - 7.3 = log10(A1/A2), so A1/A2 = 10^1.7 ~ 50. The Japan earthquake was
approximately 50 times more intense than the Haiti earthquake. (In general, one
Richter point is a factor of 10 in amplitude, so a difference of 1 means 10 times as
intense and a difference of 2 means 100 times as intense.)

### Hyperbolic functions
Defined in terms of e^x and e^(-x): cosh(x) = (e^x + e^(-x))/2; sinh(x) =
(e^x - e^(-x))/2; tanh(x) = sinh(x)/cosh(x) = (e^x-e^(-x))/(e^x+e^(-x));
csch(x) = 1/sinh(x) = 2/(e^x - e^(-x)); sech(x) = 1/cosh(x) = 2/(e^x + e^(-x));
coth(x) = cosh(x)/sinh(x) = (e^x+e^(-x))/(e^x-e^(-x)).

Rule: Identities Involving Hyperbolic Functions.
cosh(-x) = cosh(x); sinh(-x) = -sinh(x); cosh(x) + sinh(x) = e^x;
cosh(x) - sinh(x) = e^(-x); cosh^2(x) - sinh^2(x) = 1; 1 - tanh^2(x) = sech^2(x);
coth^2(x) - 1 = csch^2(x); sinh(x +/- y) = sinh(x)cosh(y) +/- cosh(x)sinh(y);
cosh(x +/- y) = cosh(x)cosh(y) +/- sinh(x)sinh(y).

**EXAMPLE 1.40 (Evaluating Hyperbolic Functions).** If sinh(x) = 3/4, find the
values of the remaining five hyperbolic functions.

Solution: from cosh^2(x) - sinh^2(x) = 1, cosh^2(x) = 1 + (3/4)^2 = 25/16; since
cosh(x) >= 1 always, cosh(x) = 5/4. Then tanh(x) = sinh(x)/cosh(x) = 3/5,
csch(x) = 1/sinh(x) = 4/3, sech(x) = 1/cosh(x) = 4/5, coth(x) = 1/tanh(x) = 5/3.

Inverse hyperbolic functions (all one-to-one except cosh and sech, which are
restricted to [0,infinity)) are expressible via logarithms, e.g.
sinh^(-1)(x) = ln(x + sqrt(x^2+1)) and cosh^(-1)(x) = ln(x + sqrt(x^2-1)) for x >= 1.

# OpenStax Calculus Volume 1, Section 4.10: Antiderivatives

## Learning Objectives
- Find the general antiderivative of a given function.
- Explain the terms and notation used for an indefinite integral.
- State the power rule for integrals.
- Use antidifferentiation to solve simple initial-value problems.

## Topic Keywords
- antiderivative
- indefinite integral
- integrand
- constant of integration
- power rule for integrals
- family of antiderivatives
- sum and difference rules for integrals
- constant multiple rule for integrals
- differential equation
- initial-value problem

## Content

Given a function f, this section asks the reverse question of differentiation: how do we find a function whose
derivative is f? If F is a function such that F'(x) = f(x), F is called an antiderivative of f. One motivating case
is rectilinear motion: if a(t) is a known acceleration function, finding the velocity function v(t) requires an
antiderivative of a, since a(t) = v'(t); finding the position function s(t) then requires an antiderivative of v,
since v(t) = s'(t).

### Definition: antiderivative
A function F is an antiderivative of the function f if F'(x) = f(x) for all x in the domain of f.

Consider f(x) = 2x. Since d/dx(x^2) = 2x, F(x) = x^2 is an antiderivative of f. Since the derivative of any
constant is 0, x^2 + C is also an antiderivative of 2x for any constant C; for instance x^2 + 5 and x^2 - sqrt(2)
are both antiderivatives of 2x. By Corollary 2 of the Mean Value Theorem, if F and G are differentiable functions
with F'(x) = G'(x), then F(x) - G(x) = C for some constant C; applying this fact to two antiderivatives of the
same function leads to the following theorem.

### Theorem 4.14: General Form of an Antiderivative
Let F be an antiderivative of f over an interval I. Then: (i) for each constant C, the function F(x) + C is also
an antiderivative of f over I; and (ii) if G is an antiderivative of f over I, there is a constant C for which
G(x) = F(x) + C over I. In other words, the most general form of the antiderivative of f over I is F(x) + C.

**EXAMPLE 4.50 (Finding Antiderivatives).** For each of the following functions, find all antiderivatives.
a. f(x) = 3x^2
b. f(x) = 1/x
c. f(x) = cos(x)
d. f(x) = e^x

Solution:
a. Because d/dx(x^3) = 3x^2, F(x) = x^3 is an antiderivative of 3x^2. Therefore every antiderivative of 3x^2 has
the form x^3 + C for some constant C, and every function of that form is an antiderivative of 3x^2.
b. Let f(x) = ln|x|. For x > 0, f(x) = ln(x) and d/dx(ln(x)) = 1/x. For x < 0, f(x) = ln(-x) and
d/dx(ln(-x)) = -1/(-x) = 1/x. Therefore d/dx(ln|x|) = 1/x for all x in the domain of f, so F(x) = ln|x| is an
antiderivative of 1/x, and every antiderivative of 1/x has the form ln|x| + C.
c. Since d/dx(sin(x)) = cos(x), F(x) = sin(x) is an antiderivative of cos(x), so every antiderivative of cos(x)
has the form sin(x) + C.
d. Since d/dx(e^x) = e^x, F(x) = e^x is an antiderivative of e^x, so every antiderivative of e^x has the form
e^x + C.

### Indefinite integrals: notation and terminology
Given a function f, if F is an antiderivative of f, we say F(x) + C is the most general antiderivative of f and
write the integral of f(x) dx = F(x) + C. The expression f(x) is called the integrand, and the variable x is
called the variable of integration; finding the antiderivatives of a function f is called integrating f.

### Definition: indefinite integral
Given a function f, the indefinite integral of f, written as the integral of f(x) dx, is the most general
antiderivative of f. If F is an antiderivative of f, then the integral of f(x) dx = F(x) + C.

For a function f and an antiderivative F, the functions F(x) + C, for C any real number, are together called the
family of antiderivatives of f. For example, since x^2 is an antiderivative of 2x and every antiderivative of 2x
has the form x^2 + C, the family of antiderivatives of 2x is written as the integral of 2x dx = x^2 + C; this
family consists of all vertical shifts of the parabola y = x^2.

For some functions, evaluating an indefinite integral follows directly from a known derivative rule. For n != -1,
the integral of x^n dx = x^(n+1)/(n+1) + C, which comes directly from
d/dx(x^(n+1)/(n+1)) = (n+1) x^n/(n+1) = x^n. This fact is known as the power rule for integrals.

### Theorem 4.15: Power Rule for Integrals
For n != -1, the integral of x^n dx = x^(n+1)/(n+1) + C.

The book's formula table lists the indefinite integrals of several common functions, each following directly from
the matching differentiation formula:
- d/dx(k) = 0, so the integral of k dx = kx + C.
- d/dx(x^n) = n x^(n-1), so the integral of x^n dx = x^(n+1)/(n+1) + C, for n != -1.
- d/dx(ln|x|) = 1/x, so the integral of 1/x dx = ln|x| + C.
- d/dx(e^x) = e^x, so the integral of e^x dx = e^x + C.
- d/dx(sin(x)) = cos(x), so the integral of cos(x) dx = sin(x) + C.
- d/dx(cos(x)) = -sin(x), so the integral of sin(x) dx = -cos(x) + C.
- d/dx(tan(x)) = sec^2(x), so the integral of sec^2(x) dx = tan(x) + C.
- d/dx(csc(x)) = -csc(x)cot(x), so the integral of csc(x)cot(x) dx = -csc(x) + C.
- d/dx(sec(x)) = sec(x)tan(x), so the integral of sec(x)tan(x) dx = sec(x) + C.
- d/dx(cot(x)) = -csc^2(x), so the integral of csc^2(x) dx = -cot(x) + C.
- d/dx(sin^-1(x)) = 1/sqrt(1-x^2), so the integral of 1/sqrt(1-x^2) dx = sin^-1(x) + C.
- d/dx(tan^-1(x)) = 1/(1+x^2), so the integral of 1/(1+x^2) dx = tan^-1(x) + C.
- d/dx(sec^-1(x)) = 1/(x sqrt(x^2-1)), so the integral of 1/(x sqrt(x^2-1)) dx = sec^-1(x) + C.

Whenever claiming that the integral of f(x) dx = F(x) + C, it is important to verify the statement by checking
that F'(x) = f(x). The book demonstrates this technique for a sum, confirming the integral of (x+e^x) dx =
x^2/2 + e^x + C, and for a product, confirming the integral of x e^x dx = x e^x - e^x + C; in the product case it
notes that the product of the separate antiderivatives, x^2 e^x/2, is NOT an antiderivative of x e^x, so in
general the product of antiderivatives is not an antiderivative of a product.

### Theorem 4.16: Properties of Indefinite Integrals
Let F and G be antiderivatives of f and g, respectively, and let k be any real number.
Sum and difference rule: the integral of (f(x) +/- g(x)) dx = F(x) +/- G(x) + C.
Constant multiple rule: the integral of k f(x) dx = k F(x) + C.

These properties follow because d/dx(F(x)+G(x)) = F'(x)+G'(x) = f(x)+g(x) (and similarly for the difference), and
because d/dx(k F(x)) = k F'(x) = k f(x) for any real number k. Together with the power rule and the basic formula
list, these properties evaluate any indefinite integral built from a sum, difference, or constant multiple of
functions with known antiderivatives; integrals involving products, quotients, or compositions require more
advanced techniques covered later in the text.

**EXAMPLE 4.52 (Evaluating Indefinite Integrals).** Evaluate each of the following indefinite integrals.
a. the integral of (5x^3 - 7x^2 + 3x + 4) dx
b. the integral of (x^2 + 4 x^(1/3))/x dx
c. the integral of 4/(1+x^2) dx
d. the integral of tan(x)cos(x) dx

Solution:
a. Using the sum/difference and constant multiple rules, split the integrand into four separate integrals with
each coefficient pulled in front: 5*(the integral of x^3 dx) - 7*(the integral of x^2 dx) + 3*(the integral of x
dx) + 4*(the integral of 1 dx). Applying the power rule for integrals to each term gives the integral of
(5x^3-7x^2+3x+4) dx = (5/4)x^4 - (7/3)x^3 + (3/2)x^2 + 4x + C.
b. Rewrite the integrand as x^2/x + 4x^(1/3)/x = x + 4x^(-2/3). Integrating each term with the power rule: the
integral of x dx + 4*(the integral of x^(-2/3) dx) = (1/2)x^2 + 4*[1/(-2/3+1)] x^(-2/3+1) + C =
(1/2)x^2 + 12x^(1/3) + C.
c. Pull the constant out front: 4*(the integral of 1/(1+x^2) dx). Since tan^-1(x) is an antiderivative of
1/(1+x^2), the integral of 4/(1+x^2) dx = 4 tan^-1(x) + C.
d. Rewrite the integrand as tan(x)cos(x) = [sin(x)/cos(x)] * cos(x) = sin(x). Therefore the integral of
tan(x)cos(x) dx = the integral of sin(x) dx = -cos(x) + C.

### Initial-value problems
A differential equation is an equation relating an unknown function and one or more of its derivatives; dy/dx =
f(x) is a simple example. Solving this equation means finding a function y whose derivative is f, so the
solutions of dy/dx = f(x) are exactly the antiderivatives of f: if F is one antiderivative of f, every function
of the form y = F(x) + C solves the differential equation.

Sometimes we want the particular solution curve that passes through a given point (x0, y0), that is, y(x0) = y0.
The problem of finding a function y that satisfies dy/dx = f(x) together with the additional condition
y(x0) = y0 is called an initial-value problem, and the condition y(x0) = y0 is called an initial condition. For
example, given dy/dx = 6x^2 and the initial condition y(1) = 5: since the solutions of the differential equation
are y = 2x^3 + C, we need C such that y(1) = 2(1)^3 + C = 5, giving C = 3, so y = 2x^3 + 3 is the solution of the
initial-value problem.

Initial-value problems arise naturally in rectilinear motion: the velocity function v(t) is the derivative of the
position function s(t), and the acceleration a(t) is the derivative of the velocity function, that is,
a(t) = v'(t) = s''(t). Given an acceleration function together with an initial velocity, antidifferentiation
recovers the velocity function; given that velocity function together with an initial position,
antidifferentiation recovers the position function.

**EXAMPLE 4.54 (Decelerating Car).** A car is traveling at the rate of 88 ft/sec (60 mph) when the brakes are
applied. The car begins decelerating at a constant rate of 15 ft/sec^2.
a. How many seconds elapse before the car stops?
b. How far does the car travel during that time?

Solution:
a. Let t be the time (in seconds) after the brakes are applied, let a(t) be the acceleration of the car (in
ft/sec^2) at time t, let v(t) be the velocity of the car (in ft/sec) at time t, and let s(t) be the car's
position (in feet) beyond the point where the brakes are applied, at time t. The car is traveling at a rate of
88 ft/sec, so the initial velocity is v(0) = 88 ft/sec; since the car is decelerating, the acceleration is
a(t) = -15 ft/sec^2. Since acceleration is the derivative of velocity, v'(t) = -15, giving the initial-value
problem v'(t) = -15, v(0) = 88. Integrating, v(t) = -15t + C; since v(0) = 88, C = 88, so the velocity function
is v(t) = -15t + 88. The car stops when the velocity is zero: solving -15t + 88 = 0 gives t = 88/15 sec.
b. To find how far the car travels during this time, we need the position of the car after 88/15 sec, taking
the initial position to be s(0) = 0. Since velocity is the derivative of position, this gives the initial-value
problem s'(t) = -15t + 88, s(0) = 0. Integrating, s(t) = -(15/2)t^2 + 88t + C; since s(0) = 0, C = 0, so the
position function is s(t) = -(15/2)t^2 + 88t. After t = 88/15 sec, the position is s(88/15), which is
approximately 258.133 ft.

# OpenStax Calculus Volume 1, Section 5.3: The Fundamental Theorem of Calculus

## Learning Objectives
- Describe the meaning of the Mean Value Theorem for Integrals.
- State the meaning of the Fundamental Theorem of Calculus, Part 1.
- Use the Fundamental Theorem of Calculus, Part 1, to evaluate derivatives of integrals.
- State the meaning of the Fundamental Theorem of Calculus, Part 2.
- Use the Fundamental Theorem of Calculus, Part 2, to evaluate definite integrals.
- Explain the relationship between differentiation and integration.

## Topic Keywords
- mean value theorem for integrals
- average value of a function
- fundamental theorem of calculus part 1
- fundamental theorem of calculus part 2
- evaluation theorem
- variable upper limit of integration
- chain rule with integrals
- net signed area

## Content

In the previous two sections we looked at the definite integral and its relationship to the area under the curve
of a function, but so far the only tools available to calculate the value of a definite integral were geometric
area formulas and limits of Riemann sums, and both approaches are extremely cumbersome. This section develops
much more powerful techniques, built on the relationship between differentiation and integration codified in the
Fundamental Theorem of Calculus, which has two parts.

### The Mean Value Theorem for Integrals

The Mean Value Theorem for Integrals states that a continuous function on a closed interval takes on its average
value at some point in that interval. The theorem guarantees that if f(x) is continuous, a point c exists in an
interval [a, b] such that the value of the function at c is equal to the average value of f(x) over [a, b]. This
relies on the formula for the average value of a function: the average value of f(x) over an interval [a, b] is
(1/(b-a)) * (the integral of f(x) dx from a to b).

### Theorem 5.3: The Mean Value Theorem for Integrals
If f(x) is continuous over an interval [a, b], then there is at least one point c in [a, b] such that
f(c) = (1/(b-a)) * (the integral of f(x) dx from a to b).
This formula can also be stated as: the integral of f(x) dx from a to b = f(c)(b-a).

Proof sketch: since f is continuous on [a, b], the extreme value theorem gives minimum and maximum values m and M
on [a, b], so m <= f(x) <= M for all x in [a, b]. By the comparison theorem for integrals,
m(b-a) <= (the integral of f(x) dx from a to b) <= M(b-a); dividing by (b-a) shows the average value
(1/(b-a)) * (the integral of f(x) dx from a to b) lies between m and M. Since f is continuous and attains both m
and M on [a, b], the Intermediate Value Theorem guarantees some c in [a, b] where f(c) equals that average value.

**EXAMPLE 5.15 (Finding the Average Value of a Function).** Find the average value of the function f(x) = 8 - 2x
over the interval [0, 4] and find c such that f(c) equals the average value of the function over [0, 4].

Solution: The average value of f(x) is (1/(4-0)) * (the integral of (8-2x) dx from 0 to 4). Because f(x) = 8 - 2x
is a straight line over [0, 4], the region under it and above the x-axis is a right triangle with base 4 and
height 8, so the integral equals the triangle's area, A = (1/2)(4)(8) = 16. The average value is then
(1/4)(16) = 4. Setting the average value equal to f(c) and solving for c: 8 - 2c = 4, so c = 2, and
f(2) = 8 - 2(2) = 4, confirming c = 2 lies in [0, 4].

### Fundamental Theorem of Calculus, Part 1: Integrals and Antiderivatives

The Fundamental Theorem of Calculus is an extremely powerful theorem that establishes the relationship between
differentiation and integration, and gives a way to evaluate definite integrals without using Riemann sums or
calculating areas. The theorem has two parts; Part 1 establishes the relationship between differentiation and
integration by showing that integration and differentiation are, in a precise sense, inverse operations.

### Theorem 5.4: Fundamental Theorem of Calculus, Part 1
If f(x) is continuous over an interval [a, b], and the function F(x) is defined by
F(x) = the integral of f(t) dt from a to x,
then F'(x) = f(x) over (a, b).

Here F(x) is a function defined as the definite integral of another function f(t), from the fixed point a to the
variable point x: for any particular value of x, the definite integral is a number, so F(x) returns a number (the
value of that definite integral) for each value of x. The theorem is called "fundamental" because it not only
relates integration and differentiation, it also guarantees that any continuous (hence integrable) function has an
antiderivative, namely the function F defined by the variable-upper-limit integral itself. This follows because
the difference quotient (F(x+h) - F(x))/h reduces to (1/h) * (the integral of f(t) dt from x to x+h), which is
exactly the average value of f over [x, x+h]; by the Mean Value Theorem for Integrals this average value equals
f(c) for some c between x and x+h, and as h approaches 0, c approaches x, so by continuity of f the limit of
f(c) is f(x), giving F'(x) = f(x).

**EXAMPLE 5.17 (Finding a Derivative with the Fundamental Theorem of Calculus).** Use the Fundamental Theorem of
Calculus, Part 1, to find the derivative of g(x) = the integral of 1/(t^3+1) dt from 1 to x.

Solution: According to the Fundamental Theorem of Calculus, Part 1, the derivative is given directly by the
integrand evaluated at the upper limit: g'(x) = 1/(x^3+1).

When the upper limit of the integral is itself a function of x rather than x alone, Part 1 combines with the
chain rule. If F(x) = the integral of f(t) dt from a to u(x), then letting the inner function be u(x), the chain
rule gives F'(x) = f(u(x)) * u'(x).

**EXAMPLE 5.18 (Using the Fundamental Theorem and the Chain Rule to Calculate Derivatives).** Let
F(x) = the integral of sin(t) dt from 1 to sqrt(x). Find F'(x).

Solution: Let u(x) = sqrt(x), so F(x) = the integral of sin(t) dt from 1 to u(x). By the Fundamental Theorem of
Calculus, Part 1, combined with the chain rule,
F'(x) = sin(u(x)) * (du/dx) = sin(u(x)) * (1/2)x^(-1/2) = sin(sqrt(x))/(2 sqrt(x)).

(The same combination handles integrals whose lower and upper limits are both functions of x: split the integral
at a constant, using the integral of f(t) dt from p(x) to q(x) = the integral of f(t) dt from p(x) to a constant
plus the integral of f(t) dt from that constant to q(x), negate the first piece to put its variable bound on top,
then differentiate each piece by the chain-rule rule above and add the results.)

### Fundamental Theorem of Calculus, Part 2: The Evaluation Theorem

The Fundamental Theorem of Calculus, Part 2, is perhaps the most important theorem in calculus: after finding
approximate areas by adding the areas of n rectangles, the application of this theorem is straightforward by
comparison. It says that the area of an entire curved region can be calculated by just evaluating an antiderivative
at the first and last endpoints of an interval.

### Theorem 5.5: The Fundamental Theorem of Calculus, Part 2 (the Evaluation Theorem)
If f is continuous over the interval [a, b] and F(x) is any antiderivative of f(x), then
the integral of f(x) dx from a to b = F(b) - F(a).

The notation F(x)|_a^b (read "F(x) evaluated from a to b") denotes the expression F(b) - F(a): evaluate F at the
upper limit b, then subtract F evaluated at the lower limit a. Because any antiderivative of f works in this
formula (the "+C" terms of two antiderivatives of the same f always cancel in the subtraction F(b) - F(a)), it is
conventional to drop the "+C" when writing the antiderivative used to evaluate a definite integral.

Proof sketch: let P = {x_i}, i = 0, 1, ..., n be a regular partition of [a, b], so that
F(b) - F(a) = F(x_n) - F(x_0) = the sum over i = 1 to n of [F(x_i) - F(x_{i-1})].
Since F is an antiderivative of f on [a, b], the Mean Value Theorem gives, for each i, some c_i in [x_{i-1}, x_i]
with F(x_i) - F(x_{i-1}) = F'(c_i)(x_i - x_{i-1}) = f(c_i) * Delta x. Substituting,
F(b) - F(a) = the sum over i = 1 to n of f(c_i) * Delta x. Taking the limit of both sides as n approaches
infinity turns the right side into the definition of the definite integral, so
F(b) - F(a) = the limit as n approaches infinity of the sum over i = 1 to n of f(c_i) * Delta x
            = the integral of f(x) dx from a to b.

**EXAMPLE 5.20 (Evaluating an Integral with the Fundamental Theorem of Calculus).** Use the Fundamental Theorem of
Calculus, Part 2, to evaluate the integral of (t^2 - 4) dt from -2 to 2.

Solution: By the power rule for antiderivatives, an antiderivative of t^2 - 4 is t^3/3 - 4t, so
the integral of (t^2-4) dt from -2 to 2 = (t^3/3 - 4t)|_{-2}^{2}
= [(2)^3/3 - 4(2)] - [(-2)^3/3 - 4(-2)]
= (8/3 - 8) - (-8/3 + 8)
= 8/3 - 8 + 8/3 - 8
= 16/3 - 16
= -32/3.
The "+C" term was omitted because, by Part 2, any antiderivative works; had a different antiderivative been
chosen, the constant term would have canceled out. Note that the region between this curve and the x-axis lies
entirely below the x-axis, so area (which is always positive) is not the same thing as this net signed value: a
definite integral can be negative even though area cannot, and if this were, say, a profit function, a negative
result would indicate a loss over the interval.

**EXAMPLE 5.22 (A Roller-Skating Race).** James and Kathy are racing on roller skates. They race along a long,
straight track, and whoever has gone the farthest after 5 sec wins a prize. If James can skate at a velocity of
f(t) = 5 + 2t ft/sec and Kathy can skate at a velocity of g(t) = 10 + cos((pi/2)t) ft/sec, who wins the race?

Solution: Integrate both velocity functions over [0, 5] and compare. For James:
the integral of (5+2t) dt from 0 to 5 = (5t + t^2)|_0^5 = (25 + 25) - 0 = 50,
so James has skated 50 ft after 5 sec. For Kathy, since sin(t) is an antiderivative of cos(t), an antiderivative
of cos((pi/2)t) must involve sin((pi/2)t); differentiating sin((pi/2)t) gives (pi/2)cos((pi/2)t) by the chain
rule, so the extra coefficient (2/pi) is needed to compensate:
the integral of (10 + cos((pi/2)t)) dt from 0 to 5 = (10t + (2/pi) sin((pi/2)t))|_0^5
= (50 + (2/pi) sin(5pi/2)) - (0 + (2/pi) sin(0))
= 50 + (2/pi)(1) - 0
which is approximately 50.6. Kathy has skated approximately 50.6 ft after 5 sec, so Kathy wins the race, but not
by much.

Together the two parts of the Fundamental Theorem of Calculus show that differentiation and integration are
inverse processes: Part 1 says that integrating a continuous function and then differentiating the result recovers
the original function, while Part 2 says that differentiating a function to obtain an antiderivative-compatible
integrand and then evaluating its definite integral reduces to simple subtraction of that antiderivative's values
at the endpoints, with no Riemann sum or area computation required.

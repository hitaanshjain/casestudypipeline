# OpenStax Calculus Volume 1, Section 5.2: The Definite Integral

## Learning Objectives
- State the definition of the definite integral.
- Explain the terms integrand, limits of integration, and variable of integration.
- Explain when a function is integrable.
- Describe the relationship between the definite integral and net area.
- Use geometry and the properties of definite integrals to evaluate them.
- Calculate the average value of a function.

## Topic Keywords
- definite integral
- riemann sum
- integrand
- limits of integration
- integrable function
- net signed area
- total area
- comparison theorem
- average value of a function

## Content

The preceding section defined the area under a curve as the limit of a Riemann sum, A = the limit as n
approaches infinity of the sum, for i = 1 to n, of f(x_i^*) * Delta x, but that definition required f(x) to be
continuous and nonnegative. Real-world functions do not always meet those restrictions, so this section
generalizes the idea to a broader class of functions through the definite integral.

### Definition: definite integral
If f(x) is a function defined on an interval [a, b], the definite integral of f from a to b, written the
integral of f(x) dx from a to b, is given by the integral of f(x) dx from a to b = the limit as n approaches
infinity of the sum, for i = 1 to n, of f(x_i^*) * Delta x, provided the limit exists. If this limit exists,
f(x) is said to be integrable on [a, b], or is called an integrable function.

### Notation and terminology
The function f(x) is called the integrand, and dx indicates that f(x) is a function of x, called the variable
of integration. As with the index in a sum, the variable of integration is a dummy variable with no effect on
the value of the integral: the integral of f(x) dx from a to b = the integral of f(t) dt from a to b = the
integral of f(u) du from a to b. The numbers a and b are called the limits of integration: a is the lower
limit and b is the upper limit. A definite integral is a number; an indefinite integral (the antiderivative
family, with no a and b) is a family of functions, so although the two notations look similar they are not
the same.

### Theorem 5.1: Continuous Functions Are Integrable
If f(x) is continuous on [a, b], then f is integrable on [a, b].

Functions that are not continuous on [a, b] may still be integrable, depending on the discontinuities present;
for example, a function continuous on a closed interval except for finitely many jump discontinuities is still
integrable.

**EXAMPLE (Evaluating an Integral Using the Definition, book Example 5.7).** Use the definition of the
definite integral to evaluate the integral of x^2 dx from 0 to 2, generating the Riemann sum with a
right-endpoint approximation.

Solution: Here a = 0 and b = 2, so Delta x = (b-a)/n = 2/n. Using a regular partition, the right endpoint of
the i-th subinterval is x_i = 0 + i*Delta x = 2i/n, so f(x_i) = x_i^2 = (2i/n)^2 = 4i^2/n^2. The Riemann sum is
then the sum, for i = 1 to n, of f(x_i)*Delta x = the sum of (4i^2/n^2)*(2/n) = the sum of 8i^2/n^3 =
(8/n^3) * (the sum, for i = 1 to n, of i^2). Using the summation formula the sum, for i = 1 to n, of i^2 =
n(n+1)(2n+1)/6, this becomes (8/n^3) * n(n+1)(2n+1)/6 = 8/3 + 4/n + 4/(3n^2). Taking the limit as n approaches
infinity, the last two terms vanish, so the integral of x^2 dx from 0 to 2 = 8/3.

### Area and the Definite Integral: Net Signed Area
When f(x) is negative, "the area under the curve" no longer means ordinary geometric area; instead, the
definite integral gives the net signed area. If A1 is the area between f(x) and the x-axis that lies above the
axis and A2 is the area between f(x) and the x-axis that lies below the axis, then the integral of f(x) dx
from a to b = A1 - A2, the net signed area. Net signed area can be positive, negative, or zero, depending on
whether the area above or the area below the axis is larger.

**EXAMPLE (Finding the Net Signed Area, book Example 5.9).** Find the net signed area between f(x) = 2x and
the x-axis over the interval [-3, 3].

Solution: f(x) = 2x is a line forming two triangles, one from x = -3 to x = 0 (below the axis) and one from
x = 0 to x = 3 (above the axis). The triangle above the axis, A1, has base 3 and height f(3) = 6, so
A1 = (1/2)*3*6 = 9. The triangle below the axis, A2, has base 3 and height |f(-3)| = 6, so A2 = (1/2)*3*6 = 9.
The net signed area is the integral of 2x dx from -3 to 3 = A1 - A2 = 9 - 9 = 0.

If instead we want the total distance covered by a curve regardless of direction (sign), we use the total
area, which adds the areas above and below the axis rather than subtracting them: the integral of |f(x)| dx
from a to b = A1 + A2, the total area.

**EXAMPLE (Finding the Total Area, book Example 5.10).** Find the total area between f(x) = x - 2 and the
x-axis over the interval [0, 6].

Solution: f(x) = x - 2 has its x-intercept at x = 2. On [0, 2], f(x) is below the axis, forming a triangle A2
with base 2 and height |f(0)| = 2, so A2 = (1/2)*2*2 = 2. On [2, 6], f(x) is above the axis, forming a triangle
A1 with base 4 and height f(6) = 4, so A1 = (1/2)*4*4 = 8. The total area is the integral of |x-2| dx from 0
to 6 = A1 + A2 = 8 + 2 = 10.

### Properties of the Definite Integral
The properties of indefinite integrals carry over to definite integrals, which also have properties relating
to the limits of integration.
1. The integral of f(x) dx from a to a = 0 (a zero-width interval has no area).
2. The integral of f(x) dx from b to a = -(the integral of f(x) dx from a to b) (reversing the limits of
integration negates the integral).
3. The integral of [f(x)+g(x)] dx from a to b = the integral of f(x) dx from a to b + the integral of g(x) dx
from a to b (the integral of a sum is the sum of the integrals).
4. The integral of [f(x)-g(x)] dx from a to b = the integral of f(x) dx from a to b - the integral of g(x) dx
from a to b (the integral of a difference is the difference of the integrals).
5. The integral of c*f(x) dx from a to b = c * (the integral of f(x) dx from a to b), for constant c (the
integral of a constant multiple of a function equals the constant multiple of the integral).
6. The integral of f(x) dx from a to b = the integral of f(x) dx from a to c + the integral of f(x) dx from c
to b (additivity over adjacent subintervals). This formula holds for all values of a, b, and c, not only for c
between a and b, provided f(x) is integrable on the largest of the resulting intervals.

**EXAMPLE (Using the Properties of the Definite Integral, book Example 5.12).** If it is known that the
integral of f(x) dx from 0 to 8 = 10 and the integral of f(x) dx from 0 to 5 = 5, find the integral of f(x) dx
from 5 to 8.

Solution: By property 6, the integral of f(x) dx from 0 to 8 = the integral of f(x) dx from 0 to 5 + the
integral of f(x) dx from 5 to 8, so 10 = 5 + (the integral of f(x) dx from 5 to 8), giving the integral of
f(x) dx from 5 to 8 = 5.

### Theorem 5.2: Comparison Theorem
These properties concern the case a <= b and are used to compare the sizes of integrals.
i. If f(x) >= 0 for a <= x <= b, then the integral of f(x) dx from a to b >= 0.
ii. If f(x) >= g(x) for a <= x <= b, then the integral of f(x) dx from a to b >= the integral of g(x) dx from
a to b.
iii. If m and M are constants such that m <= f(x) <= M for a <= x <= b, then m*(b-a) <= (the integral of f(x)
dx from a to b) <= M*(b-a).

### Average Value of a Function
To find the average value of a function f(x) that takes on infinitely many values over [a, b] (rather than a
finite list of numbers), partition [a, b] into n subintervals of width Delta x = (b-a)/n, sample a
representative x_i^* in each subinterval, and average the sampled values:
(f(x_1^*)+f(x_2^*)+...+f(x_n^*))/n. Substituting n = (b-a)/Delta x and simplifying turns this average into
(1/(b-a)) * (the sum, for i = 1 to n, of f(x_i^*) * Delta x), which is a Riemann sum scaled by 1/(b-a). Taking
the limit as n approaches infinity gives the exact average value.

### Definition: average value of a function
Let f(x) be continuous over [a, b]. The average value of the function f(x) (or f_ave) on [a, b] is given by
f_ave = (1/(b-a)) * (the integral of f(x) dx from a to b).

**EXAMPLE (Finding the Average Value of a Linear Function, book Example 5.14).** Find the average value of
f(x) = x + 1 over the interval [0, 5].

Solution: The region under f(x) = x+1 on [0, 5] is a trapezoid with parallel sides f(0) = 1 and f(5) = 6 and
height (interval length) 5, so the integral of (x+1) dx from 0 to 5 = (1/2)*5*(1+6) = 35/2. The average value
is f_ave = (1/(5-0)) * (35/2) = 7/2.

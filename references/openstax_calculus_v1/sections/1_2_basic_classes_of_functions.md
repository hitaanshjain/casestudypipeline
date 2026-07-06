# OpenStax Calculus Volume 1, Section 1.2: Basic Classes of Functions

## Learning Objectives
- Calculate the slope of a linear function and interpret its meaning.
- Recognize the degree of a polynomial.
- Find the roots of a quadratic polynomial.
- Describe the graphs of basic odd and even polynomial functions.
- Identify a rational function.
- Describe the graphs of power and root functions.
- Explain the difference between algebraic and transcendental functions.
- Graph a piecewise-defined function.
- Sketch the graph of a function that has been shifted, stretched, or reflected from its initial graph position.

## Topic Keywords
- linear functions and slope
- polynomials and degree
- quadratic formula
- power and root functions
- rational functions
- algebraic vs transcendental functions
- piecewise-defined functions
- function transformations

## Content

### Linear functions and slope
Definition: consider a line L through (x1, y1) and (x2, y2). Let Dy = y2 - y1 and
Dx = x2 - x1. The slope of the line is m = (y2 - y1)/(x2 - x1) = Dy/Dx.
Point-slope equation: y - y1 = m(x - x1). Slope-intercept form: y = mx + b (slope m,
y-intercept (0, b)). Standard form: ax + by = c, where a, b are not both zero (allows
vertical lines x = k, which are not functions).

**EXAMPLE 1.13 (A Linear Distance Function).** Jessica leaves her house at 5:50 a.m.
for a 9-mile run and returns at 7:08 a.m. (78 minutes later), running at a constant pace.
a. Express distance D (miles) as a linear function of run time t (minutes).
b. Sketch a graph of D. c. Interpret the slope.

Solution:
a. D(0) = 0 and D(78) = 9, so the slope is m = (9-0)/(78-0) = 3/26. The y-intercept
is (0,0), so D(t) = (3/26) t.
b. The graph passes through the origin with slope 3/26, reaching (78, 9).
c. The slope m = 3/26 ~ 0.115 describes the distance in miles Jessica runs per
minute, her average velocity.

### Polynomials and degree
A polynomial function has the form f(x) = a_n x^n + a_(n-1) x^(n-1) + ... + a_1 x + a_0
for integer n >= 0 and constants a_n,...,a_0 with a_n != 0. The value n is the degree of
the polynomial; a_n is the leading coefficient. Degree 0 is a constant function, degree 1
is linear, degree 2 is a quadratic function f(x) = ax^2 + bx + c (a != 0), degree 3 is a
cubic function.

Rule: The Quadratic Formula. For ax^2 + bx + c = 0 with a != 0, the solutions are
x = (-b +/- sqrt(b^2 - 4ac)) / (2a). If the discriminant b^2-4ac > 0 there are two real
solutions; if it equals 0 there is exactly one real solution; if it is negative there are
no real solutions.

End behavior: for a quadratic with leading coefficient a, if a > 0 the parabola opens
upward (f(x) -> infinity as x -> +/- infinity); if a < 0 it opens downward. For a cubic
with leading coefficient a > 0, f(x) -> infinity as x -> infinity and f(x) -> -infinity
as x -> -infinity; the opposite holds if a < 0. A power function f(x) = a x^n with
positive integer n is even (f(-x)=f(x)) if n is even, and odd (f(-x)=-f(x)) if n is odd.

**EXAMPLE 1.14 (Graphing Polynomial Functions).** For each function, describe the
end behavior, find all zeros, and sketch the graph.
a. f(x) = -2x^2 + 4x - 1
b. f(x) = x^3 - 3x^2 - 4x

Solution:
a. Quadratic, a = -2 < 0, so f(x) -> -infinity as x -> +/- infinity. By the quadratic
formula, zeros are x = (-4 +/- sqrt(16-8))/(-4) = (-4 +/- 2 sqrt(2))/(-4) = (2 +/-
sqrt(2))/2, i.e. x ~ 0.2929 and x ~ 1.7071. The graph is a downward parabola through
these two x-intercepts.
b. Cubic, a = 1 > 0, so f(x) -> infinity as x -> infinity and f(x) -> -infinity as
x -> -infinity. Factoring: f(x) = x(x^2 - 3x - 4) = x(x-4)(x+1), so the zeros are
x = 0, 4, -1.

Optimization application: a company's revenue from a linear demand model can be
quadratic, e.g. R(p) = -1.04p^2 + 26p (thousands of dollars at price p dollars). Its
zeros are p = 0 and p = 25 (revenue is zero if the item is free or priced too high to
sell); since a parabola is symmetric about the axis halfway between its zeros, the
maximum revenue occurs at p = 12.5, giving R(12.5) = -1.04(12.5)^2 + 26(12.5) =
$162,500.

### Algebraic functions: rational and root functions
An algebraic function involves addition, subtraction, multiplication, division,
rational powers, and roots. A rational function has the form f(x) = p(x)/q(x) where p
and q are polynomials, e.g. f(x) = (3x-1)/(5x+2) or g(x) = 4/(x^2+1). A root function is
a power function f(x) = x^(1/n) for integer n > 1, e.g. f(x) = x^(1/2) = sqrt(x) and
g(x) = x^(1/3) = cbrt(x). Compositions of root and rational functions are also
algebraic, e.g. f(x) = sqrt(4 - x^2). For even n, the domain of x^(1/n) is [0, infinity);
for odd n, the domain is all real numbers, and x^(1/n) is an odd function.

### Transcendental functions
Functions that cannot be described by finitely many algebraic operations are
transcendental. The most common are trigonometric functions, exponential functions
f(x) = b^x (base b > 0, b != 1), and logarithmic functions f(x) = log_b(x) (b > 0,
b != 1), defined by y = log_b(x) if and only if b^y = x.

### Piecewise-defined functions
A function may be given by different formulas on different parts of its domain. When
graphing, use closed circles where the active piece includes the boundary point and
open circles where it does not.

**EXAMPLE 1.20 (Parking Fees Described by a Piecewise-Defined Function).** A
garage charges $10 for the first hour or part thereof, plus $2 for each additional hour
or part thereof, up to a $30 daily maximum. The garage is open 18 hours (0 < x <= 18).

Solution: The cost function is

    C(x) = { 10,  0 < x <= 1
            { 12,  1 < x <= 2
            { 14,  2 < x <= 3
            { 16,  3 < x <= 4
            { ...
            { 30,  10 < x <= 18

The graph consists of a series of horizontal line segments stepping up by $2 each hour
until it caps at $30.

### Transformations of functions
Given f(x), the graph of c f(a(x+b)) + d is obtained from the graph of f by, in order:
(1) horizontal shift by b (left if b > 0, right if b < 0); (2) horizontal scaling by
factor 1/|a| (reflect about the y-axis if a < 0); (3) vertical scaling by factor |c|
(reflect about the x-axis if c < 0); (4) vertical shift by d (up if d > 0, down if
d < 0). For example, f(x) = -|x+2| - 3 is y = |x| shifted left 2, reflected about the
x-axis, and shifted down 3; f(x) = 3 sqrt(-x) + 1 is y = sqrt(x) reflected about the
y-axis, stretched vertically by 3, and shifted up 1.

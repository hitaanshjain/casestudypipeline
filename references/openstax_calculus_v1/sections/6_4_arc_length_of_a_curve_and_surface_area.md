# OpenStax Calculus Volume 1, Section 6.4: Arc Length of a Curve and Surface Area

## Learning Objectives
- Determine the length of a curve, y = f(x), between two points.
- Determine the length of a curve, x = g(y), between two points.
- Find the surface area of a solid of revolution.

## Topic Keywords
- arc length
- smooth function
- surface of revolution
- frustum
- lateral surface area
- mean value theorem
- u-substitution
- definite integral evaluation

## Content

This section uses definite integrals to find the arc length of a curve, the distance you would travel if you
walked along the path of the curve. Real-world applications include finding how far a rocket travels along a
parabolic path, or how far you would drive along a curved road on a map. The section first develops arc length
for curves defined as functions of x, then repeats the same process for curves defined as functions of y (the
process is identical with the roles of x and y reversed), and finally extends the technique to find the surface
area of a surface of revolution.

### Arc Length of the Curve y = f(x)

Earlier applications of integration only required f(x) to be integrable or continuous. Arc length imposes a
stricter requirement: f(x) must be differentiable, and its derivative f'(x) must itself be continuous. A function
with a continuous derivative is called smooth.

Let f(x) be a smooth function on [a,b]. To approximate the length of the curve from (a,f(a)) to (b,f(b)), take a
regular partition of [a,b] into n pieces and, for i = 1,...,n, connect the point (x_(i-1), f(x_(i-1))) to the point
(x_i, f(x_i)) with a line segment. By the Pythagorean theorem, the length of one such segment is
sqrt((Delta x)^2 + (Delta y_i)^2), which can be rewritten as Delta x * sqrt(1 + ((Delta y_i)/(Delta x))^2), where
Delta y_i = f(x_i) - f(x_(i-1)) is the change in vertical distance over the interval [x_(i-1), x_i] (note that some
or all of the Delta y_i may be negative). By the Mean Value Theorem there is a point x_i* in [x_(i-1), x_i] such
that f'(x_i*) = (Delta y_i)/(Delta x), so the length of the segment is Delta x * sqrt(1 + (f'(x_i*))^2). Summing
the lengths of all n segments gives the Riemann sum

Arc Length is approximately the sum from i=1 to n of sqrt(1 + (f'(x_i*))^2) * Delta x.

Taking the limit as n approaches infinity turns this Riemann sum into a definite integral.

### Theorem 6.4: Arc Length for y = f(x)
Let f(x) be a smooth function over the interval [a,b]. Then the arc length of the portion of the graph of f(x)
from the point (a,f(a)) to the point (b,f(b)) is given by
Arc Length = the integral from a to b of sqrt(1 + (f'(x))^2) dx.

Because the integrand involves f'(x), f'(x) must be integrable, which is exactly why f(x) is required to be
smooth.

**EXAMPLE 6.18 (Calculating the Arc Length of a Function of x).** Let f(x) = 2x^(3/2). Calculate the arc length
of the graph of f(x) over the interval [0,1]. Round the answer to three decimal places.

Solution: f'(x) = 3x^(1/2), so (f'(x))^2 = 9x. Then Arc Length = the integral from 0 to 1 of sqrt(1 + 9x) dx.
Substitute u = 1 + 9x, so du = 9 dx; when x = 0, u = 1, and when x = 1, u = 10. Then Arc Length =
(1/9) times the integral from 1 to 10 of sqrt(u) du = (1/9)(2/3)u^(3/2) evaluated from 1 to 10 =
(2/27)[10*sqrt(10) - 1], which is approximately 2.268 units. (Recomputed independently: (2/27)(10*sqrt(10) - 1)
= 2.26835..., which rounds to the book's 2.268.)

**EXAMPLE 6.19 (Using a Computer or Calculator to Determine the Arc Length of a Function of x).** Let f(x) = x^2.
Calculate the arc length of the graph of f(x) over the interval [1,3].

Solution: f'(x) = 2x, so (f'(x))^2 = 4x^2, and Arc Length = the integral from 1 to 3 of sqrt(1 + 4x^2) dx. This
antiderivative requires techniques beyond simple substitution (the book points to Introduction to Techniques of
Integration in Volume 2, restated here only as a pointer, not reproduced), so the value is approximated
numerically as approximately 8.26815. (Recomputed independently using the closed form
(x/2)*sqrt(1+4x^2) + (1/4)*ln(2x + sqrt(1+4x^2)) evaluated at x=3 and x=1: the difference agrees with the book's
value to the given precision.)

### Arc Length of the Curve x = g(y)

The same process applies to a curve defined as a function of y, except the y-axis is partitioned instead of the
x-axis, and the roles of x and y swap throughout.

### Theorem 6.5: Arc Length for x = g(y)
Let g(y) be a smooth function over a y-interval [c,d]. Then the arc length of the graph of g(y) from the point
(g(d), d) to the point (g(c), c) is given by
Arc Length = the integral from c to d of sqrt(1 + (g'(y))^2) dy.

**EXAMPLE 6.20 (Calculating the Arc Length of a Function of y).** Let g(y) = 3y^3. Calculate the arc length of
the graph of g(y) over the interval [1,2].

Solution: g'(y) = 9y^2, so (g'(y))^2 = 81y^4, and Arc Length = the integral from 1 to 2 of sqrt(1 + 81y^4) dy.
As in Example 6.19, this has no elementary closed form, so a computer or calculator gives approximately 21.0277.
(Recomputed independently via a three-point Simpson's rule check on [1,2]: the estimate agrees with the book's
value to the precision shown.)

### Area of a Surface of Revolution

Surface area is the total area of the outer layer of an object. For a curved surface the calculation is more
subtle than summing flat faces. Let f(x) be a nonnegative smooth function over [a,b]; revolving the graph of
y = f(x) around the x-axis generates a surface of revolution.

As with arc length, partition [a,b] and approximate the curve with line segments; revolving each line segment
around the x-axis produces a band that is a frustum of a cone (a cone with its pointed tip cut off). The lateral
surface area (the slanted outside surface only, excluding the top and bottom faces) of a full cone with base
radius r and slant height s is pi*r*s. A frustum with radii r_1 (wide end) and r_2 (narrow end) and slant height l
can be treated as a large cone with a smaller cone removed from its tip; writing the small cone's slant height as
s - l and using similar triangles to solve for s, then subtracting the two cones' lateral areas and simplifying,
gives the frustum's lateral surface area as S = pi*(r_1 + r_2)*l. (The book's algebra runs several lines longer;
this restates only the setup and the result.)

For a representative band generated by revolving the segment from (x_(i-1), f(x_(i-1))) to (x_i, f(x_i)), the
slant height l is just the segment length found above, so
S = pi*(f(x_(i-1)) + f(x_i)) * Delta x * sqrt(1 + ((Delta y_i)/(Delta x))^2).
By the Mean Value Theorem there is a point x_i* with f'(x_i*) = (Delta y_i)/(Delta x), giving
S = pi*(f(x_(i-1)) + f(x_i)) * Delta x * sqrt(1 + (f'(x_i*))^2). Because f(x) is continuous, the Intermediate
Value Theorem also gives a point x_i** in [x_(i-1), x_i] with f(x_i**) = (1/2)[f(x_(i-1)) + f(x_i)], so
S = 2*pi*f(x_i**) * Delta x * sqrt(1 + (f'(x_i*))^2). Summing over all n bands gives an approximate total surface
area that, although it uses two different evaluation points x_i* and x_i** on each subinterval, behaves like a
Riemann sum as n approaches infinity because f is smooth (both points converge to the same x); the details of
that limit argument are left to a more advanced calculus text, and are not reproduced here. Taking that limit
turns the sum into a definite integral.

### Theorem 6.6: Surface Area of a Surface of Revolution
Let f(x) be a nonnegative smooth function over the interval [a,b]. Then the surface area of the surface of
revolution formed by revolving the graph of f(x) around the x-axis is given by
Surface Area = the integral from a to b of 2*pi*f(x)*sqrt(1 + (f'(x))^2) dx.
Similarly, let g(y) be a nonnegative smooth function over the interval [c,d]. Then the surface area of the surface
of revolution formed by revolving the graph of g(y) around the y-axis is given by
Surface Area = the integral from c to d of 2*pi*g(y)*sqrt(1 + (g'(y))^2) dy.

**EXAMPLE 6.21 (Calculating the Surface Area of a Surface of Revolution 1).** Let f(x) = sqrt(x) over the
interval [1,4]. Find the surface area of the surface generated by revolving the graph of f(x) around the x-axis.
Round the answer to three decimal places.

Solution: f'(x) = 1/(2*sqrt(x)), so (f'(x))^2 = 1/(4x). Then
Surface Area = the integral from 1 to 4 of 2*pi*sqrt(x)*sqrt(1 + 1/(4x)) dx = the integral from 1 to 4 of
2*pi*sqrt(x + 1/4) dx. Substitute u = x + 1/4, so du = dx; when x = 1, u = 5/4, and when x = 4, u = 17/4. Then
Surface Area = 2*pi*(2/3)*u^(3/2) evaluated from 5/4 to 17/4 = (pi/6)*[17*sqrt(17) - 5*sqrt(5)], which is
approximately 30.846. (Recomputed independently: (pi/6)(17*sqrt(17) - 5*sqrt(5)) = 30.8465..., matching the
book's 30.846.)

**EXAMPLE 6.22 (Calculating the Surface Area of a Surface of Revolution 2).** Let y = the cube root of 3x.
Consider the portion of the curve where 0 <= y <= 2. Find the surface area of the surface generated by revolving
the graph around the y-axis.

Solution: Since the revolution is about the y-axis and the bound is given in y, rewrite the curve as a function
of y: x = g(y) = (1/3)y^3. Then g'(y) = y^2, so (g'(y))^2 = y^4, and
Surface Area = the integral from 0 to 2 of 2*pi*(1/3)y^3*sqrt(1 + y^4) dy = (2*pi/3) times the integral from 0 to
2 of y^3*sqrt(1 + y^4) dy. Substitute u = y^4 + 1, so du = 4y^3 dy; when y = 0, u = 1, and when y = 2, u = 17.
Then Surface Area = (2*pi/3)*(1/4)*(2/3)*u^(3/2) evaluated from 1 to 17 = (pi/9)*[17^(3/2) - 1], which is
approximately 24.118. (Recomputed independently: (pi/9)(17*sqrt(17) - 1) = 24.1183..., matching the book's
24.118.)

# OpenStax Calculus Volume 1, Section 6.3: Volumes of Revolution: Cylindrical Shells

## Learning Objectives
- Calculate the volume of a solid of revolution by using the method of cylindrical shells.
- Compare the different methods for calculating a volume of revolution.

## Topic Keywords
- cylindrical shells
- shell radius
- shell height
- flat plate approximation
- disk method
- washer method
- method selection
- revolution about a line

## Content

This section covers the method of cylindrical shells, the last of the three methods for finding the volume of a
solid of revolution. It applies to the same kinds of solids as the disk and washer methods, but with the disk
and washer methods we integrate along the coordinate axis parallel to the axis of revolution, while with the
method of cylindrical shells we integrate along the coordinate axis perpendicular to the axis of revolution.
Being able to choose which variable to integrate with respect to can be a real advantage with more complicated
functions, and the specific geometry of a solid sometimes makes shells more appealing than washers. The section
closes by reviewing all three volume methods and giving guidelines for choosing among them.

### The Method of Cylindrical Shells

As before, define a region R bounded above by the graph of a function y = f(x) (continuous and nonnegative),
below by the x-axis, and on the left and right by the lines x = a and x = b, respectively. This time R is
revolved around the y-axis rather than the x-axis or a line parallel to it.

Partition [a,b] using a regular partition, and for i = 1, 2, ..., n choose a sample point x_i* in the
subinterval [x_(i-1), x_i]. Construct a rectangle over [x_(i-1), x_i] of height f(x_i*) and width delta x. When
that rectangle is revolved around the y-axis, instead of a disk or a washer we get a cylindrical shell.

The shell is a cylinder, so its volume is the cross-sectional area times the height. The cross-sections are
annuli (rings) with outer radius x_i and inner radius x_(i-1), so the cross-sectional area is
pi x_i^2 - pi x_(i-1)^2, and the height of the cylinder is f(x_i*). So the volume of the shell is
V_shell = f(x_i*)(pi x_i^2 - pi x_(i-1)^2) = pi f(x_i*)(x_i^2 - x_(i-1)^2)
= pi f(x_i*)(x_i + x_(i-1))(x_i - x_(i-1)) = 2 pi f(x_i*) ((x_i + x_(i-1))/2)(x_i - x_(i-1)).
Since x_i - x_(i-1) = delta x, V_shell = 2 pi f(x_i*) ((x_i + x_(i-1))/2) delta x. The quantity
(x_i + x_(i-1))/2 is both the midpoint of [x_(i-1), x_i] and the average radius of the shell, and it can be
approximated by x_i*, giving V_shell approximately equal to 2 pi f(x_i*) x_i* delta x.

An equivalent way to see this: make a vertical cut in the shell and unroll it into a flat plate. In reality the
outer edge of the unrolled plate is slightly longer than the inner edge, since the outer radius exceeds the
inner radius, but the flattened shell can be approximated by a flat plate of height f(x_i*), width 2 pi x_i*
(the circumference at the shell's average radius), and thickness delta x. Multiplying height, width, and depth
gives the same approximation, V_shell approximately equal to f(x_i*)(2 pi x_i*) delta x.

Adding the volumes of all n shells gives V approximately equal to the sum from i = 1 to n of
(2 pi x_i* f(x_i*) delta x), a Riemann sum for the function 2 pi x f(x). Taking the limit as n -> infinity gives
V = the integral from a to b of (2 pi x f(x)) dx.

### Rule: The Method of Cylindrical Shells
Let f(x) be continuous and nonnegative. Define R as the region bounded above by the graph of f(x), below by
the x-axis, on the left by the line x = a, and on the right by the line x = b. Then the volume of the solid of
revolution formed by revolving R around the y-axis is given by
V = the integral from a to b of (2 pi x f(x)) dx.

**EXAMPLE 6.12 (The Method of Cylindrical Shells 1).** Define R as the region bounded above by the graph of
f(x) = 1/x and below by the x-axis over the interval [1, 3]. Find the volume of the solid of revolution formed
by revolving R around the y-axis.

Solution: V = the integral from 1 to 3 of (2 pi x (1/x)) dx = the integral from 1 to 3 of 2 pi dx =
2 pi x evaluated from 1 to 3 = 2 pi (3 - 1) = 4 pi cubic units.

Deviation note: the book's next example (its Example 6.13) revolves f(x) = 2x - x^2 over [0,2] around the
y-axis by the same rule: V = 2 pi times the integral from 0 to 2 of (2x^2 - x^3) dx =
2 pi [2x^3/3 - x^4/4] evaluated from 0 to 2 = 2 pi (16/3 - 4) = 8 pi/3 cubic units (recomputed and confirmed).
It is condensed to this one line rather than given a full worked block, since it applies the same y-axis rule
just stated with no new technique.

### Revolving Around the x-axis

As with the disk and washer methods, the method of cylindrical shells can also be used for solids of revolution
formed by revolving a region around the x-axis, in which case we integrate with respect to y instead of x.

### Rule: The Method of Cylindrical Shells for Solids of Revolution around the x-axis
Let g(y) be continuous and nonnegative. Define Q as the region bounded on the right by the graph of g(y), on
the left by the y-axis, below by the line y = c, and above by the line y = d. Then the volume of the solid of
revolution formed by revolving Q around the x-axis is given by
V = the integral from c to d of (2 pi y g(y)) dy.

**EXAMPLE 6.14 (The Method of Cylindrical Shells for a Solid Revolved around the x-axis).** Define Q as the
region bounded on the right by the graph of g(y) = 2 sqrt(y) and on the left by the y-axis for y in [0, 4].
Find the volume of the solid of revolution formed by revolving Q around the x-axis.

Solution: V = the integral from 0 to 4 of (2 pi y (2 sqrt(y))) dy = 4 pi times the integral from 0 to 4 of
y^(3/2) dy = 4 pi [2 y^(5/2)/5] evaluated from 0 to 4 = 4 pi (2/5)(32) = 256 pi/5 cubic units. (Recomputed and
confirmed: 4^(5/2) = (4^(1/2))^5 = 2^5 = 32, so 4 pi (2/5)(32) = 256 pi/5.)

### Revolving Around a Line Other Than a Coordinate Axis

The shell-radius term in the volume integral is not tied to a coordinate axis. If a region bounded above by
f(x), below by the x-axis, on the left by x = a, and on the right by x = b is instead revolved around the
vertical line x = -k (k a positive constant), the outer and inner radii of each shell become x_i + k and
x_(i-1) + k in place of x_i and x_(i-1). Carrying the same algebra through as before gives
V_shell approximately equal to 2 pi (x_i* + k) f(x_i*) delta x, and in the limit,
V = the integral from a to b of (2 pi (x + k) f(x)) dx.
Revolving around other horizontal or vertical lines, such as a vertical line in the right half-plane, works the
same way: the x-term (or y-term) in the integrand must be replaced by an expression for that particular shell's
actual radius, measured from the axis of revolution.

**EXAMPLE 6.15 (A Region of Revolution Revolved around a Line).** Define R as the region bounded above by the
graph of f(x) = x and below by the x-axis over the interval [1, 2]. Find the volume of the solid of revolution
formed by revolving R around the line x = -1.

Solution: The radius of a shell here is x + 1. So V = the integral from 1 to 2 of (2 pi (x + 1) x) dx =
2 pi times the integral from 1 to 2 of (x^2 + x) dx = 2 pi [x^3/3 + x^2/2] evaluated from 1 to 2 =
2 pi ((8/3 + 2) - (1/3 + 1/2)) = 2 pi (23/6) = 23 pi/3 cubic units. (Recomputed and confirmed: 8/3 + 2 = 14/3,
1/3 + 1/2 = 5/6, and 14/3 - 5/6 = 28/6 - 5/6 = 23/6.)

### Regions Bounded by the Graphs of Two Functions

The method of cylindrical shells also applies when the region of revolution is bounded above by one function
and below by another: the height of each shell is then the difference of the two function values instead of a
single function value, while the radius term is unaffected if the axis of revolution is still the y-axis.

Deviation note: the book's corresponding example (its Example 6.16) defines R as the region bounded above by
f(x) = sqrt(x) and below by g(x) = 1/x over [1,4], revolved around the y-axis. Because the axis is the y-axis,
the shell radius is simply x, and only the height term f(x) - g(x) needs adjusting:
V = the integral from 1 to 4 of (2 pi x (sqrt(x) - 1/x)) dx = 2 pi times the integral from 1 to 4 of
(x^(3/2) - 1) dx = 2 pi [(2/5) x^(5/2) - x] evaluated from 1 to 4 = 2 pi (44/5 - (-3/5)) = 2 pi (47/5) =
94 pi/5 cubic units (recomputed and confirmed: at x = 4, (2/5)(32) - 4 = 64/5 - 20/5 = 44/5; at x = 1,
2/5 - 1 = -3/5). This example is condensed to a prose summary rather than a full worked block, since it reuses
the y-axis rule from Example 6.12 with only the two-function height adjustment as new content.

### Which Method Should We Use?

Choosing among the disk, washer, and shell methods often comes down to which resulting integral is easier to
set up and evaluate. Comparing the three methods for a solid of revolution around the x-axis:

- Disk method: V = the integral from a to b of pi [f(x)]^2 dx; the solid has no cavity in the center; the
  interval [a,b] on the x-axis is partitioned using vertical representative rectangles.
- Washer method: V = the integral from a to b of pi ([f(x)]^2 - [g(x)]^2) dx; the solid has a cavity in the
  center; the interval [a,b] on the x-axis is partitioned using vertical representative rectangles.
- Shell method: V = the integral from c to d of (2 pi y g(y)) dy; the solid may or may not have a cavity in the
  center; the interval [c,d] on the y-axis is partitioned using horizontal representative rectangles.

The book notes that the analogous comparison for solids of revolution around the y-axis is left for the reader
to work out by the same reasoning.

**EXAMPLE 6.17 (Selecting the Best Method).** For each region, select the best method to find the volume of
the solid of revolution generated by revolving the region around the x-axis, and set up the integral to find
the volume without evaluating it.

(a) The region bounded by the graphs of y = x, y = 2 - x, and the x-axis.

Solution: Integrating with respect to x requires splitting the region at x = 1, since y = x bounds it on
[0,1] and y = 2 - x bounds it on [1,2]; with the disk method this gives
V = the integral from 0 to 1 of (pi x^2) dx + the integral from 1 to 2 of (pi (2 - x)^2) dx. Using the shell
method instead, expressed in terms of y: on [0,1] the right boundary is x = 2 - y and the left boundary is
x = y, so V = the integral from 0 to 1 of (2 pi y [(2 - y) - y]) dy = the integral from 0 to 1 of
(2 pi y (2 - 2y)) dy. Neither integral is difficult, but the shell method needs only one integral and less
simplification, so it is the better choice here. (The integrals are left unevaluated, matching the book, since
the point of this example is choosing and setting up the method, not carrying out the arithmetic.)

(b) The region bounded by the graph of y = 4x - x^2 and the x-axis.

Solution: This region is bounded on the left and right by the same function, so no horizontal representative
rectangle can be defined and the shell method must be dismissed. The resulting solid has no cavity in the
center, so the disk method applies:
V = the integral from 0 to 4 of (pi (4x - x^2)^2) dx (again left unevaluated, for the same reason as in part a).

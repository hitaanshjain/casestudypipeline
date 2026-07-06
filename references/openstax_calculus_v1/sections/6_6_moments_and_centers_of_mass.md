# OpenStax Calculus Volume 1, Section 6.6: Moments and Centers of Mass

## Learning Objectives
- Find the center of mass of objects distributed along a line.
- Locate the center of mass of a thin plate.
- Use symmetry to help locate the centroid of a thin plate.
- Apply the theorem of Pappus for volume.

## Topic Keywords
- center of mass
- moment
- centroid
- lamina
- symmetry principle
- theorem of pappus
- point masses
- volume of revolution

## Content

This section considers centers of mass (also called centroids, under certain conditions) and moments. The basic
idea of the center of mass is the notion of a balancing point: for a single thin plate resting on the end of a
stick (without spinning it), there is one sweet spot where it balances perfectly, and that sweet spot is called
the center of mass of the plate. The section first examines these ideas in a one-dimensional context, then
expands to centers of mass of two-dimensional regions and symmetry, and closes by using centroids to find the
volume of certain solids by applying the theorem of Pappus.

### Center of Mass and Moments

Consider a long, thin wire or rod of negligible mass resting on a fulcrum, and suppose objects of mass m_1 and
m_2 are placed at distances d_1 and d_2 from the fulcrum on opposite sides, the way children sit on a playground
seesaw. The masses balance each other if and only if m_1 d_1 = m_2 d_2. In the seesaw the system is balanced by
moving the masses; in general the masses are fixed and the system is instead balanced by moving the fulcrum.
For two point masses m_1 and m_2 located on a number line at points x_1 and x_2, respectively, the center of
mass, x_bar, is the point where the fulcrum should be placed to make the system balance:
m_1 |x_bar - x_1| = m_2 |x_2 - x_bar|. Removing the absolute values for x_1 <= x_bar <= x_2 and solving for x_bar
gives
x_bar = (m_1 x_1 + m_2 x_2)/(m_1 + m_2).
The expression in the numerator, m_1 x_1 + m_2 x_2, is called the first moment of the system with respect to the
origin; when the context is clear, the word "first" is dropped and this expression is simply called the moment
of the system. The expression in the denominator, m_1 + m_2, is the total mass of the system. Thus the center of
mass of the system is the point at which the total mass could be concentrated without changing the moment. This
idea is not limited to two point masses: in general, if n masses m_1, m_2, ..., m_n are placed on a number line
at points x_1, x_2, ..., x_n, respectively, the center of mass of the system is given by
x_bar = (the sum, for i = 1 to n, of m_i x_i)/(the sum, for i = 1 to n, of m_i).

### Theorem 6.9: Center of Mass of Objects on a Line
Let m_1, m_2, ..., m_n be point masses placed on a number line at points x_1, x_2, ..., x_n, respectively, and let
m = the sum, for i = 1 to n, of m_i denote the total mass of the system. Then the moment of the system with
respect to the origin is given by
M = the sum, for i = 1 to n, of m_i x_i,
and the center of mass of the system is given by
x_bar = M/m.

**EXAMPLE 6.29 (Finding the Center of Mass of Objects along a Line).** Suppose four point masses are placed on a
number line as follows: m_1 = 30 kg placed at x_1 = -2 m, m_2 = 5 kg placed at x_2 = 3 m, m_3 = 10 kg placed at
x_3 = 6 m, and m_4 = 15 kg placed at x_4 = -3 m. Find the moment of the system with respect to the origin and
find the center of mass of the system.

Solution: The moment of the system is M = the sum, for i = 1 to 4, of m_i x_i =
30(-2) + 5(3) + 10(6) + 15(-3) = -60 + 15 + 60 - 45 = -30. The total mass of the system is
m = the sum, for i = 1 to 4, of m_i = 30 + 5 + 10 + 15 = 60 kg. Then x_bar = M/m = -30/60 = -1/2. The center of
mass is located 1/2 m to the left of the origin.

This idea generalizes to point masses in a plane. If a point mass m_1 is located at the point (x_1, y_1), the
moment M_x of the mass with respect to the x-axis is given by M_x = m_1 y_1, and similarly the moment M_y with
respect to the y-axis is given by M_y = m_1 x_1. Notice that the x-coordinate of the point is used to compute the
moment with respect to the y-axis, and vice versa: the x-coordinate gives the distance from the point mass to
the y-axis, and the y-coordinate gives the distance from the point mass to the x-axis.

### Theorem 6.10: Center of Mass of Objects in a Plane
Let m_1, m_2, ..., m_n be point masses located in the xy-plane at the points (x_1, y_1), (x_2, y_2), ...,
(x_n, y_n), respectively, and let m = the sum, for i = 1 to n, of m_i denote the total mass of the system. Then
the moments M_x and M_y of the system with respect to the x- and y-axes, respectively, are given by
M_x = the sum, for i = 1 to n, of m_i y_i and M_y = the sum, for i = 1 to n, of m_i x_i.
Also, the coordinates of the center of mass (x_bar, y_bar) of the system are
x_bar = M_y/m and y_bar = M_x/m.

**EXAMPLE 6.30 (Finding the Center of Mass of Objects in a Plane).** Suppose three point masses are placed in
the xy-plane as follows (coordinates given in meters): m_1 = 2 kg placed at (-1, 3), m_2 = 6 kg placed at (1, 1),
and m_3 = 4 kg placed at (2, -2). Find the center of mass of the system.

Solution: The total mass of the system is m = the sum, for i = 1 to 3, of m_i = 2 + 6 + 4 = 12 kg. The moments
with respect to the x- and y-axes are M_y = the sum, for i = 1 to 3, of m_i x_i = -2 + 6 + 8 = 12, and
M_x = the sum, for i = 1 to 3, of m_i y_i = 6 + 6 - 8 = 4. Then x_bar = M_y/m = 12/12 = 1 and
y_bar = M_x/m = 4/12 = 1/3. The center of mass of the system is (1, 1/3), in meters.

### Center of Mass of Thin Plates

So far we have looked at systems of point masses on a line and in a plane. Now, instead of having the mass of a
system concentrated at discrete points, suppose the mass of the system is distributed continuously across a
thin, flat sheet of material, assumed thin enough to be treated as two-dimensional; such a sheet is called a
lamina. The geometric center of the region occupied by a lamina is called its centroid. This section assumes the
density of the lamina is constant, so the center of mass of the lamina depends only on the shape of the
corresponding region in the plane and not on the density, and in this case the center of mass of the lamina
corresponds to the centroid of the region.

### Theorem 6.11: The Symmetry Principle
If a region R is symmetric about a line l, then the centroid of R lies on l.

This principle is stated without proof. It already explains why the center of mass of a rectangular lamina is
the point where its diagonals intersect: that is both the horizontal and vertical center of the rectangle.

Now consider a lamina bounded above by the graph of a continuous function f(x), below by the x-axis, and on the
left and right by the lines x = a and x = b. Partition [a, b] using a regular partition, and for
i = 1, 2, ..., n let x_i^* be the midpoint of the i-th subinterval [x_(i-1), x_i]. Construct a rectangle of
height f(x_i^*) over that subinterval; the center of mass of this rectangle is (x_i^*, f(x_i^*)/2). Let rho
denote the (constant) density of the lamina, in mass per unit area, so the mass of the representative rectangle
is rho f(x_i^*) delta x. Adding the masses of all n rectangles gives m approximately equal to the sum, for
i = 1 to n, of rho f(x_i^*) delta x, a Riemann sum; taking the limit as n -> infinity gives the exact mass of the
lamina. Treating each rectangle as a point mass located at its own center of mass does not change its moment, so
the moment of the representative rectangle with respect to the x-axis is its mass, rho f(x_i^*) delta x, times
the distance from its center of mass to the x-axis, f(x_i^*)/2, giving rho ([f(x_i^*)]^2/2) delta x; adding these
and taking the limit gives the moment of the lamina with respect to the x-axis. The distance from the
rectangle's center of mass to the y-axis is x_i^*, so the same reasoning gives the moment with respect to the
y-axis. These results are summarized in the following theorem.

### Theorem 6.12: Center of Mass of a Thin Plate in the xy-Plane
Let R denote a region bounded above by the graph of a continuous function f(x), below by the x-axis, and on the
left and right by the lines x = a and x = b, respectively. Let rho denote the density of the associated lamina.
Then:
i. The mass of the lamina is m = rho * (the integral from a to b of f(x) dx).
ii. The moments M_x and M_y of the lamina with respect to the x- and y-axes, respectively, are
M_x = rho * (the integral from a to b of [f(x)]^2/2 dx) and M_y = rho * (the integral from a to b of x f(x) dx).
iii. The coordinates of the center of mass (x_bar, y_bar) are x_bar = M_y/m and y_bar = M_x/m.

**EXAMPLE 6.31 (Finding the Center of Mass of a Lamina).** Let R be the region bounded above by the graph of the
function f(x) = sqrt(x) and below by the x-axis over the interval [0, 4]. Find the centroid of the region.

Solution: Since only the centroid of the region, not the mass or moments of an actual lamina, is requested, the
density constant rho cancels out of the final answer, so assume rho = 1 for convenience. The total mass is
m = the integral from 0 to 4 of sqrt(x) dx = (2/3)x^(3/2) evaluated from 0 to 4 = (2/3)(8 - 0) = 16/3. The
moments are M_x = the integral from 0 to 4 of x/2 dx = (1/4)x^2 evaluated from 0 to 4 = 4, and
M_y = the integral from 0 to 4 of x sqrt(x) dx = the integral from 0 to 4 of x^(3/2) dx =
(2/5)x^(5/2) evaluated from 0 to 4 = (2/5)(32 - 0) = 64/5. Thus x_bar = M_y/m = (64/5)/(16/3) = 12/5 and
y_bar = M_x/m = 4/(16/3) = 3/4. The centroid of the region is (12/5, 3/4).

Now suppose instead that the lamina is bounded above by a continuous function f(x) and below by a second
continuous function g(x), over the same kind of interval [a, b], rather than by the x-axis. The book notes it
will not repeat every step of the Riemann-sum argument for this case, but highlights the key changes: each
representative rectangle now has height f(x_i^*) - g(x_i^*) and center of mass (x_i^*, (f(x_i^*)+g(x_i^*))/2), so
its mass is rho [f(x_i^*) - g(x_i^*)] delta x, and its moment with respect to the x-axis is the mass of the
rectangle times the distance from its center of mass to the x-axis, (f(x_i^*)+g(x_i^*))/2, giving
rho (1/2){[f(x_i^*)]^2 - [g(x_i^*)]^2} delta x. Taking the same Riemann-sum limits as before gives the following
theorem.

### Theorem 6.13: Center of Mass of a Lamina Bounded by Two Functions
Let R denote a region bounded above by the graph of a continuous function f(x), below by the graph of a
continuous function g(x), and on the left and right by the lines x = a and x = b, respectively. Let rho denote
the density of the associated lamina. Then:
i. The mass of the lamina is m = rho * (the integral from a to b of [f(x) - g(x)] dx).
ii. The moments M_x and M_y of the lamina with respect to the x- and y-axes, respectively, are
M_x = rho * (the integral from a to b of (1/2)([f(x)]^2 - [g(x)]^2) dx) and
M_y = rho * (the integral from a to b of x[f(x) - g(x)] dx).
iii. The coordinates of the center of mass (x_bar, y_bar) are x_bar = M_y/m and y_bar = M_x/m.

**EXAMPLE 6.32 (Finding the Centroid of a Region Bounded by Two Functions).** Let R be the region bounded above
by the graph of the function f(x) = 1 - x^2 and below by the graph of the function g(x) = x - 1. Find the
centroid of the region.

Solution: The two graphs intersect at (-2, -3) and (1, 0), so integrate from -2 to 1; assume rho = 1 for
convenience. The total mass is m = the integral from -2 to 1 of [1 - x^2 - (x - 1)] dx =
the integral from -2 to 1 of (2 - x^2 - x) dx = [2x - (1/3)x^3 - (1/2)x^2] evaluated from -2 to 1 =
(2 - 1/3 - 1/2) - (-4 + 8/3 - 2) = 9/2. The moments are
M_x = (1/2) * (the integral from -2 to 1 of ((1 - x^2)^2 - (x - 1)^2) dx) =
(1/2) * (the integral from -2 to 1 of (x^4 - 3x^2 + 2x) dx) =
(1/2)[x^5/5 - x^3 + x^2] evaluated from -2 to 1 = -27/10, and
M_y = the integral from -2 to 1 of x[(1 - x^2) - (x - 1)] dx = the integral from -2 to 1 of (2x - x^3 - x^2) dx =
[x^2 - x^4/4 - x^3/3] evaluated from -2 to 1 = -9/4. Thus x_bar = M_y/m = (-9/4)/(9/2) = -1/2 and
y_bar = M_x/m = (-27/10)/(9/2) = -3/5. The centroid of the region is (-1/2, -3/5).

### The Symmetry Principle in Practice

The symmetry principle (Theorem 6.11) is especially useful when a region is symmetric about a coordinate axis:
the corresponding coordinate of the centroid is then immediately zero, so only the other coordinate needs to be
computed.

**EXAMPLE 6.33 (Finding the Centroid of a Symmetric Region).** Let R be the region bounded above by the graph of
the function f(x) = 4 - x^2 and below by the x-axis. Find the centroid of the region.

Solution: The region runs from x = -2 to x = 2 and is symmetric with respect to the y-axis, so x_bar = 0 by the
symmetry principle, and only y_bar needs to be computed; assume rho = 1 for convenience. The total mass is
m = the integral from -2 to 2 of (4 - x^2) dx = [4x - x^3/3] evaluated from -2 to 2 = 32/3. The moment is
M_x = (1/2) * (the integral from -2 to 2 of (4 - x^2)^2 dx) =
(1/2) * (the integral from -2 to 2 of (16 - 8x^2 + x^4) dx) =
(1/2)[16x - (8/3)x^3 + x^5/5] evaluated from -2 to 2 = 256/15. Thus y_bar = M_x/m = (256/15)/(32/3) = 8/5. The
centroid of the region is (0, 8/5).

Deviation note: immediately after Example 6.33, the book presents an extended Student Project applying these
formulas to the Grand Canyon Skywalk, a real cantilevered observation platform modeled as three lamina
sub-regions of a U-shaped structure. That applied project is cross-referenced here but not reproduced, per this
corpus's convention of omitting Student Project material; no theorem, definition, or formula from the section is
lost by the omission.

### Theorem of Pappus for Volume

The section closes with the theorem of Pappus for volume, which finds the volume of certain solids of revolution
using only the area and the centroid of the generating region. (The book notes there is also a theorem of Pappus
for surface area, but calls it much less useful and does not develop it further.)

### Theorem 6.14: Theorem of Pappus for Volume
Let R be a region in the plane and let l be a line in the plane that does not intersect R. Then the volume of
the solid of revolution formed by revolving R around l is equal to the area of R multiplied by the distance d
traveled by the centroid of R.

Proof (for the case of a region bounded above by f(x) and below by g(x) over [a, b], with axis of revolution the
y-axis): the area of the region is A = the integral from a to b of [f(x) - g(x)] dx. Since the axis of revolution
is the y-axis, the distance traveled by the centroid depends only on its x-coordinate, x_bar = M_y/m, where
m = rho * (the integral from a to b of [f(x) - g(x)] dx) and
M_y = rho * (the integral from a to b of x[f(x) - g(x)] dx). The centroid travels once around a circle of radius
x_bar, so d = 2 pi * x_bar; substituting the expressions for M_y and m and canceling rho gives
d = 2 pi * (the integral from a to b of x[f(x) - g(x)] dx)/(the integral from a to b of [f(x) - g(x)] dx), so
d * A = 2 pi * (the integral from a to b of x[f(x) - g(x)] dx). By the method of cylindrical shells, the volume
of the solid of revolution is V = 2 pi * (the integral from a to b of x[f(x) - g(x)] dx). Comparing the two
expressions gives V = d * A, and the proof is complete.

**EXAMPLE 6.34 (Using the Theorem of Pappus for Volume).** Let R be a circle of radius 2 centered at (4, 0). Use
the theorem of Pappus for volume to find the volume of the torus generated by revolving R around the y-axis.

Solution: The region R is a circle of radius 2, so its area is A = 4 pi square units. By the symmetry principle,
the centroid of R is the center of the circle, (4, 0), so the centroid travels around the y-axis in a circular
path of radius 4, a distance d = 2 pi (4) = 8 pi units. The volume of the torus is then
A * d = (4 pi)(8 pi) = 32 pi^2 cubic units.

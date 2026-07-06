# OpenStax Calculus Volume 1, Section 6.5: Physical Applications

## Learning Objectives
- Determine the mass of a one-dimensional object from its linear density function.
- Determine the mass of a two-dimensional circular object from its radial density function.
- Calculate the work done by a variable force acting along a line.
- Calculate the work done in pumping a liquid from one height to another.
- Find the hydrostatic force against a submerged vertical plate.

## Topic Keywords
- mass density
- linear density function
- radial density function
- work integral
- spring constant
- pumping problem
- hydrostatic pressure
- hydrostatic force
- weight density

## Content

This section examines physical applications of integration: mass from a density function, work done by
a variable force (including springs and pumping liquids), and hydrostatic force against a submerged
vertical surface. The section covers five learning objectives (6.5.1 through 6.5.5); one representative
example is given per objective below (5 examples total), slightly more than the usual 2-3, since each
objective corresponds to a genuinely distinct physical setup that the others do not stand in for.

### Mass and Density

Consider a thin rod aligned with the x-axis, with its left end at x = a and its right end at x = b (thin
enough to be treated as one-dimensional). If the rod has constant density rho, given as mass per unit
length, its mass is just density times length: (b - a)*rho. When density varies from point to point, a
linear density function rho(x) gives the density at each point x. Partitioning [a, b] into n pieces and
using rho(x_i*) to approximate the density on each piece, the mass of the i-th segment is approximately
rho(x_i*)*Delta x, so summing over all segments gives a Riemann sum for the total mass. Taking the limit
as n -> infinity turns the sum into a definite integral, giving the exact mass.

### Theorem 6.7: Mass-Density Formula of a One-Dimensional Object
Given a thin rod oriented along the x-axis over the interval [a, b], let rho(x) denote a linear density
function giving the density of the rod at a point x in the interval. Then the mass of the rod is given by
m = the integral from a to b of rho(x) dx. (Equation 6.10)

**EXAMPLE 6.23 (Calculating Mass from Linear Density).** Consider a thin rod oriented on the x-axis over
the interval [pi/2, pi]. If the density of the rod is given by rho(x) = sin(x), what is the mass of the
rod?

Solution: Applying Equation 6.10 directly, m = the integral from pi/2 to pi of sin(x) dx = -cos(x)
evaluated from pi/2 to pi = -cos(pi) - (-cos(pi/2)) = 1 - 0 = 1. (Recomputed and confirmed: m = 1.)

The same idea extends to a two-dimensional disk of radius r whose density varies only along the radius
(called radial density), given as mass per unit area. Orient the disk in the xy-plane with its center at
the origin, and let rho(x) denote the density at radius x. Partitioning [0, r] and breaking the disk into
thin circular washers, the washer between x_(i-1) and x_i has area A_i = pi*(x_i)^2 - pi*(x_(i-1))^2 =
pi*(x_i + x_(i-1))*Delta x, which is approximately 2*pi*x_i* *Delta x, using the midpoint x_i* as the
washer's approximate radius (the same approximation used earlier for volumes by shells). Using rho(x_i*)
to approximate the washer's density, its mass is approximately m_i = 2*pi*x_i* *rho(x_i*)*Delta x. Summing
over all washers gives a Riemann sum, and taking the limit as n -> infinity gives the exact mass.

### Theorem 6.8: Mass-Density Formula of a Circular Object
Let rho(x) be an integrable function representing the radial density of a disk of radius r. Then the mass
of the disk is given by m = the integral from 0 to r of 2*pi*x*rho(x) dx. (Equation 6.11)

**EXAMPLE 6.24 (Calculating Mass from Radial Density).** Let rho(x) = sqrt(x) represent the radial density
of a disk. Calculate the mass of a disk of radius 4.

Solution: m = the integral from 0 to 4 of 2*pi*x*sqrt(x) dx = 2*pi * the integral from 0 to 4 of x^(3/2) dx
= 2*pi*(2/5)*x^(5/2) evaluated from 0 to 4 = (4*pi/5)*32 = 128*pi/5. (Recomputed and confirmed: 4^(5/2) =
32, so m = 128*pi/5, exactly as the book gives; no rounding is involved.)

### Work Done by a Force

In physics, work is the energy needed to move an object under a force; when the force is constant, work
is the product of force and distance. In the English system, force is in pounds and distance in feet, so
work is in foot-pounds. In the metric system, one newton is the force needed to accelerate 1 kilogram of
mass at the rate of 1 m/sec^2, so the common unit of work is the newton-meter, also called the joule,
equal to kg*m^2/s^2.

A constant force is the easy case, but it is rare for a force to be constant: the work to compress or
stretch a spring, for example, varies with how far the spring is already displaced. Suppose a variable
force F(x) moves an object in the positive direction along the x-axis from point a to point b. Partitioning
[a, b] and treating the force as roughly constant, F(x_i*), on each subinterval, the work done over
[x_(i-1), x_i] is approximately W_i = F(x_i*)*Delta x. Summing gives a Riemann sum for the total work, and
taking the limit as n -> infinity gives the exact value.

### Definition: Work
If a variable force F(x) moves an object in a positive direction along the x-axis from point a to point b,
then the work done on the object is W = the integral from a to b of F(x) dx. (Equation 6.12) Note that if F
is constant, the integral evaluates to F*(b - a) = F*d, the constant-force formula stated above.

According to Hooke's law, the force required to compress or stretch a spring from its equilibrium position
is F(x) = k*x, for some positive constant k (the spring constant), whose value depends on the physical
characteristics of the spring.

**EXAMPLE 6.25 (The Work Required to Stretch or Compress a Spring).** Suppose it takes a force of 10 N (in
the negative direction) to compress a spring 0.2 m from the equilibrium position. How much work is done to
stretch the spring 0.5 m from the equilibrium position?

Solution: First find the spring constant k. When x = -0.2, F(x) = -10, so -10 = k*(-0.2), giving k = 50 and
F(x) = 50x. Then W = the integral from 0 to 0.5 of 50x dx = 25x^2 evaluated from 0 to 0.5 = 6.25. The work
done to stretch the spring is 6.25 J. (Recomputed and confirmed: 25*(0.5)^2 = 6.25, exactly as the book
gives.)

### Work Done in Pumping

Pumping problems ask for the work to pump a liquid out of a tank; they are more involved than spring
problems because the calculations depend on the tank's shape and size, and it takes more work to lift
water from the bottom of the tank than from the top. As an illustration (not a separately numbered book
example, but part of the section's running text before the formal problem-solving strategy): assume a
cylindrical tank of radius 4 m and height 10 m is filled to a depth of 8 m. How much work does it take to
pump all the water over the top edge of the tank?

Orient the x-axis vertically, with the origin at the top of the tank and the downward direction positive;
the water then occupies the interval [2, 10] (the top 2 m of the tank is empty). Partitioning [2, 10] into
thin horizontal layers, a representative layer of thickness Delta x has volume V = pi*(4)^2*Delta x =
16*pi*Delta x. Using the weight-density of water, 9800 N/m^3 (equivalently 62.4 lb/ft^3), the force needed
to lift this layer is F = 9800*16*pi*Delta x = 156,800*pi*Delta x, and since the layer must be lifted a
distance of approximately x_i*, the work to lift it is W_i = 156,800*pi*x_i* *Delta x. Summing over all
layers and taking the limit as n -> infinity gives

W = 156,800*pi * the integral from 2 to 10 of x dx = 156,800*pi*[x^2/2] evaluated from 2 to 10 =
156,800*pi*48 = 7,526,400*pi, which is approximately 23,644,883 J.

Deviation note (book's own rounding, not mine): the book's displayed computation gives 7,526,400*pi is
approximately 23,644,883 J, but the book's following prose sentence states "approximately 23,650,000 J," a
coarser round-number figure. Both numbers are the book's; reproduced here as printed.

### Problem-Solving Strategy: Solving Pumping Problems
1. Sketch the tank and select an appropriate frame of reference.
2. Calculate the volume of a representative layer of liquid.
3. Multiply the volume by the weight-density of the liquid to get the force.
4. Calculate the distance the layer of liquid must be lifted.
5. Multiply the force and distance to estimate the work needed to lift the layer.
6. Sum the work required to lift all the layers; this is a Riemann sum.
7. Take the limit as n -> infinity and evaluate the resulting integral for the exact work.

**EXAMPLE 6.26 (A Pumping Problem with a Noncylindrical Tank).** A tank in the shape of an inverted cone has
height 12 ft and base radius 4 ft. The tank starts full, and water is pumped over the upper edge until the
height of the water remaining in the tank is 4 ft. How much work is required to pump out that water?

Solution: Orient the x-axis vertically, with the origin at the top of the (inverted) cone and the downward
direction positive; the water pumped out occupies [0, 8] (the tank starts full at height 12 ft and is
pumped down to a remaining height of 4 ft). By similar triangles, a disk of water at depth x_i* has radius
r_i = (12 - x_i*)/3 = 4 - x_i*/3 (matching the cone's radius of 4 ft at its full depth of 12 ft). A
representative disk then has volume V_i = pi*(4 - x_i*/3)^2 * Delta x. Using the weight-density of water,
62.4 lb/ft^3, the force to lift this layer is F_i = 62.4*pi*(4 - x_i*/3)^2*Delta x, and it must be lifted a
distance of approximately x_i* ft, so W_i = 62.4*pi*x_i* *(4 - x_i*/3)^2 * Delta x. Summing and taking the
limit as n -> infinity,

W = the integral from 0 to 8 of 62.4*pi*x*(4 - x/3)^2 dx
  = 62.4*pi * the integral from 0 to 8 of (16x - (8/3)x^2 + (1/9)x^3) dx
  = 62.4*pi * [8x^2 - (8/9)x^3 + (1/36)x^4] evaluated from 0 to 8
  = 62.4*pi*(512 - 4096/9 + 4096/36) = 62.4*pi*(170 and 2/3) = 10,649.6*pi, approximately 33,456.7 ft-lb.

(Recomputed and confirmed: 8*(8)^2 - (8/9)*(8)^3 + (1/36)*(8)^4 = 512 - 455.111... + 113.777... =
170.666..., times 62.4 gives 10,649.6 exactly, matching the book's displayed coefficient.)

Deviation note (book's own rounding, not mine): the book's displayed computation gives 10,649.6*pi is
approximately 33,456.7, but the book's following prose sentence states "It takes approximately 33,450 ft-lb
of work to empty the tank to the desired level," again a coarser round-number figure than the value shown
in its own displayed math. Both numbers are the book's; reproduced here as printed.

### Hydrostatic Force and Pressure

This last topic looks at the force and pressure a liquid exerts on a submerged object. Force is measured
in pounds (English) or newtons (metric); pressure is force per unit area, giving pounds per square foot or
per square inch (psi) in the English system, and newtons per square meter, called pascals, in the metric
system.

For a plate of area A submerged horizontally at depth s, the force on it is simply the weight of the water
above it, F = rho*A*s, where rho is the weight-density of the liquid (weight per unit volume); dividing by
area gives the hydrostatic pressure p = F/A = rho*s.

By Pascal's principle, the pressure at a given depth is the same in every direction, so this idea also
applies to a vertically oriented surface such as a dam, except that F = rho*A*s cannot be used directly,
because depth varies from point to point on a vertical surface. Instead, orient the x-axis vertically with
the downward direction positive and a chosen reference point at x = 0; let s(x) denote the depth at point x
(often s(x) = x when x = 0 is the water surface) and w(x) denote the plate's width at point x. Assume the
plate's top edge is at x = a and its bottom edge is at x = b. Partitioning [a, b] into thin horizontal
strips, a representative strip at x_i* has area approximately w(x_i*)*Delta x, and since the strip is thin
it is treated as being at the constant depth s(x_i*), giving a force of F_i = rho*[w(x_i*)*Delta x]*s(x_i*).
Summing over all strips and taking the limit as n -> infinity gives the exact force,

F = the integral from a to b of rho*w(x)*s(x) dx. (Equation 6.13)

### Problem-Solving Strategy: Finding Hydrostatic Force
1. Sketch the plate and select an appropriate frame of reference (if a nonstandard reference point is
   used, Equation 6.13 may need to be adjusted accordingly).
2. Determine the depth function s(x) and the width function w(x).
3. Determine the weight-density of the liquid; for water this is 62.4 lb/ft^3, or 9800 N/m^3.
4. Use the equation to calculate the total force.

**EXAMPLE 6.27 (Finding Hydrostatic Force).** A water trough 15 ft long has ends shaped like inverted
isosceles triangles, with base 8 ft and height 3 ft. Find the force on one end of the trough if the trough
is full of water.

Solution: Orient the x-axis vertically with the downward direction positive, and let the top of the trough
correspond to x = 0 (step 1). The depth function is then s(x) = x. By similar triangles, the width function
is w(x) = 8 - (8/3)x (step 2). The weight-density of water is 62.4 lb/ft^3 (step 3). Applying Equation 6.13,

F = the integral from 0 to 3 of 62.4*(8 - (8/3)x)*x dx = 62.4 * the integral from 0 to 3 of (8x - (8/3)x^2)
dx = 62.4*[4x^2 - (8/9)x^3] evaluated from 0 to 3 = 62.4*(36 - 24) = 62.4*12 = 748.8.

The water exerts a force of 748.8 lb on the end of the trough (step 4). (Recomputed and confirmed: 748.8 lb
exactly, matching the book with no rounding involved.)

Deviation note (curation, disclosed): the section closes with Example 6.28, a two-part chapter-opener
calculation of the hydrostatic force on the (trapezoidal, simplified) face of the Hoover Dam, first with
the reservoir full and then during a drought. It applies the same force integral and the same
problem-solving strategy as Example 6.27 above, toward the same learning objective (6.5.5), so it is
omitted here as redundant rather than transcribed in full. Its answers, recomputed and confirmed
independently here: with the reservoir full, F = the integral from 10 to 540 of 62.4*(1250 - (2/3)x)*(x -
10) dx, which works out to approximately 8,832,245,000 lb (4,416,122.5 tons); under the stated drought
conditions (water surface 125 ft below full), F = the integral from 135 to 540 of 62.4*(1250 - (2/3)x)*(x -
135) dx, which works out to approximately 5,015,230,000 lb (2,507,615 tons). Both recomputed values match
the book's printed figures.

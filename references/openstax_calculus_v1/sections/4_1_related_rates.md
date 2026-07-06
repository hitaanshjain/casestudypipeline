# OpenStax Calculus Volume 1, Section 4.1: Related Rates

## Learning Objectives
- Express changing quantities in terms of derivatives.
- Find relationships among the derivatives in a given problem.
- Use the chain rule to find the rate of change of one quantity that depends on the rate of change of
  other quantities.

## Topic Keywords
- related rates
- differentiating with respect to time
- chain rule
- pythagorean theorem in related rates
- trigonometric ratios in related rates
- similar triangles
- rate of change of volume
- related-rates problem-solving strategy

## Content

### Setting up related-rates problems
We have seen that for quantities that are changing over time, the rates at which these quantities change
are given by derivatives. If two related quantities are changing over time, the rates at which the
quantities change are related. For example, if a balloon is being filled with air, both the radius of the
balloon and the volume of the balloon are increasing. In many real-world applications, related quantities
are changing with respect to time. If we consider the balloon example, the rate of change in the volume,
V, is related to the rate of change in the radius, r. In this case we say that dV/dt and dr/dt are related
rates because V is related to r. This section studies several examples of related quantities that are
changing with respect to time and how to calculate one rate of change given another.

**EXAMPLE 4.1 (Inflating a Balloon).** A spherical balloon is being filled with air at the constant rate of
2 cm^3/sec. How fast is the radius increasing when the radius is 3 cm?

Solution:
The volume of a sphere of radius r centimeters is V = (4/3)pi r^3 cm^3. Since the balloon is being filled
with air, both the volume and the radius are functions of time, so t seconds after beginning to fill the
balloon, the volume of air in the balloon is V(t) = (4/3)pi [r(t)]^3 cm^3. Differentiating both sides of
this equation with respect to time and applying the chain rule, the rate of change in the volume is related
to the rate of change in the radius by the equation V'(t) = 4 pi [r(t)]^2 r'(t). The balloon is being filled
with air at the constant rate of 2 cm^3/sec, so V'(t) = 2 cm^3/sec. Therefore 2 = 4 pi [r(t)]^2 r'(t), which
implies r'(t) = 1/(2 pi [r(t)]^2) cm/sec. When the radius r = 3 cm, r'(t) = 1/(18 pi) cm/sec.

### Problem-solving strategy: solving a related-rates problem
1. Assign symbols to all variables involved in the problem. Draw a figure if applicable.
2. State, in terms of the variables, the information that is given and the rate to be determined.
3. Find an equation relating the variables introduced in step 1.
4. Using the chain rule, differentiate both sides of the equation found in step 3 with respect to the
   independent variable (usually time t). This new equation will relate the derivatives.
5. Substitute all known values into the equation from step 4, then solve for the unknown rate of change.

When solving a related-rates problem it is crucial not to substitute known values too soon. If the value
for a changing quantity is substituted into an equation before both sides of the equation are
differentiated, that quantity will behave as a constant and its derivative will not appear in the new
equation found in step 4; the following example both demonstrates the correct method and illustrates this
potential error.

### Examples of the process
The strategy above is now implemented on two further related-rates setups drawn from distinct
relationships: a distance problem set up with the Pythagorean theorem, and an angle-of-elevation problem
set up with a trigonometric ratio.

**EXAMPLE 4.2 (An Airplane Flying at a Constant Elevation).** An airplane is flying overhead at a constant
elevation of 4000 ft. A man is viewing the plane from a position 3000 ft from the base of a radio tower.
The airplane is flying horizontally away from the man. If the plane is flying at the rate of 600 ft/sec, at
what rate is the distance between the man and the plane increasing when the plane passes over the radio
tower?

Solution:
Step 1. Let x denote the distance between the man and the position on the ground directly below the
airplane, and let s denote the distance between the man and the plane; both x and s are functions of time.
No variable is introduced for the height of the plane because it remains at a constant elevation of
4000 ft, so the line segment of length 4000 ft is perpendicular to the line segment of length x, creating a
right triangle.
Step 2. Since x denotes the horizontal distance between the man and the point on the ground below the
plane, dx/dt represents the speed of the plane, so dx/dt = 600 ft/sec. We need to find ds/dt when x = 3000
ft.
Step 3. By the Pythagorean theorem, [x(t)]^2 + 4000^2 = [s(t)]^2.
Step 4. Differentiating this equation with respect to time, and using the fact that the derivative of a
constant is zero, gives x (dx/dt) = s (ds/dt).
Step 5. When x = 3000, the Pythagorean theorem gives 3000^2 + 4000^2 = s^2, so s = 5000 ft at the time of
interest. Using dx/dt = 600, x = 3000, and s = 5000, ds/dt solves (3000)(600) = (5000)(ds/dt), so
ds/dt = (3000 * 600)/5000 = 360 ft/sec.

Note on the substitute-too-soon error: in step 3 the variable quantities x(t) and s(t) were related by
[x(t)]^2 + 4000^2 = [s(t)]^2, with x(t) left as a variable because it is still changing. If x(t) = 3000 were
mistakenly substituted into this equation before differentiating, the equation would become
3000^2 + 4000^2 = [s(t)]^2, and differentiating that equation would produce 0 = s(t) (ds/dt), from which one
would incorrectly conclude ds/dt = 0. Substituting a changing quantity's specific value before
differentiating freezes it as a constant, and its derivative is lost from the resulting equation.

**EXAMPLE 4.3 (Chapter Opener: A Rocket Launch).** A rocket is launched so that it rises vertically. A
camera is positioned 5000 ft from the launch pad. When the rocket is 1000 ft above the launch pad, its
velocity is 600 ft/sec. Find the necessary rate of change of the camera's angle as a function of time so
that it stays focused on the rocket.

Solution:
Step 1. Let h denote the height of the rocket above the launch pad and theta be the angle between the
camera lens and the ground.
Step 2. We need d(theta)/dt when h = 1000 ft, given the rocket's velocity dh/dt = 600 ft/sec at that
instant.
Step 3. Using the right triangle formed by the camera, the launch pad, and the rocket, tan(theta) is the
ratio of the opposite side (h) to the adjacent side (5000), so tan(theta) = h/5000, i.e. h = 5000 tan(theta).
Step 4. Differentiating this equation with respect to time t gives dh/dt = 5000 sec^2(theta) * d(theta)/dt.
Step 5. We need sec^2(theta) when h = 1000. Since sec(theta) is the ratio of the hypotenuse to the adjacent
side (5000 ft), and the opposite side is h = 1000 ft, the Pythagorean theorem gives a hypotenuse of
c = sqrt(1000^2 + 5000^2) = 1000 sqrt(26) ft. Therefore sec^2(theta) = (1000 sqrt(26)/5000)^2 = 26/25.
Substituting dh/dt = 600 and sec^2(theta) = 26/25 into dh/dt = 5000 sec^2(theta) d(theta)/dt gives
600 = 5000 (26/25) d(theta)/dt. Therefore d(theta)/dt = 3/26 rad/sec.

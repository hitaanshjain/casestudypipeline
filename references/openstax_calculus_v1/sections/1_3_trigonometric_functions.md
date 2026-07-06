# OpenStax Calculus Volume 1, Section 1.3: Trigonometric Functions

## Learning Objectives
- Convert angle measures between degrees and radians.
- Recognize the triangular and circular definitions of the basic trigonometric functions.
- Write the basic trigonometric identities.
- Identify the graphs and periods of the trigonometric functions.
- Describe the shift of a sine or cosine graph from the equation of the function.

## Topic Keywords
- radian and degree measure
- unit circle definitions
- six trigonometric functions
- trigonometric identities
- right triangle ratios
- periodic functions
- amplitude and phase shift

## Content

### Radian measure
The radian measure of an angle theta is the length s of the corresponding arc on the
unit circle. An angle of 360 degrees corresponds to the full circumference 2 pi, so
360 degrees = 2 pi radians and 180 degrees = pi radians. Conversion factor:
1 = (pi rad)/180deg = 180deg/(pi rad). Common values: 0deg=0, 30deg=pi/6, 45deg=pi/4,
60deg=pi/3, 90deg=pi/2, 120deg=2pi/3, 135deg=3pi/4, 150deg=5pi/6, 180deg=pi.

**EXAMPLE 1.22 (Converting between Radians and Degrees).**
a. Express 225 degrees using radians. b. Express 5pi/3 rad using degrees.

Solution: a. 225 deg * (pi/180deg) = 5pi/4 rad.
b. (5pi/3 rad) * (180deg/pi) = 300 deg.

### The six trigonometric functions
Definition: let P = (x, y) be a point on the unit circle centered at the origin O, and
theta an angle with initial side along the positive x-axis and terminal side OP. Then
sin(theta) = y, cos(theta) = x, tan(theta) = y/x, csc(theta) = 1/y, sec(theta) = 1/x,
cot(theta) = x/y. If x = 0, sec and tan are undefined; if y = 0, cot and csc are
undefined. For a point on a circle of radius r: x = r cos(theta), y = r sin(theta).

Key values of sin/cos in the first quadrant: theta=0: (0,1); theta=pi/6:
(1/2, sqrt(3)/2); theta=pi/4: (sqrt(2)/2, sqrt(2)/2); theta=pi/3: (sqrt(3)/2, 1/2);
theta=pi/2: (1,0), listed as (sin, cos).

Right-triangle ratios: let theta be an acute angle of a right triangle with A the
adjacent leg, O the opposite leg, H the hypotenuse. Then sin(theta)=O/H, cos(theta)=A/H,
tan(theta)=O/A, csc(theta)=H/O, sec(theta)=H/A, cot(theta)=A/O.

**EXAMPLE 1.24 (Constructing a Wooden Ramp).** A ramp rises to the top of a
staircase 4 ft off the ground, with the angle between the ground and ramp equal to 10
degrees. How long must the ramp be?

Solution: Let x be the ramp length. sin(10 deg) = 4/x, so x = 4/sin(10 deg) ~ 23.035 ft.

### Reference data: trigonometric identities
Reciprocal identities: tan(theta) = sin(theta)/cos(theta), cot(theta) =
cos(theta)/sin(theta), csc(theta) = 1/sin(theta), sec(theta) = 1/cos(theta).
Pythagorean identities: sin^2(theta) + cos^2(theta) = 1, 1 + tan^2(theta) =
sec^2(theta), 1 + cot^2(theta) = csc^2(theta).
Addition/subtraction formulas: sin(a +/- b) = sin(a)cos(b) +/- cos(a)sin(b);
cos(a +/- b) = cos(a)cos(b) -/+ sin(a)sin(b).
Double-angle formulas: sin(2 theta) = 2 sin(theta) cos(theta); cos(2 theta) =
2cos^2(theta) - 1 = 1 - 2sin^2(theta) = cos^2(theta) - sin^2(theta).

Worked identity proof: to prove 1 + tan^2(theta) = sec^2(theta), start from
sin^2(theta) + cos^2(theta) = 1 and divide both sides by cos^2(theta):
sin^2(theta)/cos^2(theta) + 1 = 1/cos^2(theta), i.e. tan^2(theta) + 1 = sec^2(theta).

### Periods and graphs
The period of a function f is the smallest positive p such that f(x+p) = f(x) for all x
in the domain. sin, cos, sec, csc all have period 2 pi. tan and cot have period pi
(they repeat on intervals of length pi).

### Amplitude, period, and phase shift
For f(x) = A cos(B(x - alpha)) + C: alpha causes a horizontal (phase) shift; B changes
the period to 2 pi / |B|; A is a vertical stretch by |A| (the amplitude); C causes a
vertical shift. Also, cos(x) = sin(x + pi/2) and sin(x) = cos(x - pi/2) (cosine is sine
shifted left pi/2). A shifted sine curve models periodic real-world data, e.g. daylight
hours h as a function of day of year t: h(t) = 3.7 sin((2pi/365)(t - 80.5)) + 12, for a
location with 15.7 hours of daylight on the longest day and 8.3 on the shortest.

**EXAMPLE 1.27 (Sketching the Graph of a Transformed Sine Curve).** Sketch a
graph of f(x) = 3 sin(2(x - pi/4)) + 1.

Solution: this is a horizontal compression of y = sin(x) by a factor of 2 (period
2pi/2 = pi), a phase shift right by pi/4, a vertical stretch by a factor of 3, and a
vertical shift up 1 unit.

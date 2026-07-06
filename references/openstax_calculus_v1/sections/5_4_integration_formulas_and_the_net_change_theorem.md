# OpenStax Calculus Volume 1, Section 5.4: Integration Formulas and the Net Change Theorem

## Learning Objectives
- Apply the basic integration formulas.
- Explain the significance of the net change theorem.
- Use the net change theorem to solve applied problems.
- Apply the integrals of odd and even functions.

## Topic Keywords
- basic integration formulas
- net change theorem
- net displacement
- total distance traveled
- rate of change
- even function
- odd function
- symmetric interval

## Content

This section uses basic integration formulas established earlier to solve key applied problems. These formulas
are presented in terms of indefinite integrals. Although definite and indefinite integrals are closely related,
there are key differences to keep in mind: a definite integral is either a number (when the limits of integration
are constants) or a single function (when one or both limits of integration are variables), while an indefinite
integral represents a family of functions, all of which differ by a constant. As you become more familiar with
integration you will naturally select the correct approach for a given problem, but until then, think carefully
about whether a problem calls for a definite integral or an indefinite integral.

### Basic Integration Formulas

Recall the integration formulas established when antiderivatives were introduced, each following directly from
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

Also recall the power rule for integrals (for n != -1, the integral of x^n dx = x^(n+1)/(n+1) + C) and the
properties of indefinite integrals: the sum and difference rule (the integral of (f(x) +/- g(x)) dx =
the integral of f(x) dx +/- the integral of g(x) dx) and the constant multiple rule (the integral of k f(x) dx =
k times the integral of f(x) dx, for any real number k).

**EXAMPLE 5.23 (Integrating a Function Using the Power Rule).** Use the power rule to integrate the function:
the integral, from t = 1 to t = 4, of sqrt(t)(1+t) dt.

Solution: Rewrite and simplify the integrand so the power rule applies: sqrt(t)(1+t) = t^(1/2)(1+t) =
t^(1/2) + t^(3/2). So the integral from 1 to 4 of sqrt(t)(1+t) dt = the integral from 1 to 4 of
(t^(1/2) + t^(3/2)) dt. Applying the power rule to each term gives an antiderivative of (2/3)t^(3/2) +
(2/5)t^(5/2). Evaluating from 1 to 4: [(2/3)(4)^(3/2) + (2/5)(4)^(5/2)] - [(2/3)(1)^(3/2) + (2/5)(1)^(5/2)].
Since 4^(3/2) = 8 and 4^(5/2) = 32, this is [(2/3)(8) + (2/5)(32)] - [(2/3)(1) + (2/5)(1)] =
[16/3 + 64/5] - [2/3 + 2/5] = 272/15 - 16/15 = 256/15. So the integral evaluates to 256/15.

### The Net Change Theorem

The net change theorem considers the integral of a rate of change. It says that when a quantity changes, the new
value equals the initial value plus the integral of the rate of change of that quantity. The formula can be
expressed in two equivalent ways; the second is simply the familiar definite integral form.

#### Theorem 5.6: Net Change Theorem
The new value of a changing quantity equals the initial value plus the integral of the rate of change:
F(b) = F(a) + the integral, from a to b, of F'(x) dx,
or, equivalently,
the integral, from a to b, of F'(x) dx = F(b) - F(a).

Subtracting F(a) from both sides of the first equation yields the second equation; since they are equivalent
formulas, which one to use depends on the application. The significance of the net change theorem lies in its
results: net change can be applied to area, distance, and volume, among other applications. Net change accounts
for negative quantities automatically, without having to write more than one integral.

To illustrate, apply the net change theorem to a velocity function whose integral gives displacement. Suppose a
car moves due north (the positive direction) at 40 mph between 2 p.m. and 4 p.m., then moves south at 30 mph
between 4 p.m. and 5 p.m. The net displacement is the integral, from t = 2 to t = 5, of v(t) dt = the integral
from 2 to 4 of 40 dt + the integral from 4 to 5 of (-30) dt = 80 - 30 = 50, so at 5 p.m. the car is 50 mi north of
its starting position. The total distance traveled is instead the integral, from 2 to 5, of |v(t)| dt = the
integral from 2 to 4 of 40 dt + the integral from 4 to 5 of 30 dt = 80 + 30 = 110, so between 2 p.m. and 5 p.m.
the car traveled a total of 110 mi.

To summarize: net displacement may include both positive and negative values, since the velocity function
accounts for both forward and backward distance; to find net displacement, integrate the velocity function over
the interval. Total distance traveled, on the other hand, is always positive; to find the total distance traveled
by an object regardless of direction, integrate the absolute value of the velocity function.

**EXAMPLE 5.24 (Finding Net Displacement).** Given the velocity function v(t) = 3t - 5 (in meters per second) for
a particle in motion from time t = 0 to t = 3, find the net displacement of the particle.

Solution: Applying the net change theorem, the integral from 0 to 3 of (3t-5) dt = [(3/2)t^2 - 5t] evaluated
from 0 to 3 = [(3/2)(3)^2 - 5(3)] - 0 = 27/2 - 15 = 27/2 - 30/2 = -3/2. The net displacement is -3/2 m.

**EXAMPLE 5.25 (Finding the Total Distance Traveled).** Using Example 5.24's velocity function v(t) = 3t - 5
m/sec, find the total distance traveled by the particle over the time interval [0,3].

Solution: The total distance traveled includes both positive and negative values, so integrate the absolute
value of the velocity function. First find the t-intercept, since that is where the interval divides: 3t - 5 = 0
gives t = 5/3. The two subintervals are [0, 5/3] and [5/3, 3]. Since the function is negative over [0, 5/3],
|v(t)| = -v(t) there; since the function is positive over [5/3, 3], |v(t)| = v(t) there. Thus the integral from 0
to 3 of |v(t)| dt = the integral from 0 to 5/3 of (5-3t) dt + the integral from 5/3 to 3 of (3t-5) dt =
[5t - (3/2)t^2] evaluated from 0 to 5/3, plus [(3/2)t^2 - 5t] evaluated from 5/3 to 3.

For the first piece: at t = 5/3, 5(5/3) - (3/2)(5/3)^2 = 25/3 - 75/18 = 25/3 - 25/6 = 50/6 - 25/6 = 25/6; at t = 0
the expression is 0. So the first piece equals 25/6.
For the second piece: at t = 3, (3/2)(9) - 5(3) = 27/2 - 15 = -3/2; at t = 5/3, (3/2)(25/9) - 5(5/3) =
25/6 - 25/3 = 25/6 - 50/6 = -25/6. So the second piece equals -3/2 - (-25/6) = -9/6 + 25/6 = 16/6 = 8/3.
Adding the two pieces: 25/6 + 8/3 = 25/6 + 16/6 = 41/6. So the total distance traveled is 41/6 m.

**EXAMPLE 5.26 (How Many Gallons of Gasoline Are Consumed?).** If the motor on a motorboat is started at t = 0
and the boat consumes gasoline at the rate of (5 - 0.1t^3) gal/hr, how much gasoline is used in the first 2
hours?

Solution: Express the problem as a definite integral, integrate, and evaluate using the Fundamental Theorem of
Calculus, with the limits of integration being the endpoints of the interval [0,2]: the integral from 0 to 2 of
(5 - 0.1t^3) dt = [5t - 0.1(t^4/4)] evaluated from 0 to 2 = [5(2) - 0.1((2)^4/4)] - 0 = 10 - 0.1(4) = 10 - 0.4 =
9.6. Thus, the motorboat uses 9.6 gal of gas in 2 hours.

### Integrating Even and Odd Functions

Recall that an even function is a function for which f(-x) = f(x) for all x in the domain, that is, the graph of
the curve is unchanged when x is replaced with -x; the graphs of even functions are symmetric about the y-axis.
An odd function is one for which f(-x) = -f(x) for all x in the domain, and the graph of the function is
symmetric about the origin.

Integrals of even functions, when the limits of integration are from -a to a, involve two equal areas, because
they are symmetric about the y-axis. Integrals of odd functions, when the limits of integration are similarly
[-a, a], evaluate to zero because the areas above and below the x-axis are equal.

#### Rule: Integrals of Even and Odd Functions
For continuous even functions such that f(-x) = f(x):
the integral, from -a to a, of f(x) dx = 2 times the integral, from 0 to a, of f(x) dx.
For continuous odd functions such that f(-x) = -f(x):
the integral, from -a to a, of f(x) dx = 0.

**EXAMPLE 5.28 (Integrating an Even Function).** Integrate the even function given by the integral, from -2 to
2, of (3x^8 - 2) dx, and verify that the integration formula for even functions holds.

Solution: the integral from -2 to 2 of (3x^8-2) dx = [(x^9)/3 - 2x] evaluated from -2 to 2 =
[(2)^9/3 - 2(2)] - [(-2)^9/3 - 2(-2)] = (512/3 - 4) - (-512/3 + 4) = 512/3 - 4 + 512/3 - 4 = 1024/3 - 8 =
1024/3 - 24/3 = 1000/3.
To verify the formula for even functions, compute the integral from 0 to 2 and double it: the integral from 0 to
2 of (3x^8-2) dx = [(x^9)/3 - 2x] evaluated from 0 to 2 = 512/3 - 4 = 500/3. Since 2 times 500/3 = 1000/3, this
matches the direct computation, verifying the formula for even functions in this case.

**EXAMPLE 5.29 (Integrating an Odd Function).** Evaluate the definite integral of the odd function -5 sin(x)
over the interval [-pi, pi].

Solution: the integral from -pi to pi of (-5 sin(x)) dx = -5(-cos(x)) evaluated from -pi to pi =
5 cos(x) evaluated from -pi to pi = 5 cos(pi) - 5 cos(-pi) = -5 - (-5) = 0.

# OpenStax Calculus Volume 1, Section 2.1: A Preview of Calculus

## Learning Objectives
- Describe the tangent problem and how it led to the idea of a derivative.
- Explain how the idea of a limit is involved in solving the tangent problem.
- Recognize a tangent to a curve at a point as the limit of secant lines.
- Identify instantaneous velocity as the limit of average velocity over a small time interval.
- Describe the area problem and how it was solved by the integral.
- Explain how the idea of a limit is involved in solving the area problem.
- Recognize how the ideas of limit, derivative, and integral led to the studies of infinite series and multivariable calculus.

## Topic Keywords
- tangent problem
- secant line
- tangent line
- derivative
- average velocity
- instantaneous velocity
- limit
- area problem
- integral calculus

## Content

### Rate of change: linear versus nonlinear functions
For a linear function, a single number, the slope, gives the rate of change everywhere: for every 1 unit moved right along the x-axis, the y-coordinate changes by a constant amount equal to the slope. For a nonlinear function, such as k(x) = x^2, no single number represents the rate of change, since the graph decreases, levels off, and then increases at a changing rate. This motivates the question of how to measure the rate of change of a nonlinear function at a single point.

### Definition: Secant Line
We can approximate the rate of change of a function f(x) at a point (a, f(a)) on its graph by taking another point (x, f(x)) on the graph of f(x), drawing a line through the two points, and calculating the slope of the resulting line. Such a line is called a secant line. The secant to the function f(x) through the points (a, f(a)) and (x, f(x)) is the line passing through these points. Its slope is given by

    m_sec = (f(x) - f(a)) / (x - a).

The accuracy of approximating the rate of change of the function with a secant line depends on how close x is to a: as x gets closer to a, the slope of the secant line becomes a better approximation to the rate of change of f(x) at a.

### Tangent line and the derivative
The secant lines themselves approach a line that is called the tangent to the function f(x) at a. The slope of the tangent line to the graph at a measures the rate of change of the function at a. This value also represents the derivative of the function f(x) at a, or the rate of change of the function at a. This derivative is denoted by f'(a). Differential calculus is the field of calculus concerned with the study of derivatives and their applications.

**EXAMPLE 2.1 (Finding Slopes of Secant Lines).** Estimate the slope of the tangent line (rate of change) to f(x) = x^2 at x = 1 by finding slopes of secant lines through (1, 1) and each of the following points on the graph of f(x) = x^2.
a. (2, 4)
b. (3/2, 9/4)

Solution: Use the formula for the slope of a secant line from the definition.
a. m_sec = (4 - 1)/(2 - 1) = 3
b. m_sec = (9/4 - 1)/(3/2 - 1) = (5/4)/(1/2) = 5/2 = 2.5
The point in part b is closer to the point (1, 1), so the slope of 2.5 is closer to the slope of the tangent line. A good estimate for the slope of the tangent would be in the range of 2 to 2.5.

### Definition: Average Velocity
Keeping in mind that velocity may be thought of as the rate of change of position, suppose s(t) gives the position of an object along a coordinate axis at any given time t. We define the average velocity of an object over a time period to be the change in its position divided by the length of the time period. Let s(t) be the position of an object moving along a coordinate axis at time t. The average velocity of the object over a time interval [a, t] where a < t (or [t, a] if t < a) is

    v_ave = (s(t) - s(a)) / (t - a).

As t is chosen closer to a, the average velocity becomes closer to the instantaneous velocity. This process of letting x or t approach a in an expression is called taking a limit.

### Definition: Instantaneous Velocity
For a position function s(t), the instantaneous velocity at a time t = a is the value that the average velocities approach on intervals of the form [a, t] and [t, a] as the values of t become closer to a, provided such a value exists.

**EXAMPLE 2.2 (Finding Average Velocity).** A rock is dropped from a height of 64 ft. It is determined that its height (in feet) above ground t seconds later (for 0 <= t <= 2) is given by s(t) = -16t^2 + 64. Find the average velocity of the rock over each of the given time intervals. Use this information to guess the instantaneous velocity of the rock at time t = 0.5.
a. [0.49, 0.5]
b. [0.5, 0.51]

Solution: Substitute the data into the formula for the definition of average velocity.
a. v_ave = (s(0.5) - s(0.49))/(0.5 - 0.49) = -15.84
b. v_ave = (s(0.51) - s(0.5))/(0.51 - 0.5) = -16.16
The instantaneous velocity is somewhere between -15.84 and -16.16 ft/sec. A good guess might be -16 ft/sec.

### The area problem and integral calculus
Many quantities in physics, for example quantities of work, may be interpreted as the area under a curve. This leads to the question: how can we find the area between the graph of a function and the x-axis over an interval [a, b]? We first approximate the solution by dividing the interval [a, b] into smaller intervals in the shape of rectangles; the approximation of the area comes from adding up the areas of these rectangles. As the widths of the rectangles become smaller (approach zero), the sums of the areas of the rectangles approach the area between the graph of f(x) and the x-axis over the interval [a, b]. Once again, we find ourselves taking a limit. Limits of this type serve as a basis for the definition of the definite integral. Integral calculus is the study of integrals and their applications.

**EXAMPLE 2.3 (Estimation Using Rectangles).** Estimate the area between the x-axis and the graph of f(x) = x^2 + 1 over the interval [0, 3] by using three rectangles.

Solution: The areas of the three rectangles are 1 unit^2, 2 unit^2, and 5 unit^2. Using these rectangles, the area estimate is 8 unit^2.

### Other aspects of calculus
So far, functions of one variable only have been studied, represented visually using graphs in two dimensions; however, there is no reason to restrict investigation to two dimensions. For example, one might want to determine the velocity of a rock fired from a catapult, or of an airplane moving in three dimensions, or graph real-valued functions of two variables, or determine volumes of solids between a surface z = f(x, y) and a plane. Multivariable calculus can informally be characterized as the study of the calculus of functions of two or more variables. Before exploring these ideas, a foundation for the study of calculus in one variable must first be laid by exploring the concept of a limit; the ideas of limit, derivative, and integral eventually lead to the studies of infinite series and multivariable calculus as well.

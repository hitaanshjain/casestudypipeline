# OpenStax Calculus Volume 1, Section 3.8: Implicit Differentiation

## Learning Objectives
- Find the derivative of a complicated function by using implicit differentiation.
- Use implicit differentiation to determine the equation of a tangent line.

## Topic Keywords
- implicit differentiation
- explicit vs implicit functions
- chain rule for dy/dx
- problem-solving strategy
- tangent lines to implicit curves
- second derivative implicitly
- point-slope equation
- product rule with implicit differentiation

## Content

### Explicit versus implicit functions
If the dependent variable y is a function of the independent variable x and we express y
entirely in terms of x, we say y is an explicit function of x; for example, y = x^2 + 1
defines y explicitly in terms of x. If instead the relationship between y and x is given
by an equation in which y is not expressed entirely in terms of x, the equation defines y
implicitly in terms of x; for example, y - x^2 = 1 defines the function y = x^2 + 1
implicitly. An equation may define many different functions implicitly: the equation
x^2 + y^2 = 25 is satisfied by y = sqrt(25 - x^2), y = -sqrt(25 - x^2), and by piecewise
combinations of the two branches. Implicit differentiation lets us find slopes of tangent
lines to curves that are not themselves functions (they fail the vertical line test) by
treating portions of the curve as a function y of x, without ever solving for y
explicitly.

### Problem-solving strategy: implicit differentiation
To perform implicit differentiation on an equation that defines a function y implicitly
in terms of a variable x, use the following steps:
1. Take the derivative of both sides of the equation. Keep in mind that y is a function
   of x. Consequently, whereas d/dx(sin x) = cos x, d/dx(sin y) = cos y * dy/dx, because
   we must use the chain rule to differentiate sin y with respect to x.
2. Rewrite the equation so that all terms containing dy/dx are on the left and all terms
   that do not contain dy/dx are on the right.
3. Factor out dy/dx on the left.
4. Solve for dy/dx by dividing both sides of the equation by an appropriate algebraic
   expression.

**EXAMPLE 3.68 (Using Implicit Differentiation).** Assuming that y is defined implicitly
by the equation x^2 + y^2 = 25, find dy/dx.

Solution: Follow the steps in the problem-solving strategy.
1. Differentiate both sides: d/dx(x^2) + d/dx(y^2) = d/dx(25), which gives
   2x + 2y(dy/dx) = 0.
2. Move the term without dy/dx to the right: 2y(dy/dx) = -2x.
3. (Step 3 does not apply here; there is only one dy/dx term to factor.)
4. Divide both sides by 2y: dy/dx = -x/y.

Analysis: The resulting expression for dy/dx is in terms of both the independent
variable x and the dependent variable y. Although in some cases it may be possible to
express dy/dx in terms of x only, it is generally not possible to do so.

### Second derivatives found implicitly
**EXAMPLE 3.70 (Using Implicit Differentiation to Find a Second Derivative).** Find
d^2y/dx^2 if x^2 + y^2 = 25.

Solution: In Example 3.68, dy/dx = -x/y. Differentiate both sides of this equation with
respect to x, using the quotient rule on the right:

    d^2y/dx^2 = d/dx(-x/y) = -[(1*y - x*(dy/dx)) / y^2] = (-y + x*(dy/dx)) / y^2.

Substitute dy/dx = -x/y:

    d^2y/dx^2 = (-y + x*(-x/y)) / y^2 = (-y^2 - x^2) / y^3.

Since x^2 + y^2 = 25, substituting this into the numerator simplifies the expression
further to d^2y/dx^2 = -25/y^3.

### Finding tangent lines implicitly
Implicit differentiation can also be applied to the problem of finding equations of
tangent lines to curves described by equations.

**EXAMPLE 3.71 (Finding a Tangent Line to a Circle).** Find an equation of the line
tangent to the curve x^2 + y^2 = 25 at the point (3, -4).

Solution: Although this equation could be found without implicit differentiation, that
method makes it much easier. In Example 3.68, dy/dx = -x/y. The slope of the tangent
line is found by substituting (3, -4) into this expression:

    dy/dx |_(3,-4) = -3/(-4) = 3/4.

Using the point (3, -4) and the slope 3/4 in the point-slope equation of the line, we
obtain y = (3/4)x - 25/4.

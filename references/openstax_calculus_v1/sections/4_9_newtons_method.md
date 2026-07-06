# OpenStax Calculus Volume 1, Section 4.9: Newton's Method

## Learning Objectives
- Describe the steps of Newton's method.
- Explain what an iterative process means.
- Recognize when Newton's method does not work.
- Apply iterative processes to various situations.

## Topic Keywords
- newton's method
- iteration formula
- iterative process
- tangent line approximation
- root approximation
- fixed point
- convergence failure
- 2-cycle

## Content

### Motivation: approximating roots
In many areas of pure and applied mathematics, we are interested in finding solutions to an equation of the
form f(x) = 0. For most functions, however, it is difficult, if not impossible, to calculate their zeroes
explicitly. If f is the first-degree polynomial f(x) = ax + b, the solution of f(x) = 0 is given by the formula
x = -b/a. If f is the second-degree polynomial f(x) = ax^2 + bx + c, the solutions can be found using the
quadratic formula. But for polynomials of degree 3 or more, finding roots becomes far more complicated:
formulas exist for third- and fourth-degree polynomials but are quite complicated, and if f is a polynomial of
degree 5 or greater, no such formula exists at all (for example, no formula exists for the roots of
f(x) = x^5 + 8x^4 + 4x^3 - 2x - 7). Similar difficulties exist for nonpolynomial functions; no simple formula
exists for the solutions of an equation like tan(x) - x = 0. Newton's method uses tangent line approximations
to approximate the roots of such functions, and it is the technique behind the method used by calculators and
computers to find zeroes.

### Describing Newton's method
Newton's method approximates the solutions of f(x) = 0 using the following idea. By sketching a graph of f,
we can estimate a root of f(x) = 0; call this estimate x_0. We then draw the tangent line to f at x_0. If
f'(x_0) != 0, this tangent line intersects the x-axis at some point (x_1, 0), and x_1 becomes the next
approximation to the actual root; typically x_1 is closer than x_0 to the true root. We then draw the tangent
line to f at x_1; if f'(x_1) != 0, it intersects the x-axis at a new point, producing x_2, and we continue in
this way, deriving a list of approximations x_0, x_1, x_2, .... Typically these numbers quickly approach an
actual root x*.

To calculate the approximations explicitly, note that the tangent line to f at x_0 has equation
y = f(x_0) + f'(x_0)(x - x_0). Since x_1 is defined as the x-intercept of this line, x_1 must satisfy
f(x_0) + f'(x_0)(x_1 - x_0) = 0. Solving this equation for x_1 gives
x_1 = x_0 - f(x_0)/f'(x_0).
Similarly, x_2 is the x-intercept of the tangent line to f at x_1, so
x_2 = x_1 - f(x_1)/f'(x_1).
In general, for n > 0, x_n satisfies

x_n = x_(n-1) - f(x_(n-1))/f'(x_(n-1)).      (Equation 4.8)

**EXAMPLE 4.46 (Finding a Root of a Polynomial).** Use Newton's method to approximate a root of
f(x) = x^3 - 3x + 1 in the interval [1, 2]. Let x_0 = 2 and find x_1, x_2, x_3, x_4, and x_5.

Solution:
The graph of f shows one root over the interval (1, 2), so x_0 = 2 is a reasonable first approximation. Since
f(x) = x^3 - 3x + 1, the derivative is f'(x) = 3x^2 - 3. Using Equation 4.8 with n = 1 (and a calculator that
displays 10 digits):
x_1 = x_0 - f(x_0)/f'(x_0) = 2 - f(2)/f'(2) = 2 - 3/9 ~= 1.666666667.
Using x_1 stored on the calculator to find x_2 = x_1 - f(x_1)/f'(x_1) ~= 1.548611111. Continuing in this way
produces:
x_1 ~= 1.666666667
x_2 ~= 1.548611111
x_3 ~= 1.532390162
x_4 ~= 1.532088989
x_5 ~= 1.532088886
x_6 ~= 1.532088886.
Since x_5 and x_6 agree, any subsequent application of Newton's method will most likely give the same value,
so the root is approximately 1.532088886.

Each approximation after the initial guess is defined in terms of the previous approximation by using the same
formula. In particular, defining the function F(x) = x - f(x)/f'(x), Equation 4.8 can be rewritten as
x_n = F(x_(n-1)). This type of process, where each x_n is defined in terms of x_(n-1) by repeating the same
function, is an example of an iterative process.

### Failures of Newton's method
Typically, Newton's method finds a root fairly quickly, but things can go wrong. Some reasons Newton's method
might fail:
1. At one of the approximations x_n, the derivative f' is zero at x_n but f(x_n) != 0. The tangent line of f at
x_n is then horizontal and never intersects the x-axis, so the iterative process cannot continue.
2. The approximations x_0, x_1, x_2, ... may approach a different root than the one intended. If f has more
than one root, the approximations may converge to a root other than the one being sought; this most often
happens when the initial guess x_0 is not chosen close enough to the desired root.
3. The approximations may fail to approach any root at all. It is possible to choose a function f and an
initial guess x_0 such that the successive approximations never settle down, instead alternating back and
forth forever between two values.

**EXAMPLE 4.48 (When Newton's Method Fails).** Consider the function f(x) = x^3 - 2x + 2. Let x_0 = 0. Show
that the sequence x_1, x_2, ... fails to approach a root of f.

Solution:
For f(x) = x^3 - 2x + 2, the derivative is f'(x) = 3x^2 - 2. Therefore,
x_1 = x_0 - f(x_0)/f'(x_0) = 0 - f(0)/f'(0) = 0 - 2/(-2) = 1.
In the next step,
x_2 = x_1 - f(x_1)/f'(x_1) = 1 - f(1)/f'(1) = 1 - 1/1 = 0.
The numbers x_0, x_1, x_2, ... continue to bounce back and forth between 0 and 1 forever (a 2-cycle) and never
get closer to the actual root of f, which lies over the interval [-2, -1]. Choosing an initial approximation
x_0 closer to the actual root avoids this situation.

### Other iterative processes
As noted above, Newton's method is one example of an iterative process: given a function F and an initial
number x_0, define subsequent numbers by x_n = F(x_(n-1)). This creates a list of numbers x_0, x_1, x_2, ...,
x_n, .... This list may approach a finite number x* as n gets larger, or it may not. If the list x_1, x_2,
x_3, ... approaches a finite number x*, then x* satisfies x* = F(x*), and x* is called a fixed point of F.

**EXAMPLE 4.49 (Finding a Limit for an Iterative Process).** Let F(x) = (1/2)x + 4 and let x_0 = 0. For all
n >= 1, let x_n = F(x_(n-1)). Find the values x_1, x_2, x_3, x_4, x_5, and make a conjecture about what
happens to the list of numbers x_1, x_2, x_3, ..., x_n, ... as n -> infinity.

Solution:
With x_0 = 0:
x_1 = (1/2)(0) + 4 = 4
x_2 = (1/2)(4) + 4 = 6
x_3 = (1/2)(6) + 4 = 7
x_4 = (1/2)(7) + 4 = 7.5
x_5 = (1/2)(7.5) + 4 = 7.75
x_6 = (1/2)(7.75) + 4 = 7.875
x_7 = (1/2)(7.875) + 4 = 7.9375
x_8 = (1/2)(7.9375) + 4 = 7.96875
x_9 = (1/2)(7.96875) + 4 = 7.984375.
From this list, we conjecture that the values x_n approach 8. This can also be confirmed algebraically: if the
list approaches a finite value x*, it must be a fixed point of F, so x* satisfies x* = (1/2)x* + 4, which gives
x* = 8. This agrees with the numerical evidence that the list of numbers x_0, x_1, x_2, ... approaches x* = 8
as n -> infinity.

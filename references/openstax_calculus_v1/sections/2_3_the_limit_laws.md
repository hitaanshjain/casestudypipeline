# OpenStax Calculus Volume 1, Section 2.3: The Limit Laws

## Learning Objectives
- Recognize the basic limit laws.
- Use the limit laws to evaluate the limit of a function.
- Evaluate the limit of a function by factoring.
- Use the limit laws to evaluate the limit of a polynomial or rational function.
- Evaluate the limit of a function by factoring or by using conjugates.
- Evaluate the limit of a function by using the squeeze theorem.

## Topic Keywords
- limit laws
- sum and difference laws
- product and quotient laws
- power and root laws
- polynomial and rational functions
- factoring and canceling
- conjugate multiplication
- indeterminate form
- squeeze theorem
- trigonometric limits

## Content

### Theorem 2.4: Basic Limit Results
For any real number a and any constant c:
i. lim_(x->a) x = a
ii. lim_(x->a) c = c

### Theorem 2.5: Limit Laws
Let f(x) and g(x) be defined for all x != a over some open interval containing a. Assume
L and M are real numbers such that lim_(x->a) f(x) = L and lim_(x->a) g(x) = M, and let c
be a constant. Then each of the following holds:
Sum law for limits: lim_(x->a) (f(x) + g(x)) = lim_(x->a) f(x) + lim_(x->a) g(x) = L + M
Difference law for limits: lim_(x->a) (f(x) - g(x)) = lim_(x->a) f(x) - lim_(x->a) g(x) = L - M
Constant multiple law for limits: lim_(x->a) c*f(x) = c * lim_(x->a) f(x) = cL
Product law for limits: lim_(x->a) (f(x)*g(x)) = lim_(x->a) f(x) * lim_(x->a) g(x) = L*M
Quotient law for limits: lim_(x->a) f(x)/g(x) = L/M, for M != 0
Power law for limits: lim_(x->a) (f(x))^n = (lim_(x->a) f(x))^n = L^n, for every positive
integer n
Root law for limits: lim_(x->a) (f(x))^(1/n) = (lim_(x->a) f(x))^(1/n) = L^(1/n), for all L
if n is odd, and for L >= 0 if n is even and f(x) >= 0

### Theorem 2.6: Limits of Polynomial and Rational Functions
Let p(x) and q(x) be polynomial functions and let a be a real number. Then:
lim_(x->a) p(x) = p(a)
lim_(x->a) p(x)/q(x) = p(a)/q(a), when q(a) != 0.
This follows by repeated application of the sum, constant multiple, and power laws to
p(x) = c_n x^n + c_(n-1) x^(n-1) + ... + c_1 x + c_0, which gives lim_(x->a) p(x) =
c_n a^n + c_(n-1) a^(n-1) + ... + c_1 a + c_0 = p(a); the quotient law then extends this
to rational functions p(x)/q(x) at any a for which q(a) != 0.

### Problem-Solving Strategy: Calculating a Limit When f(x)/g(x) Has the Indeterminate Form 0/0
1. First, make sure the function has the appropriate form and cannot be evaluated
   immediately using the limit laws.
2. Find a function h(x) equal to f(x)/g(x) for all x != a over some interval containing
   a. To do this, try one or more of the following:
   a. If f(x) and g(x) are polynomials, factor each and cancel out any common factors.
   b. If the numerator or denominator contains a difference involving a square root,
      multiply the numerator and denominator by the conjugate of the square-root
      expression.
   c. If f(x)/g(x) is a complex fraction, begin by simplifying it.
3. Last, apply the limit laws.

### Theorem 2.7: The Squeeze Theorem
Let f(x), g(x), and h(x) be defined for all x != a over an open interval containing a.
If f(x) <= g(x) <= h(x) for all x != a in an open interval containing a, and
lim_(x->a) f(x) = L = lim_(x->a) h(x) where L is a real number, then lim_(x->a) g(x) = L.

### Important limits established via the squeeze theorem
Applying the squeeze theorem to inequalities derived from the unit circle (0 < sin(theta)
< theta < tan(theta) for 0 < theta < pi/2) establishes results used heavily in later
sections and chapters: lim_(theta->0) sin(theta) = 0, lim_(theta->0) cos(theta) = 1, and,
most importantly, lim_(theta->0) sin(theta)/theta = 1. Example 2.25 below uses this last
result to derive a further useful limit, lim_(theta->0) (1 - cos(theta))/theta = 0.

**EXAMPLE 2.15 (Using Limit Laws Repeatedly).** Use the limit laws to evaluate
lim_(x->2) (2x^2 - 3x + 1)/(x^3 + 4).

Solution:
Apply the quotient law first (noting (2)^3 + 4 != 0), then the sum and constant
multiple laws, then the power law, then substitute using the basic limit results:
lim_(x->2) (2x^2-3x+1)/(x^3+4) = [2*(lim_(x->2) x)^2 - 3*lim_(x->2) x + lim_(x->2) 1] /
[(lim_(x->2) x)^3 + lim_(x->2) 4] = [2(2)^2 - 3(2) + 1] / [(2)^3 + 4]
= (8 - 6 + 1)/(8 + 4) = 3/12 = 1/4.

**EXAMPLE 2.16 (Evaluating a Limit of a Rational Function).** Evaluate
lim_(x->3) (2x^2 - 3x + 1)/(5x + 4).

Solution: Since 3 is in the domain of the rational function f(x) = (2x^2-3x+1)/(5x+4)
(the denominator 5(3)+4 = 19 != 0), Theorem 2.6 lets us evaluate the limit by direct
substitution: lim_(x->3) (2x^2-3x+1)/(5x+4) = (2(9) - 9 + 1)/19 = (18-9+1)/19 = 10/19.

**EXAMPLE 2.17 (Evaluating a Limit by Factoring and Canceling).** Evaluate
lim_(x->3) (x^2 - 3x)/(2x^2 - 5x - 3).

Solution:
Step 1. f(x) = (x^2-3x)/(2x^2-5x-3) is undefined at x = 3; substituting 3 gives 0/0,
which is indeterminate. Factor both numerator and denominator:
(x^2-3x)/(2x^2-5x-3) = x(x-3) / [(x-3)(2x+1)].
Step 2. For all x != 3, x(x-3)/[(x-3)(2x+1)] = x/(2x+1). Therefore
lim_(x->3) x(x-3)/[(x-3)(2x+1)] = lim_(x->3) x/(2x+1).
Step 3. Evaluate using the limit laws: lim_(x->3) x/(2x+1) = 3/7.

**EXAMPLE 2.18 (Evaluating a Limit by Multiplying by a Conjugate).** Evaluate
lim_(x->-1) (sqrt(x+2) - 1)/(x+1).

Solution:
Step 1. (sqrt(x+2)-1)/(x+1) has the form 0/0 at x = -1. Multiply numerator and
denominator by sqrt(x+2)+1, the conjugate of sqrt(x+2)-1:
lim_(x->-1) (sqrt(x+2)-1)/(x+1) = lim_(x->-1) [(sqrt(x+2)-1)/(x+1)] *
[(sqrt(x+2)+1)/(sqrt(x+2)+1)].
Step 2. Multiply out only the numerator, since (x+2) - 1 = x+1; keep the denominator
factored so that x+1 can cancel: = lim_(x->-1) (x+1) / [(x+1)(sqrt(x+2)+1)].
Step 3. Cancel the common factor (x+1): = lim_(x->-1) 1/(sqrt(x+2)+1).
Step 4. Apply the limit laws: = 1/(sqrt(1)+1) = 1/2.

**EXAMPLE 2.24 (Applying the Squeeze Theorem).** Apply the squeeze theorem to evaluate
lim_(x->0) x*cos(x).

Solution: Because -1 <= cos(x) <= 1 for all x, we have -|x| <= x*cos(x) <= |x| for all
x (multiplying the cosine inequality by x reverses it when x < 0, but in both cases the
result is the same bound in terms of |x|). Since lim_(x->0) (-|x|) = 0 = lim_(x->0) |x|,
the squeeze theorem gives lim_(x->0) x*cos(x) = 0.

**EXAMPLE 2.25 (Evaluating an Important Trigonometric Limit).** Evaluate
lim_(theta->0) (1 - cos(theta))/theta.

Solution: Multiply by the conjugate (1+cos(theta))/(1+cos(theta)) so that the identity
1 - cos^2(theta) = sin^2(theta) converts the numerator to a sine:
lim_(theta->0) (1-cos(theta))/theta = lim_(theta->0) [(1-cos(theta))/theta] *
[(1+cos(theta))/(1+cos(theta))] = lim_(theta->0) (1 - cos^2(theta)) / [theta(1+cos(theta))]
= lim_(theta->0) sin^2(theta) / [theta(1+cos(theta))]
= lim_(theta->0) [sin(theta)/theta] * [sin(theta)/(1+cos(theta))] = 1 * (0/2) = 0.
Therefore lim_(theta->0) (1 - cos(theta))/theta = 0.

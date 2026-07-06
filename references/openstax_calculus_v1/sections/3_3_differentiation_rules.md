# OpenStax Calculus Volume 1, Section 3.3: Differentiation Rules

## Learning Objectives
- State the constant, constant multiple, and power rules.
- Apply the sum and difference rules to combine derivatives.
- Use the product rule for finding the derivative of a product of functions.
- Use the quotient rule for finding the derivative of a quotient of functions.
- Extend the power rule to functions with negative exponents.
- Combine the differentiation rules to find the derivative of a polynomial or rational function.

## Topic Keywords
- constant rule
- power rule
- sum and difference rules
- constant multiple rule
- product rule
- quotient rule
- extended power rule
- tangent lines
- combining differentiation rules

## Content

Finding derivatives directly from the limit definition can be lengthy and, for some functions, quite challenging;
for example, d/dx(sqrt(x)) = 1/(2 sqrt(x)) was previously found only by multiplying by a conjugate prior to
evaluating a limit, and the analogous computation for d/dx(x^(1/3)) is more complicated still. This section
develops rules for finding derivatives that bypass this process, beginning with the basic building blocks
f(x) = c and g(x) = x^n (n a positive integer), from which all polynomials and rational functions are
constructed.

### Theorem 3.2: The Constant Rule
Let c be a constant. If f(x) = c, then f'(x) = 0. Alternatively, we may express this rule as d/dx(c) = 0.
This follows directly from the limit definition: f'(x) = lim_(h->0) [f(x+h)-f(x)]/h = lim_(h->0) (c-c)/h =
lim_(h->0) 0/h = lim_(h->0) 0 = 0. Since a constant function is a horizontal line, its slope, or rate of change,
is 0.

**EXAMPLE 3.17 (Applying the Constant Rule).** Find the derivative of f(x) = 8.

Solution: This is a one-step application of the rule: f'(x) = 0.

### Theorem 3.3: The Power Rule
Let n be a positive integer. If f(x) = x^n, then f'(x) = n x^(n-1). Alternatively, we may express this rule as
d/dx(x^n) = n x^(n-1). This rule does not apply to functions in which a constant is raised to a variable power,
such as f(x) = 3^x; it will eventually be extended to negative integer powers, and later to rational and then
arbitrary powers of x.

Proof (general case): For f(x) = x^n with n a positive integer, f'(x) = lim_(h->0) [(x+h)^n - x^n]/h. By the
binomial theorem, (x+h)^n = x^n + n x^(n-1) h + C(n,2) x^(n-2) h^2 + C(n,3) x^(n-3) h^3 + ... + n x h^(n-1) +
h^n, where C(n,k) denotes the binomial coefficient "n choose k". Subtracting x^n and dividing by h gives
[(x+h)^n - x^n]/h = n x^(n-1) + C(n,2) x^(n-2) h + C(n,3) x^(n-3) h^2 + ... + n x h^(n-2) + h^(n-1). Letting
h -> 0 sends every term containing h to 0, leaving f'(x) = n x^(n-1).

**EXAMPLE 3.18 (Differentiating x^3).** Find d/dx(x^3), using essentially the same technique used to prove the
general case.

Solution:
1. d/dx(x^3) = lim_(h->0) [(x+h)^3 - x^3]/h.
2. Expand: = lim_(h->0) [x^3 + 3x^2 h + 3x h^2 + h^3 - x^3]/h.
3. Cancel the x^3 terms, leaving only terms containing h: = lim_(h->0) [3x^2 h + 3x h^2 + h^3]/h.
4. Factor out the common factor of h: = lim_(h->0) h(3x^2 + 3x h + h^2)/h.
5. Cancel the common factor of h; the only term not containing h is 3x^2: = lim_(h->0) (3x^2 + 3x h + h^2).
6. Let h -> 0: = 3x^2.

**EXAMPLE 3.19 (Applying the Power Rule).** Find the derivative of the function f(x) = x^10 by applying the
power rule.

Solution: Using the power rule with n = 10, f'(x) = 10 x^(10-1) = 10 x^9.

### Theorem 3.4: Sum, Difference, and Constant Multiple Rules
Let f(x) and g(x) be differentiable functions and let k be a constant. Then each of the following equations
holds.
Sum Rule: the derivative of the sum of a function f and a function g is the same as the sum of the derivative of
f and the derivative of g: d/dx(f(x)+g(x)) = d/dx(f(x)) + d/dx(g(x)); that is, for j(x) = f(x)+g(x),
j'(x) = f'(x)+g'(x).
Difference Rule: the derivative of the difference of a function f and a function g is the same as the difference
of the derivative of f and the derivative of g: d/dx(f(x)-g(x)) = d/dx(f(x)) - d/dx(g(x)); that is, for
j(x) = f(x)-g(x), j'(x) = f'(x)-g'(x).
Constant Multiple Rule: the derivative of a constant k multiplied by a function f is the same as the constant
multiplied by the derivative: d/dx(k f(x)) = k d/dx(f(x)); that is, for j(x) = k f(x), j'(x) = k f'(x).

Proof (sum rule only; the difference and constant multiple rules follow in a similar manner): for differentiable
f(x) and g(x), set j(x) = f(x)+g(x). The limit definition gives j'(x) = lim_(h->0) [j(x+h)-j(x)]/h. Substituting
j(x+h) = f(x+h)+g(x+h) and j(x) = f(x)+g(x), then rearranging and regrouping the terms, j'(x) =
lim_(h->0) ([f(x+h)-f(x)]/h + [g(x+h)-g(x)]/h). Applying the sum law for limits and the definition of the
derivative to each piece gives j'(x) = f'(x) + g'(x).

**EXAMPLE 3.20 (Applying the Constant Multiple Rule).** Find the derivative of g(x) = 3x^2 and compare it to
the derivative of f(x) = x^2.

Solution: Using the power rule directly, g'(x) = d/dx(3x^2) = 3 d/dx(x^2) = 3(2x) = 6x. Since f(x) = x^2 has
derivative f'(x) = 2x, the derivative of g(x) is 3 times the derivative of f(x).

**EXAMPLE 3.21 (Applying Basic Derivative Rules).** Find the derivative of f(x) = 2x^5 + 7.

Solution: Using Leibniz notation throughout to track the sequence of rules applied:
f'(x) = d/dx(2x^5+7) = d/dx(2x^5) + d/dx(7)  (apply the sum rule)
= 2 d/dx(x^5) + d/dx(7)  (apply the constant multiple rule)
= 2(5x^4) + 0  (apply the power rule and the constant rule)
= 10x^4.  (simplify)

**EXAMPLE 3.22 (Finding the Equation of a Tangent Line).** Find an equation of the line tangent to the graph of
f(x) = x^2 - 4x + 6 at x = 1.

Solution: To find an equation of the tangent line we need a point and a slope. For the point, compute
f(1) = 1^2 - 4(1) + 6 = 3, giving the point (1, 3). Since the slope of the tangent line at 1 is f'(1), find
f'(x) = 2x - 4, so the slope is f'(1) = -2. Using the point-slope formula, the equation of the tangent line is
y - 3 = -2(x-1), which in slope-intercept form is y = -2x + 5.

### Theorem 3.5: The Product Rule
Let f(x) and g(x) be differentiable functions. Then d/dx(f(x)g(x)) = d/dx(f(x)) * g(x) + d/dx(g(x)) * f(x); that
is, if j(x) = f(x)g(x), then j'(x) = f'(x)g(x) + g'(x)f(x). This means that the derivative of a product of two
functions is the derivative of the first function times the second function, plus the derivative of the second
function times the first function. It is NOT the product of the derivatives: to see why, consider f(x) = x^2,
whose derivative is f'(x) = 2x and not d/dx(x) * d/dx(x) = 1 * 1 = 1.

Proof (derivation sketch): assume f(x) and g(x) are differentiable. Applying the limit definition of the
derivative to j(x) = f(x)g(x) gives j'(x) = lim_(h->0) [f(x+h)g(x+h) - f(x)g(x)]/h. Adding and subtracting
f(x)g(x+h) in the numerator, then breaking apart the quotient and applying the sum law for limits, gives
j'(x) = lim_(h->0) ([f(x+h)-f(x)]/h * g(x+h)) + lim_(h->0) ([g(x+h)-g(x)]/h * f(x)). Since g(x) is
differentiable it is also continuous, so lim_(h->0) g(x+h) = g(x); using this continuity fact together with the
definitions of the derivatives of f and g and the limit laws, we arrive at the product rule, j'(x) = f'(x)g(x) +
g'(x)f(x).

**EXAMPLE 3.23 (Applying the Product Rule to Functions at a Point).** For j(x) = f(x)g(x), use the product rule
to find j'(2) if f(2) = 3, f'(2) = -4, g(2) = 1, and g'(2) = 6.

Solution: Since j(x) = f(x)g(x), j'(x) = f'(x)g(x) + g'(x)f(x), and hence
j'(2) = f'(2)g(2) + g'(2)f(2) = (-4)(1) + (6)(3) = 14.

**EXAMPLE 3.24 (Applying the Product Rule to Binomials).** For j(x) = (x^2+2)(3x^3-5x), find j'(x) by applying
the product rule. Check the result by first finding the product and then differentiating.

Solution: If we set f(x) = x^2+2 and g(x) = 3x^3-5x, then f'(x) = 2x and g'(x) = 9x^2-5. Thus,
j'(x) = f'(x)g(x) + g'(x)f(x) = 2x(3x^3-5x) + (9x^2-5)(x^2+2). Simplifying, we have j'(x) = 15x^4 + 3x^2 - 10. To
check, we see that j(x) = 3x^5 + x^3 - 10x and, consequently, j'(x) = 15x^4 + 3x^2 - 10.

### Theorem 3.6: The Quotient Rule
Let f(x) and g(x) be differentiable functions. Then d/dx(f(x)/g(x)) = [d/dx(f(x)) * g(x) - d/dx(g(x)) * f(x)] /
(g(x))^2; that is, if j(x) = f(x)/g(x), then j'(x) = [f'(x)g(x) - g'(x)f(x)] / (g(x))^2. The derivative of the
quotient is not the quotient of the derivatives: keep in mind that d/dx(x^2) = 2x, not
[d/dx(x^3)]/[d/dx(x)] = 3x^2/1 = 3x^2. The proof of the quotient rule is very similar to the proof of the
product rule, so it is omitted here.

**EXAMPLE 3.25 (Applying the Quotient Rule).** Use the quotient rule to find the derivative of
k(x) = 5x^2/(4x+3).

Solution: Let f(x) = 5x^2 and g(x) = 4x+3. Thus, f'(x) = 10x and g'(x) = 4. Substituting into the quotient
rule, k'(x) = [f'(x)g(x) - g'(x)f(x)] / (g(x))^2 = [10x(4x+3) - 4(5x^2)] / (4x+3)^2. Simplifying, we obtain
k'(x) = (20x^2 + 30x) / (4x+3)^2.

### Theorem 3.7: Extended Power Rule
If k is a negative integer, then d/dx(x^k) = k x^(k-1).

Proof: if k is a negative integer, set n = -k, so n is a positive integer with x^k = x^(-n) = 1/x^n. Apply the
quotient rule with f(x) = 1 and g(x) = x^n, so f'(x) = 0 and g'(x) = n x^(n-1); thus
d/dx(x^(-n)) = [0*x^n - 1*(n x^(n-1))] / (x^n)^2. Simplifying, d/dx(x^(-n)) = -n x^(n-1) / x^(2n) =
-n x^((n-1)-2n) = -n x^(-n-1). Finally, since k = -n, substituting gives d/dx(x^k) = k x^(k-1).

**EXAMPLE 3.26 (Using the Extended Power Rule).** Find d/dx(x^(-4)).

Solution: By applying the extended power rule with k = -4, we obtain d/dx(x^(-4)) = -4x^(-4-1) = -4x^(-5).

**EXAMPLE 3.27 (Using the Extended Power Rule and the Constant Multiple Rule).** Use the extended power rule and
the constant multiple rule to find the derivative of f(x) = 6/x^2.

Solution: It may seem tempting to use the quotient rule to find this derivative, and it would not be incorrect
to do so; however, it is far easier to differentiate this function by first rewriting it as f(x) = 6x^(-2).
f'(x) = d/dx(6/x^2) = d/dx(6x^(-2))  (rewrite 6/x^2 as 6x^(-2))
= 6 d/dx(x^(-2))  (apply the constant multiple rule)
= 6(-2x^(-3))  (use the extended power rule to differentiate x^(-2))
= -12x^(-3).  (simplify)

### Combining Differentiation Rules
As seen throughout the examples in this section, it seldom happens that only one differentiation rule is needed
to find the derivative of a given function. By combining the differentiation rules developed above, the
derivative of any polynomial or rational function can be found. A good rule of thumb when applying several
rules is to apply the rules in reverse of the order in which the function would be evaluated.

**EXAMPLE 3.28 (Combining Differentiation Rules).** For k(x) = 3h(x) + x^2 g(x), find k'(x).

Solution: Finding this derivative requires the sum rule, the constant multiple rule, and the product rule.
k'(x) = d/dx(3h(x) + x^2g(x)) = d/dx(3h(x)) + d/dx(x^2g(x))  (apply the sum rule)
= 3 d/dx(h(x)) + (d/dx(x^2) * g(x) + d/dx(g(x)) * x^2)  (apply the constant multiple rule to 3h(x) and the
product rule to x^2g(x))
= 3h'(x) + 2x g(x) + x^2 g'(x).

**EXAMPLE 3.30 (Combining the Quotient Rule and the Product Rule).** For h(x) = 2x^3 k(x)/(3x+2), find h'(x).
This procedure is typical for finding the derivative of a rational function.

Solution:
h'(x) = [d/dx(2x^3k(x)) * (3x+2) - d/dx(3x+2) * (2x^3k(x))] / (3x+2)^2  (apply the quotient rule)
= [(6x^2k(x) + k'(x)*2x^3)(3x+2) - 3(2x^3k(x))] / (3x+2)^2  (apply the product rule to find d/dx(2x^3k(x));
use d/dx(3x+2) = 3)
= [-6x^3k(x) + 18x^3k(x) + 12x^2k(x) + 6x^4k'(x) + 4x^3k'(x)] / (3x+2)^2  (simplify)
= [12k(x)(x^3+x^2) + 2k'(x)(3x^4+2x^3)] / (3x+2)^2.

**EXAMPLE 3.31 (Determining Where a Function Has a Horizontal Tangent).** Determine the values of x for which
f(x) = x^3 - 7x^2 + 8x + 1 has a horizontal tangent line.

Solution: To find the values of x for which f(x) has a horizontal tangent line, we must solve f'(x) = 0. Since
f'(x) = 3x^2 - 14x + 8 = (3x-2)(x-4), we must solve (3x-2)(x-4) = 0. Thus we see that the function has
horizontal tangent lines at x = 2/3 and x = 4.

**EXAMPLE 3.32 (Finding a Velocity).** The position of an object on a coordinate axis at time t is given by
s(t) = t/(t^2+1). What is the initial velocity of the object?

Solution: Since the initial velocity is v(0) = s'(0), begin by finding s'(t) by applying the quotient rule:
s'(t) = [1*(t^2+1) - 2t(t)] / (t^2+1)^2 = (1 - t^2) / (t^2+1)^2. After evaluating at t = 0, we see that
v(0) = 1.

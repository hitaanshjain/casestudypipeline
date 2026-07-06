# OpenStax Calculus Volume 1, Section 3.6: The Chain Rule

## Learning Objectives
- State the chain rule for the composition of two functions.
- Apply the chain rule together with the power rule.
- Apply the chain rule and the product/quotient rules correctly in combination when both are necessary.
- Recognize the chain rule for a composition of three or more functions.
- Describe the proof of the chain rule.

## Topic Keywords
- chain rule
- composite functions
- power rule for composition
- chain rule with trigonometric functions
- product and quotient rules combined with the chain rule
- composition of three or more functions
- leibniz notation
- proof of the chain rule

## Content

Basic differentiation rules do not handle compositions of functions such as h(x) = sin(x^3)
or k(x) = sqrt(3x^2 + 1). The chain rule states that the derivative of a composite
function is the derivative of the outer function evaluated at the inner function, times
the derivative of the inner function.

### Rule: The Chain Rule
Let f and g be functions. For all x in the domain of g for which g is differentiable at x
and f is differentiable at g(x), the derivative of the composite function
h(x) = (f o g)(x) = f(g(x)) is given by
h'(x) = f'(g(x)) * g'(x).
Alternatively, if y is a function of u, and u is a function of x, then
dy/dx = (dy/du) * (du/dx).

### Problem-Solving Strategy: Applying the Chain Rule
1. To differentiate h(x) = f(g(x)), begin by identifying f(x) and g(x).
2. Find f'(x) and evaluate it at g(x) to obtain f'(g(x)).
3. Find g'(x).
4. Write h'(x) = f'(g(x)) * g'(x).
Note: work from the outside function in. The derivative of a composition of two
functions has two parts; the derivative of a composition of three functions has three
parts; and so on. Never evaluate a derivative at a derivative.

### Rule: Power Rule for Composition of Functions
For all values of x for which the derivative is defined, if h(x) = (g(x))^n, then
h'(x) = n(g(x))^(n-1) * g'(x).
(This follows from the chain rule by writing h(x) = (g(x))^n as f(g(x)) where f(x) = x^n,
so f'(x) = n x^(n-1) and f'(g(x)) = n(g(x))^(n-1).)

**EXAMPLE 3.48 (Using the Chain and Power Rules).** Find the derivative of
h(x) = 1/(3x^2+1)^2.

Solution:
First, rewrite h(x) = 1/(3x^2+1)^2 = (3x^2+1)^(-2). Applying the power rule for
composition with g(x) = 3x^2+1, so g'(x) = 6x:
h'(x) = -2(3x^2+1)^(-3) * (6x).
Rewriting back to the original form gives h'(x) = -12x/(3x^2+1)^3.

### Theorem 3.10: Using the Chain Rule with Trigonometric Functions
For all values of x for which the derivative is defined:
d/dx[sin(g(x))] = cos(g(x)) * g'(x)
d/dx[cos(g(x))] = -sin(g(x)) * g'(x)
d/dx[tan(g(x))] = sec^2(g(x)) * g'(x)
d/dx[cot(g(x))] = -csc^2(g(x)) * g'(x)
d/dx[sec(g(x))] = sec(g(x)) * tan(g(x)) * g'(x)
d/dx[csc(g(x))] = -csc(g(x)) * cot(g(x)) * g'(x)
Equivalently in Leibniz notation, for u a function of x: d/dx[sin u] = cos(u) du/dx,
d/dx[cos u] = -sin(u) du/dx, d/dx[tan u] = sec^2(u) du/dx, d/dx[cot u] = -csc^2(u) du/dx,
d/dx[sec u] = sec(u)tan(u) du/dx, d/dx[csc u] = -csc(u)cot(u) du/dx.

**EXAMPLE 3.54 (Combining the Chain Rule with the Product Rule).** Find the derivative
of h(x) = (2x+1)^5 (3x-2)^7.

Solution:
First apply the product rule, then apply the chain rule to each term of the product.
h'(x) = d/dx[(2x+1)^5]*(3x-2)^7 + d/dx[(3x-2)^7]*(2x+1)^5      Apply the product rule.
      = 5(2x+1)^4 * 2 * (3x-2)^7 + 7(3x-2)^6 * 3 * (2x+1)^5    Apply the chain rule.
      = 10(2x+1)^4(3x-2)^7 + 21(3x-2)^6(2x+1)^5                Simplify.
      = (2x+1)^4(3x-2)^6 (10(3x-2) + 21(2x+1))                 Factor out (2x+1)^4(3x-2)^6.
      = (2x+1)^4(3x-2)^6 (72x+1).                               Simplify.

### Rule: Chain Rule for a Composition of Three Functions
When differentiating the composition of three or more functions, apply the chain rule
more than once, always working from the outside in. For all values of x for which the
function is differentiable, if k(x) = h(f(g(x))), then
k'(x) = h'(f(g(x))) * f'(g(x)) * g'(x).
The derivative of a composition of three functions has three parts (a composition of
four functions has four parts, and so on).

**EXAMPLE 3.55 (Differentiating a Composite of Three Functions).** Find the derivative
of k(x) = cos^4(7x^2+1).

Solution:
First, rewrite k(x) as k(x) = (cos(7x^2+1))^4. Then apply the power rule (chain rule)
several times:
k'(x) = 4(cos(7x^2+1))^3 * d/dx[cos(7x^2+1)]                      Apply the chain rule.
      = 4(cos(7x^2+1))^3 * (-sin(7x^2+1)) * d/dx[7x^2+1]          Apply the chain rule.
      = 4(cos(7x^2+1))^3 * (-sin(7x^2+1)) * (14x)                 Apply the chain rule.
      = -56x sin(7x^2+1) cos^3(7x^2+1).                            Simplify.

### Proof (Informal Proof of the Chain Rule)
Assume g(x) != g(a) for x != a in some open interval containing a. Starting from the
limit definition of the derivative applied to h(x) = f(g(x)):
h'(a) = lim_(x->a) [f(g(x)) - f(g(a))] / (x - a).
Multiply and divide by g(x) - g(a):
h'(a) = lim_(x->a) {[f(g(x)) - f(g(a))]/[g(x) - g(a)]} * {[g(x) - g(a)]/(x - a)}.
The second factor tends to g'(a) as x -> a. Since g is differentiable at a, g is also
continuous at a, so lim_(x->a) g(x) = g(a); substituting y = g(x) and b = g(a) and
changing variables in the limit shows the first factor tends to f'(b) = f'(g(a)).
Therefore h'(a) = f'(g(a)) * g'(a).

### Rule: Chain Rule Using Leibniz's Notation
For h(x) = f(g(x)), let u = g(x) and y = h(x) = f(u), so h'(x) = dy/dx, f'(g(x)) = dy/du,
and g'(x) = du/dx. If y is a function of u, and u is a function of x, then
dy/dx = (dy/du) * (du/dx).
As with the Leibniz form of any derivative, the final answer must be expressed entirely
in terms of the original variable given in the problem.

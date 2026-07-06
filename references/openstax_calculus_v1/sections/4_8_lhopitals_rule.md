# OpenStax Calculus Volume 1, Section 4.8: L'Hopital's Rule

## Learning Objectives
- Recognize when to apply L'Hopital's rule.
- Identify indeterminate forms produced by quotients, products, subtractions, and powers, and apply L'Hopital's
  rule in each case.
- Describe the relative growth rates of functions.

## Topic Keywords
- indeterminate forms
- l'hopital's rule
- 0/0 form
- infinity/infinity form
- 0 times infinity form
- infinity minus infinity form
- exponential indeterminate forms
- growth rates of functions

## Content

### Indeterminate forms
If lim_(x->a) f(x) = L1 and lim_(x->a) g(x) = L2 != 0, then lim_(x->a) f(x)/g(x) = L1/L2. But if lim_(x->a) f(x) = 0
and lim_(x->a) g(x) = 0, the quotient f(x)/g(x) is called an indeterminate form of type 0/0: the notation 0/0 does
not mean dividing zero by zero, it represents a quotient of two limits that are each zero, and the exact behavior of
f(x)/g(x) cannot be determined without further analysis. Some such limits can already be evaluated by algebra or
known results, for example lim_(x->2) (x^2-4)/(x-2) = lim_(x->2) (x+2) = 4 by factoring the numerator, and
lim_(x->0) sin(x)/x = 1 by a geometric argument shown earlier in the text. L'Hopital's rule gives a general
technique, using derivatives, for evaluating such limits, and many others that resist algebraic tricks, directly.

The idea behind the rule: if f and g are differentiable near a with lim_(x->a) f(x) = 0 = lim_(x->a) g(x), then for
x near a, f(x) is approximately f(a) + f'(a)(x-a) and g(x) is approximately g(a) + g'(a)(x-a) (their local linear
approximations at a). Since f and g are continuous at a, f(a) = 0 = g(a), so f(x)/g(x) is approximately
[f'(a)(x-a)]/[g'(a)(x-a)] = f'(a)/g'(a) as x approaches a. This is the content of L'Hopital's rule.

### Theorem: L'Hopital's Rule (0/0 Case)
Suppose f and g are differentiable functions over an open interval containing a, except possibly at a. If
lim_(x->a) f(x) = 0 and lim_(x->a) g(x) = 0, then
lim_(x->a) f(x)/g(x) = lim_(x->a) f'(x)/g'(x),
assuming the limit on the right exists or is +infinity or -infinity. This result also holds if we are considering
one-sided limits, or if a = +infinity or a = -infinity.

### Theorem: L'Hopital's Rule (infinity/infinity Case)
Suppose f and g are differentiable functions over an open interval containing a, except possibly at a. Suppose
lim_(x->a) f(x) = +infinity (or -infinity) and lim_(x->a) g(x) = +infinity (or -infinity). Then
lim_(x->a) f(x)/g(x) = lim_(x->a) f'(x)/g'(x),
assuming the limit on the right exists or is +infinity or -infinity. This result also holds if the limit is
infinite, if a = +infinity or -infinity, or the limit is one-sided.

Caution (when the rule does NOT apply): L'Hopital's rule may only be used when the quotient is actually of type 0/0
or infinity/infinity; applying it to a quotient that is not indeterminate gives a wrong answer. For
lim_(x->1) (x^2+5)/(3x+4), the numerator and denominator tend to 6 and 7 respectively, not to 0/0 or
infinity/infinity, so differentiating top and bottom and evaluating lim_(x->1) 2x/3 = 2/3 would be an error; the
true limit, found by direct substitution, is 6/7 (Example 4.40 in the text).

**EXAMPLE 4.38 (partial, parts a and d) (Applying L'Hopital's Rule, 0/0 Case).** Evaluate lim_(x->0) (1-cos(x))/x
and lim_(x->0) (sin(x)-x)/x^2 by applying L'Hopital's rule.

Solution:
(a) As x->0, 1-cos(x) -> 0 and x -> 0, a 0/0 form. Applying L'Hopital's rule, lim_(x->0) (1-cos(x))/x =
lim_(x->0) sin(x)/1 = 0/1 = 0.
(d) As x->0, both sin(x)-x and x^2 approach 0, a 0/0 form. Applying L'Hopital's rule once gives
lim_(x->0) (sin(x)-x)/x^2 = lim_(x->0) (cos(x)-1)/(2x). The new quotient is again 0/0 as x->0, so L'Hopital's rule
is applied a second time: lim_(x->0) (cos(x)-1)/(2x) = lim_(x->0) (-sin(x))/2 = 0. Therefore
lim_(x->0) (sin(x)-x)/x^2 = 0.

(The book's remaining parts b and c apply the same 0/0 rule to lim_(x->1) sin(pi*x)/ln(x) = -pi and
lim_(x->infinity) (e^(1/x)-1)/(1/x) = 1. Example 4.39 applies the analogous infinity/infinity case, showing
lim_(x->infinity) (3x+5)/(2x+1) = 3/2, which matches the divide-by-highest-power method used earlier in the text,
and lim_(x->0+) ln(x)/cot(x) = 0 after two applications of the rule.)

### Other indeterminate forms: products, subtractions, and powers
Besides 0/0 and infinity/infinity, five more indeterminate forms arise: 0 times infinity, infinity minus infinity,
1^infinity, infinity^0, and 0^0. Each is rewritten algebraically into a 0/0 or infinity/infinity quotient so that
L'Hopital's rule can be applied.

For a product f(x)*g(x) where f(x) -> 0 and g(x) -> +infinity or -infinity (the "0 times infinity" form), rewrite
f(x)*g(x) as f(x)/(1/g(x)) (a 0/0 form) or as g(x)/(1/f(x)) (an infinity/infinity form), whichever produces the
simpler derivative to work with.

For a difference f(x) - g(x) where both f(x) and g(x) approach +infinity or -infinity (the "infinity minus
infinity" form), combine the two expressions, commonly over a common denominator, into a single fraction that is a
0/0 or infinity/infinity form.

For a power f(x)^g(x) producing the form "1^infinity", "infinity^0", or "0^0": let y = f(x)^g(x), so
ln(y) = g(x)*ln(f(x)), which is now a "0 times infinity" product; evaluate lim ln(y) by the method just described
(call the result L, which may be +infinity or -infinity), and then, since the natural logarithm is continuous,
lim y = e^L.

**EXAMPLE 4.41 (Indeterminate Form of Type 0 times infinity).** Evaluate lim_(x->0+) x*ln(x).

Solution:
Rewrite x*ln(x) = ln(x)/(1/x). As x->0+, ln(x) -> -infinity and 1/x -> +infinity, an infinity/infinity form.
Applying L'Hopital's rule, lim_(x->0+) ln(x)/(1/x) = lim_(x->0+) (1/x)/(-1/x^2) = lim_(x->0+) (-x) = 0. Therefore
lim_(x->0+) x*ln(x) = 0.

**EXAMPLE 4.42 (Indeterminate Form of Type infinity minus infinity).** Evaluate
lim_(x->0+) (1/x^2 - 1/tan(x)).

Solution:
Combine the two fractions over the common denominator x^2*tan(x): 1/x^2 - 1/tan(x) = (tan(x)-x^2)/(x^2*tan(x)). As
x->0+, both tan(x)-x^2 -> 0 and x^2*tan(x) -> 0, a 0/0 form. Differentiating numerator and denominator gives
lim_(x->0+) (tan(x)-x^2)/(x^2*tan(x)) = lim_(x->0+) (sec^2(x)-2x)/(x^2*sec^2(x)+2x*tan(x)). As x->0+, the new
numerator sec^2(x)-2x -> 1 while the new denominator is positive and -> 0, so the quotient -> +infinity. Therefore
lim_(x->0+) (1/x^2 - 1/tan(x)) = +infinity.

**EXAMPLE 4.43 (Indeterminate Form of Type infinity^0).** Evaluate lim_(x->infinity) x^(1/x).

Solution:
Let y = x^(1/x), so ln(y) = (1/x)*ln(x) = ln(x)/x, an infinity/infinity form as x->infinity. By L'Hopital's rule,
lim_(x->infinity) ln(x)/x = lim_(x->infinity) (1/x)/1 = 0. So lim_(x->infinity) ln(y) = 0, and since ln is
continuous, ln(lim_(x->infinity) y) = 0, which gives lim_(x->infinity) y = e^0 = 1. Therefore
lim_(x->infinity) x^(1/x) = 1.

(The same log-then-exponentiate technique handles the remaining power form: Example 4.44 evaluates
lim_(x->0+) x^sin(x), a 0^0 form, by writing ln(y) = sin(x)*ln(x), rewriting this as ln(x)/csc(x), showing
lim_(x->0+) ln(x)/csc(x) = lim_(x->0+) (-sin^2(x))/(x*cos(x)) = 0, and concluding lim_(x->0+) x^sin(x) = e^0 = 1.)

### Growth rates of functions
If f(x) and g(x) both approach infinity as x -> infinity, g is said to grow more rapidly than f as x -> infinity if
lim_(x->infinity) g(x)/f(x) = infinity, equivalently lim_(x->infinity) f(x)/g(x) = 0. If instead there is a nonzero
constant M with lim_(x->infinity) f(x)/g(x) = M, then f and g grow at the same rate as x -> infinity. L'Hopital's
rule lets these growth-rate comparisons be established directly from derivatives rather than from numerical tables.

**EXAMPLE 4.45 (Comparing the Growth Rates of ln(x), x^2, and e^x).** Use L'Hopital's rule to evaluate
lim_(x->infinity) x^2/e^x and lim_(x->infinity) ln(x)/x^2.

Solution:
(a) Since lim_(x->infinity) x^2 = infinity and lim_(x->infinity) e^x = infinity, apply L'Hopital's rule:
lim_(x->infinity) x^2/e^x = lim_(x->infinity) 2x/e^x. This is again an infinity/infinity form, so apply the rule a
second time: lim_(x->infinity) 2x/e^x = lim_(x->infinity) 2/e^x = 0. So lim_(x->infinity) x^2/e^x = 0, meaning e^x
grows more rapidly than x^2 as x -> infinity.
(b) Since lim_(x->infinity) ln(x) = infinity and lim_(x->infinity) x^2 = infinity, apply L'Hopital's rule:
lim_(x->infinity) ln(x)/x^2 = lim_(x->infinity) (1/x)/(2x) = lim_(x->infinity) 1/(2x^2) = 0. So x^2 grows more
rapidly than ln(x) as x -> infinity.

More generally, established the same way: e^x grows more rapidly than x^p for any p > 0, and x^p grows more rapidly
than ln(x) for any p > 0. Numerically, e^x already exceeds x^2 past about x = 5 (e^5 is about 148 versus 5^2 = 25),
and the gap widens quickly (at x = 20, e^20 is about 485,165,195 versus 20^2 = 400); by contrast ln(x) trails any
positive power of x by an ever-widening margin (at x = 10,000, ln(x) is about 9.21 while x^2 = 100,000,000).

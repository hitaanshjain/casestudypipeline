# OpenStax Calculus Volume 1, Section 3.9: Derivatives of Exponential and Logarithmic Functions

## Learning Objectives
- Find the derivative of exponential functions.
- Find the derivative of logarithmic functions.
- Use logarithmic differentiation to determine the derivative of a function.

## Topic Keywords
- derivative of e^x
- derivative of exponential functions
- derivative of natural logarithm
- derivative of logarithmic functions
- change of base
- logarithmic differentiation
- chain rule with exponentials and logarithms
- power rule for real exponents

## Content

### Derivative of the exponential function
Let B(x) = b^x for a fixed base b > 0. Assume B(x) is defined and continuous for every real
x, that B'(0) exists, and that there is a unique value of b for which B'(0) = 1. This unique
value is defined to be e (numerical estimation bounds 2.7182 < e < 2.7183, e ~ 2.718282).
The function E(x) = e^x is called the natural exponential function, and its inverse
L(x) = log_e(x) = ln(x) is called the natural logarithmic function.

Applying the limit definition of the derivative to B(x) = b^x gives, for any x:

    B'(x) = lim_(h->0) (b^(x+h) - b^x)/h = lim_(h->0) b^x(b^h - 1)/h
          = b^x lim_(h->0) (b^h - 1)/h = b^x B'(0).

So once B'(0) exists, B(x) = b^x is differentiable everywhere and B'(x) = b^x B'(0). For
E(x) = e^x, E'(0) = 1 by the definition of e, so E'(x) = e^x. (The value of B'(0) for a
general base b is derived later via Theorem 3.16.)

### Theorem 3.14: Derivative of the Natural Exponential Function
Let E(x) = e^x be the natural exponential function. Then

    E'(x) = e^x.

In general,

    d/dx (e^(g(x))) = e^(g(x)) g'(x).

**EXAMPLE 3.74 (Derivative of an Exponential Function).** Find the derivative of
f(x) = e^(tan(2x)).

Solution: Using the derivative formula and the chain rule,
f'(x) = e^(tan(2x)) * d/dx(tan(2x)) = e^(tan(2x)) sec^2(2x) * 2.

**EXAMPLE 3.75 (Combining Differentiation Rules).** Find the derivative of
y = e^(x^2)/x.

Solution: Use the derivative of the natural exponential function, the quotient rule, and
the chain rule.

    y' = (e^(x^2)*2x*x - 1*e^(x^2))/x^2 = e^(x^2)(2x^2 - 1)/x^2.

**EXAMPLE 3.76 (Applying the Natural Exponential Function).** A colony of mosquitoes has
an initial population of 1000. After t days, the population is given by
A(t) = 1000 e^(0.3t). Show that the ratio of the rate of change of the population, A'(t),
to the population A(t) is constant.

Solution: By the chain rule, A'(t) = 300 e^(0.3t). Thus

    A'(t)/A(t) = 300 e^(0.3t) / (1000 e^(0.3t)) = 0.3,

a constant.

### Derivative of the logarithmic function
Now that we have the derivative of the natural exponential function, implicit
differentiation gives the derivative of its inverse, the natural logarithmic function.

### Theorem 3.15: The Derivative of the Natural Logarithmic Function
If x > 0 and y = ln(x), then

    dy/dx = 1/x.

More generally, let g(x) be a differentiable function. For all values of x for which
g(x) > 0, the derivative of h(x) = ln(g(x)) is given by

    h'(x) = (1/g(x)) g'(x).

Proof: If x > 0 and y = ln(x), then e^y = x. Differentiating both sides gives
e^y (dy/dx) = 1, so dy/dx = 1/e^y = 1/x after substituting x = e^y. (Equivalently, since
y = g(x) = ln(x) is the inverse of f(x) = e^x, the inverse function theorem gives
dy/dx = 1/f'(g(x)) = 1/e^(ln x) = 1/x.) Applying the chain rule to h(x) = ln(g(x)) then
yields h'(x) = (1/g(x)) g'(x).

**EXAMPLE 3.77 (Taking a Derivative of a Natural Logarithm).** Find the derivative of
f(x) = ln(x^3 + 3x - 4).

Solution: Using h'(x) = (1/g(x)) g'(x) with g(x) = x^3 + 3x - 4,

    f'(x) = (1/(x^3+3x-4)) * (3x^2+3) = (3x^2+3)/(x^3+3x-4).

**EXAMPLE 3.78 (Using Properties of Logarithms in a Derivative).** Find the derivative of
f(x) = ln(x^2 sin(x) / (2x+1)).

Solution: At first glance this looks complicated, but expanding with properties of
logarithms first simplifies it considerably:

    f(x) = ln(x^2 sin(x)/(2x+1)) = 2 ln(x) + ln(sin(x)) - ln(2x+1)   (properties of logs)
    f'(x) = 2/x + cot(x) - 2/(2x+1)                                   (sum rule, h' = g'/g).

### Derivatives of general exponential and logarithmic functions
The derivative of the natural logarithm now lets us find the derivatives of y = log_b(x)
and y = b^x for any base b > 0, b != 1.

### Theorem 3.16: Derivatives of General Exponential and Logarithmic Functions
Let b > 0, b != 1, and let g(x) be a differentiable function.

i. If y = log_b(x), then

       dy/dx = 1/(x ln(b)).

   More generally, if h(x) = log_b(g(x)), then for all x for which g(x) > 0,

       h'(x) = g'(x)/(g(x) ln(b)).

ii. If y = b^x, then

        dy/dx = b^x ln(b).

    More generally, if h(x) = b^(g(x)), then

        h'(x) = b^(g(x)) g'(x) ln(b).

Proof: If y = log_b(x), then b^y = x, so ln(b^y) = ln(x), i.e. y ln(b) = ln(x), giving
y = ln(x)/ln(b). Since ln(b) is constant, differentiating gives dy/dx = 1/(x ln(b)); the
general form follows from the chain rule. If y = b^x, then ln(y) = x ln(b). Implicit
differentiation (ln(b) constant) gives (1/y) dy/dx = ln(b), so dy/dx = y ln(b) = b^x ln(b);
the general form again follows from the chain rule.

**EXAMPLE 3.79 (Applying Derivative Formulas).** Find the derivative of
h(x) = 3^x / (3^x + 2).

Solution: Use the quotient rule together with Theorem 3.16:

    h'(x) = (3^x ln(3)(3^x+2) - 3^x ln(3)(3^x)) / (3^x+2)^2 = (2*3^x ln(3)) / (3^x+2)^2.

**EXAMPLE 3.80 (Finding the Slope of a Tangent Line).** Find the slope of the line
tangent to the graph of y = log_2(3x+1) at x = 1.

Solution: dy/dx = 3/((3x+1) ln(2)). Evaluating at x = 1,

    dy/dx |_(x=1) = 3/(4 ln(2)) = 3/ln(16).

### Logarithmic differentiation
At this point we can differentiate y = (g(x))^n for constant n and y = b^(g(x)) for
b > 0, b != 1, but not yet functions such as y = x^x or y = x^pi, where both the base and
the exponent are variable (or where the base is a variable and the exponent is an
arbitrary real number). These require a technique called logarithmic differentiation,
which differentiates any function of the form h(x) = g(x)^(f(x)); it can also convert a
very complex differentiation problem (a product/quotient of several factors) into a
simpler one.

### Problem-Solving Strategy: Using Logarithmic Differentiation
1. To differentiate y = h(x) using logarithmic differentiation, take the natural logarithm
   of both sides of the equation to obtain ln(y) = ln(h(x)).
2. Use properties of logarithms to expand ln(h(x)) as much as possible.
3. Differentiate both sides of the equation. On the left we will have (1/y) dy/dx.
4. Multiply both sides of the equation by y to solve for dy/dx.
5. Replace y by h(x).

**EXAMPLE 3.81 (Using Logarithmic Differentiation).** Find the derivative of
y = (2x^4+1)^tan(x).

Solution:
1. ln(y) = ln((2x^4+1)^tan(x)).
2. ln(y) = tan(x) ln(2x^4+1).
3. (1/y) dy/dx = sec^2(x) ln(2x^4+1) + (8x^3/(2x^4+1)) tan(x).
4. dy/dx = y * (sec^2(x) ln(2x^4+1) + (8x^3/(2x^4+1)) tan(x)).
5. dy/dx = (2x^4+1)^tan(x) * (sec^2(x) ln(2x^4+1) + (8x^3/(2x^4+1)) tan(x)).

**EXAMPLE 3.82 (Using Logarithmic Differentiation).** Find the derivative of
y = (x sqrt(2x+1)) / (e^x sin^3(x)).

Solution: This makes use of the properties of logarithms and the differentiation rules
given in this section.
1. ln(y) = ln((x sqrt(2x+1))/(e^x sin^3(x))).
2. ln(y) = ln(x) + (1/2) ln(2x+1) - x ln(e) - 3 ln(sin(x)) = ln(x) + (1/2)ln(2x+1) - x -
   3 ln(sin(x)).
3. (1/y) dy/dx = 1/x + 1/(2x+1) - 1 - 3 cos(x)/sin(x) = 1/x + 1/(2x+1) - 1 - 3 cot(x).
4. dy/dx = y * (1/x + 1/(2x+1) - 1 - 3 cot(x)).
5. dy/dx = ((x sqrt(2x+1))/(e^x sin^3(x))) * (1/x + 1/(2x+1) - 1 - 3 cot(x)).

**EXAMPLE 3.83 (Extending the Power Rule).** Find the derivative of y = x^r, where r is
an arbitrary real number.

Solution: The process is the same as in Example 3.82, with fewer complications.
1. ln(y) = ln(x^r).
2. ln(y) = r ln(x).
3. (1/y) dy/dx = r/x.
4. dy/dx = y * (r/x).
5. dy/dx = x^r * (r/x) = r x^(r-1).

This confirms the power rule for an arbitrary real exponent r, not just rational or
integer n.

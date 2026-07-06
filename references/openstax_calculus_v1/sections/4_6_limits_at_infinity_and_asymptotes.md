# OpenStax Calculus Volume 1, Section 4.6: Limits at Infinity and Asymptotes

## Learning Objectives
- Calculate the limit of a function as x increases or decreases without bound.
- Recognize a horizontal asymptote on the graph of a function.
- Estimate the end behavior of a function as x increases or decreases without bound.
- Recognize an oblique asymptote on the graph of a function.
- Analyze a function and its derivatives to draw its graph.

## Topic Keywords
- limits at infinity
- horizontal asymptotes
- end behavior
- infinite limits at infinity
- power function and polynomial end behavior
- rational function asymptotes
- vertical asymptotes
- oblique asymptotes
- curve-sketching strategy

## Content
This section is unusually content-dense: it develops limits at infinity, all three families of end behavior (polynomial, rational/radical, transcendental), both asymptote types not yet covered (vertical is reviewed, oblique is new), and a full six-step graphing strategy. To keep the file faithful without ballooning, three full worked examples are included (matching the book's own numbers: 4.21, 4.25, 4.30), chosen so each of the distinct skills below (horizontal asymptote computation, horizontal asymptote of a rational function, vertical asymptote via one-sided limits, oblique asymptote via long division, full graphing strategy) is demonstrated at least once; the remaining book examples (4.22-4.24, 4.26-4.29, 4.31) are summarized in prose rather than reproduced in full.

### Limits at infinity and horizontal asymptotes
For a function f, we say the limit as x approaches infinity of f(x) is L, written lim_(x->infinity) f(x) = L, if f(x) becomes arbitrarily close to L as long as x is sufficiently large. Similarly, the limit as x approaches negative infinity of f(x) is L, written lim_(x->-infinity) f(x) = L, if f(x) becomes arbitrarily close to L for x < 0 with |x| sufficiently large.

### Definition: horizontal asymptote
If lim_(x->infinity) f(x) = L or lim_(x->-infinity) f(x) = L, the line y = L is a horizontal asymptote of f.

Unlike a vertical asymptote, which a function's graph can never cross, a function may cross a horizontal asymptote, even infinitely many times: for example f(x) = cos(x)/x + 1 crosses its horizontal asymptote y = 1 infinitely often while still approaching it as x -> infinity.

**EXAMPLE 4.21 (Computing Limits at Infinity).** For each function f, evaluate lim_(x->infinity) f(x) and lim_(x->-infinity) f(x), and determine the horizontal asymptote(s) for f: (a) f(x) = 5 - 2/x^2; (b) f(x) = sin(x)/x; (c) f(x) = arctan(x).

Solution:
(a) By the algebraic limit laws, lim_(x->infinity) (5 - 2/x^2) = 5 - 2(0) = 5, and likewise lim_(x->-infinity) f(x) = 5. So f has one horizontal asymptote, y = 5, approached as x -> +/-infinity.
(b) Since -1 <= sin(x) <= 1 for all x, dividing by x gives -1/x <= sin(x)/x <= 1/x (for x > 0, with the inequalities reversed for x < 0). Since lim_(x->+/-infinity) (1/x) = 0 = lim_(x->+/-infinity) (-1/x), the squeeze theorem gives lim_(x->+/-infinity) sin(x)/x = 0. So f has a horizontal asymptote y = 0, which the graph in fact crosses many times near the origin.
(c) Since tan(x) -> infinity as x -> (pi/2)^-, it follows that lim_(x->infinity) arctan(x) = pi/2. Since tan(x) -> -infinity as x -> (-pi/2)^+, lim_(x->-infinity) arctan(x) = -pi/2. So f has two horizontal asymptotes, y = pi/2 and y = -pi/2.

### Infinite limits at infinity
Sometimes the values of f grow without bound as x -> infinity (or x -> -infinity); this is written lim_(x->infinity) f(x) = infinity (or = -infinity), with the analogous statements as x -> -infinity. For example, since x^3 grows without bound as x -> infinity, and is negative but unbounded in magnitude as x -> -infinity, lim_(x->infinity) x^3 = infinity and lim_(x->-infinity) x^3 = -infinity. (The book also gives formal epsilon/N and epsilon/M definitions of these limits and proves several of the above results directly from them; that proof machinery is omitted here as it is not needed downstream.)

### End behavior
The behavior of f as x -> +/-infinity is called the function's end behavior. At each end, a function shows one of three behaviors: (1) f(x) approaches a horizontal asymptote y = L; (2) f(x) -> infinity or f(x) -> -infinity; or (3) f(x) approaches no finite limit and does not approach +/-infinity either (typically oscillatory behavior, as with sin(x) or tan(x)).

### End behavior for power functions and polynomials
For a positive integer n, lim_(x->infinity) x^n = infinity for n = 1, 2, 3, .... As x -> -infinity, lim_(x->-infinity) x^n = infinity for even n and = -infinity for odd n. For any constant c: if c > 0, cx^n has the same limits as x^n; if c < 0, both limits flip sign; if c = 0, both limits are 0. (For example, since the coefficient of -5x^3 is negative, lim_(x->infinity) (-5x^3) = -infinity and lim_(x->-infinity) (-5x^3) = infinity.)

For a polynomial f(x) = a_n x^n + a_(n-1) x^(n-1) + ... + a_1 x + a_0 of degree n >= 1 with a_n != 0, factoring out a_n x^n shows every other term approaches zero as x -> +/-infinity, so lim_(x->+/-infinity) f(x) = lim_(x->+/-infinity) a_n x^n: a polynomial's end behavior is governed entirely by its leading term. For instance f(x) = 5x^3 - 3x^2 + 4 behaves like g(x) = 5x^3 as x -> +/-infinity.

### End behavior for rational and radical functions
For rational and radical functions, end behavior is found by dividing the numerator and denominator by the highest power of x appearing in the denominator; this isolates which term dominates as x grows large.

**EXAMPLE 4.25 (Determining End Behavior for Rational Functions).** For each function, find the limits as x -> +/-infinity and describe the end behavior: (a) f(x) = (3x-1)/(2x+5), where the numerator and denominator have the same degree; (b) f(x) = (3x^2+2x)/(4x^3-5x+7), where the numerator's degree is less than the denominator's; (c) f(x) = (3x^2+4x)/(x+2), where the numerator's degree is greater than the denominator's.

Solution:
(a) The highest power of x in the denominator is x. Dividing top and bottom by x and applying the algebraic limit laws, lim_(x->+/-infinity) (3x-1)/(2x+5) = lim (3 - 1/x)/(2 + 5/x) = (3-0)/(2+0) = 3/2. So f has a horizontal asymptote y = 3/2.
(b) The highest power in the denominator is x^3. Dividing by x^3, lim_(x->+/-infinity) (3x^2+2x)/(4x^3-5x+7) = lim (3/x + 2/x^2)/(4 - 5/x^2 + 7/x^3) = 0/4 = 0. So f has a horizontal asymptote y = 0.
(c) Dividing by x, lim_(x->+/-infinity) (3x^2+4x)/(x+2) = lim (3x+4)/(1+2/x). As x -> +/-infinity the denominator approaches 1, while the numerator itself grows without bound: it approaches +infinity as x -> infinity and -infinity as x -> -infinity. So lim_(x->infinity) f(x) = infinity and lim_(x->-infinity) f(x) = -infinity, and f has no horizontal asymptote. Long division gives f(x) = 3x - 2 + 4/(x+2); since 4/(x+2) -> 0 as x -> +/-infinity, the graph of f approaches the line y = 3x - 2, an example of an oblique (slant) asymptote.

### Theorem: end behavior of a rational function
For a rational function f(x) = p(x)/q(x) = (a_n x^n + ... + a_0)/(b_m x^m + ... + b_0) with a_n != 0 and b_m != 0:
1. If n = m (same degree), f has horizontal asymptote y = a_n/b_m as x -> +/-infinity.
2. If n < m, f has horizontal asymptote y = 0 as x -> +/-infinity.
3. If n > m, f has no horizontal asymptote; the limits at infinity are +infinity or -infinity depending on the signs of the leading terms. Writing f(x) = g(x) + r(x)/q(x) by long division, with the degree of r less than the degree of q, the values of f approach the values of g as x -> +/-infinity; if n = m + 1, g is linear, and g is called an oblique asymptote for f.

For radical functions such as f(x) = (3x-2)/sqrt(4x^2+5), the division must be by |x| rather than x, since sqrt(x^2) = |x| for all x; this can produce two DIFFERENT horizontal asymptotes, one as x -> infinity and another as x -> -infinity (here y = 3/2 and y = -3/2, respectively), since |x| = x for x > 0 but |x| = -x for x < 0.

### End behavior for transcendental functions
The six trigonometric functions are periodic and do not approach a finite limit or +/-infinity as x -> +/-infinity: sin(x), for instance, oscillates forever between -1 and 1, and tan(x) has infinitely many vertical asymptotes as x -> +/-infinity, so it approaches neither a finite limit nor +/-infinity. For the natural exponential function, since e > 1, f(x) = e^x is increasing on (-infinity, infinity), with lim_(x->infinity) e^x = infinity and lim_(x->-infinity) e^x = 0. Since f(x) = ln(x) is the inverse of e^x, lim_(x->infinity) ln(x) = infinity, and ln(x) -> -infinity as x -> 0^+. For rational combinations of exponentials, such as f(x) = (2+3e^x)/(7-5e^x), dividing numerator and denominator by e^x and using e^x -> infinity as x -> infinity, e^x -> 0 as x -> -infinity, gives two different horizontal asymptotes (here y = -3/5 as x -> infinity, and y = 2/7 as x -> -infinity).

### Vertical asymptotes
A function can also have a vertical asymptote x = a, where at least one one-sided limit as x -> a is infinity or -infinity; unlike a horizontal asymptote, a function's graph can never cross a vertical asymptote. To confirm a candidate vertical asymptote (typically a zero of a rational function's denominator that is not also a zero of the numerator), evaluate both one-sided limits as x approaches that value.

### Guidelines for drawing the graph of a function
Given a function f, use the following strategy to sketch its graph:
1. Determine the domain of f.
2. Locate the x- and y-intercepts.
3. Evaluate lim_(x->infinity) f(x) and lim_(x->-infinity) f(x) to find the end behavior. If either limit is a finite number L, y = L is a horizontal asymptote. If f is rational with numerator degree one more than denominator degree, find the oblique asymptote by long division.
4. Determine whether f has any vertical asymptotes.
5. Calculate f'. Find all critical points and determine the intervals where f is increasing and where f is decreasing, and whether f has any local extrema.
6. Calculate f''. Determine the intervals where f is concave up and where f is concave down, and use this to locate any inflection points; f'' can also verify the local extrema found in step 5.

**EXAMPLE 4.30 (Sketching a Rational Function with an Oblique Asymptote).** Sketch the graph of f(x) = x^2/(x-1).

Solution:
Step 1: the domain is all real x except x = 1.
Step 2: f(0) = 0, so (0, 0) is the only intercept.
Step 3: the numerator's degree (2) is exactly one more than the denominator's degree (1), so f has an oblique asymptote. Long division gives f(x) = x^2/(x-1) = x + 1 + 1/(x-1); since 1/(x-1) -> 0 as x -> +/-infinity, f approaches the line y = x + 1 as x -> +/-infinity.
Step 4: the denominator is zero at x = 1. Checking one-sided limits, lim_(x->1+) x^2/(x-1) = infinity and lim_(x->1-) x^2/(x-1) = -infinity, so x = 1 is a vertical asymptote.
Step 5: f'(x) = [(x-1)(2x) - x^2(1)]/(x-1)^2 = (x^2-2x)/(x-1)^2 = x(x-2)/(x-1)^2, which is zero at x = 0 and x = 2 (critical points) and undefined at x = 1. Testing the four intervals (-infinity,0), (0,1), (1,2), (2,infinity) shows f is increasing on (-infinity,0), decreasing on (0,1) and on (1,2), and increasing on (2,infinity). So f has a local maximum at x = 0 (value f(0) = 0) and a local minimum at x = 2 (value f(2) = 4).
Step 6: f''(x) = 2/(x-1)^3, which is never zero and is undefined only at x = 1. Since f'' < 0 on (-infinity,1) and f'' > 0 on (1,infinity), f is concave down on (-infinity,1) and concave up on (1,infinity); there is no inflection point at x = 1 because f is not continuous there. Combining the intercept at the origin, the oblique asymptote y = x+1, the vertical asymptote x = 1, the local maximum (0,0), the local minimum (2,4), and the concavity change at the discontinuity produces the full graph of f.

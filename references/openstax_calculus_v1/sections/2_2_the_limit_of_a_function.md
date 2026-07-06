# OpenStax Calculus Volume 1, Section 2.2: The Limit of a Function

## Learning Objectives
- Using correct notation, describe the limit of a function.
- Use a table of values to estimate the limit of a function or to identify when the limit does not exist.
- Use a graph to estimate the limit of a function or to identify when the limit does not exist.
- Define one-sided limits and provide examples.
- Explain the relationship between one-sided and two-sided limits.
- Using correct notation, describe an infinite limit.
- Define a vertical asymptote.

## Topic Keywords
- limits
- one-sided limits
- infinite limits
- vertical asymptotes
- limit notation
- table of functional values
- does not exist (dne)
- intuitive definition of a limit

## Content

### Definition: Limit of a Function (intuitive)
Consider a function such as f(x) = (x^2 - 4)/(x - 2). As x approaches 2 from either side, the
values of f(x) approach 4, even though f is undefined at x = 2 itself; we express this as
lim_(x->2) f(x) = 4. This motivates the general definition. Let f(x) be a function defined at
all values in an open interval containing a, with the possible exception of a itself, and let L
be a real number. If all values of the function f(x) approach the real number L as the values
of x (x != a) approach the number a, then we say that the limit of f(x) as x approaches a is L.
(More succinctly: as x gets closer to a, f(x) gets closer to and stays close to L.) Symbolically,
we express this idea as
    lim_(x->a) f(x) = L.
We can estimate limits by constructing tables of functional values and by looking at graphs.

### Problem-solving strategy: evaluating a limit using a table of functional values
1. To evaluate lim_(x->a) f(x), begin by completing a table of functional values. Choose two
sets of x-values: one set approaching a and less than a, and another approaching a and greater
than a (e.g. a - 0.1, a - 0.01, a - 0.001, a - 0.0001 and a + 0.1, a + 0.01, a + 0.001,
a + 0.0001, using additional values as necessary).
2. Look at the values in each column and determine whether they seem to be approaching a single
value as you move down each column.
3. If both columns approach a common y-value L, state lim_(x->a) f(x) = L.
4. Confirm the result (or use as an alternative method) by graphing f(x) on a window containing
a, tracing along the graph, and watching whether the y-values approach L as the x-values
approach a from both directions. Zoom in and repeat as necessary.

**EXAMPLE 2.4 (Evaluating a Limit Using a Table of Functional Values).** Evaluate
lim_(x->0) (sin x)/x using a table of functional values.

Solution: Let f(x) = (sin x)/x. Computing f(x) for values of x approaching 0 from both sides:
x = -0.1, f(x) = 0.998334166468; x = 0.1, f(x) = 0.998334166468
x = -0.01, f(x) = 0.999983333417; x = 0.01, f(x) = 0.999983333417
x = -0.001, f(x) = 0.999999833333; x = 0.001, f(x) = 0.999999833333
x = -0.0001, f(x) = 0.999999998333; x = 0.0001, f(x) = 0.999999998333
As we read down each (sin x)/x column, the values appear to be approaching 1. It is fairly
reasonable to conclude that lim_(x->0) (sin x)/x = 1; a calculator or computer-generated graph
of f(x) = (sin x)/x confirms this estimate.

### Theorem 2.1: Two Important Limits
Let a be a real number and c be a constant.
i. lim_(x->a) x = a.
ii. lim_(x->a) c = c.
For (i), observe that as x approaches a, so does f(x), because f(x) = x; consequently
lim_(x->a) x = a. For (ii), observe that for all values of x (regardless of whether they are
approaching a from the left or the right), the values f(x) remain constant at c; we have no
choice but to conclude lim_(x->a) c = c.

### The existence of a limit
For the limit of a function to exist at a point, the functional values must approach a single
real-number value at that point. If the functional values do not approach a single value, then
the limit does not exist.

**EXAMPLE 2.7 (Evaluating a Limit That Fails to Exist).** Evaluate lim_(x->0) sin(1/x) using a
table of values.

Solution: Table of values for sin(1/x):
x = -0.1, 0.544021110889; x = 0.1, -0.544021110889
x = -0.01, 0.50636564111; x = 0.01, -0.50636564111
x = -0.001, -0.8268795405312; x = 0.001, 0.826879540532
x = -0.0001, 0.305614388888; x = 0.0001, -0.305614388888
x = -0.00001, -0.035748797987; x = 0.00001, 0.035748797987
x = -0.000001, 0.349993504187; x = 0.000001, -0.349993504187
After examining the table, the y-values do not seem to approach any one single value. Taking
the sequence of x-values 2/pi, 2/(3pi), 2/(5pi), 2/(7pi), 2/(9pi), 2/(11pi), ... approaching 0,
the corresponding y-values are 1, -1, 1, -1, 1, -1, .... At this point we can indeed conclude
that lim_(x->0) sin(1/x) does not exist (abbreviated DNE): sin(1/x) oscillates ever more wildly
between -1 and 1 as x approaches 0.

### One-sided limits
Sometimes stating that the limit of a function fails to exist at a point does not give a
complete picture of the function's behavior around that point. Consider g(x) = |x - 2|/(x - 2).
As x approaches 2, g(x) does not approach a single value, so lim_(x->2) g(x) does not exist.
However, for all values to the left of 2 (the negative side of 2), g(x) = -1; thus as x
approaches 2 from the left, g(x) approaches -1, expressed as lim_(x->2^-) g(x) = -1. Similarly,
as x approaches 2 from the right (the positive side), g(x) approaches 1, expressed as
lim_(x->2^+) g(x) = 1.

### Definition: One-Sided Limits
We define two types of one-sided limits.
Limit from the left: Let f(x) be a function defined at all values in an open interval of the
form (c, a), and let L be a real number. If the values of the function f(x) approach the real
number L as the values of x (where x < a) approach the number a, then we say that L is the limit
of f(x) as x approaches a from the left. Symbolically: lim_(x->a^-) f(x) = L.
Limit from the right: Let f(x) be a function defined at all values in an open interval of the
form (a, c), and let L be a real number. If the values of the function f(x) approach the real
number L as the values of x (where x > a) approach the number a, then we say that L is the limit
of f(x) as x approaches a from the right. Symbolically: lim_(x->a^+) f(x) = L.

**EXAMPLE 2.8 (Evaluating One-Sided Limits).** For the function
f(x) = { x + 1, x < 2 ; x^2 - 4, x >= 2 }, evaluate each of the following limits.
a. lim_(x->2^-) f(x)   b. lim_(x->2^+) f(x)

Solution: Using tables of functional values: for values of x less than 2, use f(x) = x + 1, and
for values of x greater than 2, use f(x) = x^2 - 4.
x = 1.9, f(x) = 2.9; x = 2.1, f(x) = 0.41
x = 1.99, f(x) = 2.99; x = 2.01, f(x) = 0.0401
x = 1.999, f(x) = 2.999; x = 2.001, f(x) = 0.004001
x = 1.9999, f(x) = 2.9999; x = 2.0001, f(x) = 0.00040001
x = 1.99999, f(x) = 2.99999; x = 2.00001, f(x) = 0.0000400001
Based on this table, we conclude that a. lim_(x->2^-) f(x) = 3 and b. lim_(x->2^+) f(x) = 0.
Therefore the (two-sided) limit of f(x) does not exist at x = 2, since f has a break there.

### Theorem 2.2: Relating One-Sided and Two-Sided Limits
Let f(x) be a function defined at all values in an open interval containing a, with the possible
exception of a itself, and let L be a real number. Then,
    lim_(x->a) f(x) = L if and only if lim_(x->a^-) f(x) = L and lim_(x->a^+) f(x) = L.

### Infinite limits
Evaluating the limit of a function at a point, or the limits from the right and left at a
point, helps characterize the behavior of a function around a given value; we can also describe
the behavior of functions that do not have finite limits. Consider h(x) = 1/(x - 2)^2: as the
values of x approach 2, the values of h(x) become larger and larger, in fact becoming infinite.
We say that the limit of h(x) as x approaches 2 is positive infinity: lim_(x->2) h(x) = infinity.

### Definition: Infinite Limits
We define three types of infinite limits.
Infinite limits from the left: Let f(x) be a function defined at all values in an open interval
of the form (b, a).
i. If the values of f(x) increase without bound as the values of x (where x < a) approach the
number a, we say that the limit as x approaches a from the left is positive infinity, and write
lim_(x->a^-) f(x) = infinity.
ii. If the values of f(x) decrease without bound as the values of x (where x < a) approach the
number a, we say that the limit as x approaches a from the left is negative infinity, and write
lim_(x->a^-) f(x) = -infinity.
Infinite limits from the right: Let f(x) be a function defined at all values in an open interval
of the form (a, c).
i. If the values of f(x) increase without bound as the values of x (where x > a) approach the
number a, we say that the limit as x approaches a from the right is positive infinity, and write
lim_(x->a^+) f(x) = infinity.
ii. If the values of f(x) decrease without bound as the values of x (where x > a) approach the
number a, we say that the limit as x approaches a from the right is negative infinity, and write
lim_(x->a^+) f(x) = -infinity.
Two-sided infinite limit: Let f(x) be defined for all x != a in an open interval containing a.
i. If the values of f(x) increase without bound as the values of x (where x != a) approach the
number a, we say that the limit as x approaches a is positive infinity, and write
lim_(x->a) f(x) = infinity.
ii. If the values of f(x) decrease without bound as the values of x (where x != a) approach the
number a, we say that the limit as x approaches a is negative infinity, and write
lim_(x->a) f(x) = -infinity.
Writing lim_(x->a) f(x) = infinity or lim_(x->a) f(x) = -infinity describes the behavior of the
function; it is not an assertion that a (finite) limit exists. That said, when lim_(x->a) f(x) =
infinity, we always write this rather than lim_(x->a) f(x) DNE.

### Theorem 2.3: Infinite Limits from Positive Integers
Functions of the form f(x) = 1/(x - a)^n, where n is a positive integer, have infinite limits as
x approaches a from either the left or the right.
If n is a positive even integer, then lim_(x->a) 1/(x - a)^n = infinity.
If n is a positive odd integer, then lim_(x->a^+) 1/(x - a)^n = infinity and
lim_(x->a^-) 1/(x - a)^n = -infinity.

As x approaches a, points on the graph of f(x) = 1/(x - a)^n are closer and closer to the
vertical line x = a. The line x = a is called a vertical asymptote of the graph.

### Definition: Vertical Asymptote
Let f(x) be a function. If any of the following conditions hold, then the line x = a is a
vertical asymptote of f(x):
lim_(x->a^-) f(x) = infinity or -infinity;
lim_(x->a^+) f(x) = infinity or -infinity;
or lim_(x->a) f(x) = infinity or -infinity.

**EXAMPLE 2.10 (Finding a Vertical Asymptote).** Evaluate each of the following limits using
Infinite Limits from Positive Integers. Identify any vertical asymptotes of the function
f(x) = 1/(x + 3)^4.
a. lim_(x->-3^-) 1/(x + 3)^4   b. lim_(x->-3^+) 1/(x + 3)^4   c. lim_(x->-3) 1/(x + 3)^4

Solution: We can use Infinite Limits from Positive Integers directly (here n = 4 is even):
a. lim_(x->-3^-) 1/(x + 3)^4 = infinity
b. lim_(x->-3^+) 1/(x + 3)^4 = infinity
c. lim_(x->-3) 1/(x + 3)^4 = infinity
The function f(x) = 1/(x + 3)^4 has a vertical asymptote at x = -3.

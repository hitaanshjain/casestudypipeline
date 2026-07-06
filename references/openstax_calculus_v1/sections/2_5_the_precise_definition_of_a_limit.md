# OpenStax Calculus Volume 1, Section 2.5: The Precise Definition of a Limit

## Learning Objectives
- Describe the epsilon-delta definition of a limit.
- Apply the epsilon-delta definition to find the limit of a function.
- Describe the epsilon-delta definitions of one-sided limits and infinite limits.
- Use the epsilon-delta definition to prove the limit laws.

## Topic Keywords
- epsilon-delta definition
- limit proofs
- one-sided limits
- infinite limits
- triangle inequality
- sum law for limits
- limit does not exist

## Content

### Quantifying closeness
The distance between two points a and b on a number line is |a - b|. The statement
|f(x) - L| < epsilon may be interpreted as: the distance between f(x) and L is less than
epsilon. The statement 0 < |x - a| < delta may be interpreted as: x != a and the distance
between x and a is less than delta. Equivalences: |f(x) - L| < epsilon is equivalent to
L - epsilon < f(x) < L + epsilon; 0 < |x - a| < delta is equivalent to
a - delta < x < a + delta and x != a.

### Definition: the epsilon-delta definition of the limit
Let f(x) be defined for all x != a over an open interval containing a. Let L be a real
number. Then

    lim_(x->a) f(x) = L

if, for every epsilon > 0, there exists a delta > 0, such that if 0 < |x - a| < delta,
then |f(x) - L| < epsilon.

### Problem-solving strategy: proving lim_(x->a) f(x) = L for a specific function f(x)
1. Begin the proof with the statement: Let epsilon > 0.
2. Obtain a value for delta. After obtaining this value, state: Choose delta = ___,
   filling in the blank with the choice of delta.
3. State (filling in the given value for a): Assume 0 < |x - a| < delta.
4. Based on this assumption, show that |f(x) - L| < epsilon, where f(x) and L are the
   given function and limit; at some point the proof must use 0 < |x - a| < delta.
5. Conclude with the statement: Therefore, lim_(x->a) f(x) = L.

**EXAMPLE 2.39 (Proving a Statement about the Limit of a Specific Function).** Prove
that lim_(x->1) (2x + 1) = 3.

Solution:
Let epsilon > 0.
Choose delta = epsilon/2. (Since we ultimately want |(2x+1) - 3| < epsilon, we manipulate
this expression: |(2x+1) - 3| < epsilon is equivalent to |2x - 2| < epsilon, which in turn
is equivalent to |2||x-1| < epsilon, which is equivalent to |x - 1| < epsilon/2. Thus
delta = epsilon/2 is appropriate.)
Assume 0 < |x - 1| < delta. Thus:

    |(2x+1) - 3| = |2x - 2| = |2(x-1)| = |2||x-1| = 2|x-1| < 2*delta = 2*(epsilon/2) = epsilon.

Therefore, lim_(x->1) (2x + 1) = 3.

**EXAMPLE 2.42 (Proving a Statement about the Limit of a Specific Function, Algebraic
Approach).** Prove that lim_(x->-1) (x^2 - 2x + 3) = 6.

Solution: Using the Problem-Solving Strategy:
1. Let epsilon > 0.
2. Choose delta = min{1, epsilon/5}. This comes from the target inequality
   |(x^2-2x+3) - 6| < epsilon, which is equivalent to |x+1|*|x-3| < epsilon. Since delta
   must depend only on epsilon and not on x, we bound |x-3| by first assuming delta <= 1.
   We also require delta <= epsilon/5.
3. Assume 0 < |x + 1| < delta. Thus |x+1| < 1 and |x+1| < epsilon/5. Since |x+1| < 1,
   -1 < x+1 < 1; subtracting 4 from all parts gives -5 < x-3 < -1, hence |x-3| < 5.
   Consequently:

       |(x^2-2x+3) - 6| = |x+1|*|x-3| < (epsilon/5)*5 = epsilon.

Therefore, lim_(x->-1) (x^2 - 2x + 3) = 6.

### Definition: the triangle inequality
If a and b are any real numbers, then |a + b| <= |a| + |b|.

### Theorem: sum law for limits (proved from the epsilon-delta definition)
If lim_(x->a) f(x) = L and lim_(x->a) g(x) = M, then lim_(x->a) (f(x) + g(x)) = L + M.

Proof: Let epsilon > 0. Choose delta_1 > 0 so that if 0 < |x-a| < delta_1, then
|f(x) - L| < epsilon/2. Choose delta_2 > 0 so that if 0 < |x-a| < delta_2, then
|g(x) - M| < epsilon/2. Choose delta = min{delta_1, delta_2}. Assume 0 < |x - a| < delta.
Thus 0 < |x-a| < delta_1 and 0 < |x-a| < delta_2. Hence, using the triangle inequality:

    |(f(x)+g(x)) - (L+M)| = |(f(x)-L) + (g(x)-M)| <= |f(x)-L| + |g(x)-M| < epsilon/2 + epsilon/2 = epsilon.

### What it means for a limit not to exist
The limit lim_(x->a) f(x) does not exist if there is no real number L for which
lim_(x->a) f(x) = L. Equivalently: lim_(x->a) f(x) does not exist if, for every real
number L, there exists a real number epsilon > 0 such that for every delta > 0, there is
an x satisfying 0 < |x - a| < delta for which |f(x) - L| >= epsilon.

### One-sided limits: definitions
Limit from the Right: Let f(x) be defined over an open interval of the form (a, b) where
a < b. Then lim_(x->a^+) f(x) = L if for every epsilon > 0, there exists a delta > 0 such
that if 0 < x - a < delta, then |f(x) - L| < epsilon.

Limit from the Left: Let f(x) be defined over an open interval of the form (b, a) where
b < a. Then lim_(x->a^-) f(x) = L if for every epsilon > 0, there exists a delta > 0 such
that if -delta < x - a < 0, then |f(x) - L| < epsilon.

**EXAMPLE 2.44 (Proving a Statement about a Limit From the Right).** Prove that
lim_(x->4^+) sqrt(x - 4) = 0.

Solution:
Let epsilon > 0.
Choose delta = epsilon^2. (Since we ultimately want |sqrt(x-4) - 0| < epsilon, i.e.
sqrt(x-4) < epsilon, this is equivalent to 0 < x - 4 < epsilon^2, making delta = epsilon^2
a clear choice.)
Assume 0 < x - 4 < delta. Thus 0 < x - 4 < epsilon^2. Hence 0 < sqrt(x-4) < epsilon.
Finally, |sqrt(x-4) - 0| < epsilon.
Therefore, lim_(x->4^+) sqrt(x - 4) = 0.

### Infinite limits: definitions
Let f(x) be defined for all x != a in an open interval containing a. Then we have an
infinite limit lim_(x->a) f(x) = infinity if for every M > 0, there exists a delta > 0
such that if 0 < |x - a| < delta, then f(x) > M.

Let f(x) be defined for all x != a in an open interval containing a. Then we have a
negative infinite limit lim_(x->a) f(x) = -infinity if for every M > 0, there exists a
delta > 0 such that if 0 < |x - a| < delta, then f(x) < -M.

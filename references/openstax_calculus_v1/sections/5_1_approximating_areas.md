# OpenStax Calculus Volume 1, Section 5.1: Approximating Areas

## Learning Objectives
- Use sigma (summation) notation to calculate sums and powers of integers.
- Use the sum of rectangular areas to approximate the area under a curve.
- Use Riemann sums to approximate area.

## Topic Keywords
- sigma notation
- summation properties
- sum of integers formula
- regular partition
- left-endpoint approximation
- right-endpoint approximation
- riemann sum
- upper sum
- lower sum

## Content

Notation convention used throughout this file: the sum from i=1 to n of a_i is written sum_{i=1}^{n} a_i.

### Sigma (summation) notation
Sigma notation compresses a long string of added terms. A general sum is written sum_{i=1}^{n} a_i, where a_i
describes the terms to be added and i is called the index; each term is evaluated and the values are added,
beginning with the value when i=1 and ending with the value when i=n. The index is a dummy variable: it only
tracks which terms are added and does not appear in the final numeric value. Any letter may be used for the
index (i, j, k, m, n are typical). More generally sum_{i=m}^{n} a_i means a_m + a_(m+1) + ... + a_n.

**EXAMPLE 5.1 (Using Sigma Notation).** Write in sigma notation and evaluate the sum of terms 3^i for
i = 1, 2, 3, 4, 5.

Solution: sum_{i=1}^{5} 3^i = 3^1 + 3^2 + 3^3 + 3^4 + 3^5 = 3 + 9 + 27 + 81 + 243 = 363.

### Rule: properties of sigma notation
Let a_1, a_2, ..., a_n and b_1, b_2, ..., b_n be two sequences of terms and let c be a constant. The following
hold for all positive integers n and for integers m with 1 <= m <= n:
1. sum_{i=1}^{n} c = nc (summing a constant n times).
2. sum_{i=1}^{n} c*a_i = c * sum_{i=1}^{n} a_i (constant multiple rule).
3. sum_{i=1}^{n} (a_i + b_i) = sum_{i=1}^{n} a_i + sum_{i=1}^{n} b_i (sum rule).
4. sum_{i=1}^{n} (a_i - b_i) = sum_{i=1}^{n} a_i - sum_{i=1}^{n} b_i (difference rule).
5. sum_{i=1}^{n} a_i = sum_{i=1}^{m} a_i + sum_{i=m+1}^{n} a_i (splitting a sum at an intermediate index).

### Rule: sums and powers of integers
1. The sum of n integers: sum_{i=1}^{n} i = 1 + 2 + ... + n = n(n+1)/2.
2. The sum of consecutive integers squared: sum_{i=1}^{n} i^2 = 1^2 + 2^2 + ... + n^2 = n(n+1)(2n+1)/6.
3. The sum of consecutive integers cubed: sum_{i=1}^{n} i^3 = 1^3 + 2^3 + ... + n^3 = n^2(n+1)^2/4.

**EXAMPLE 5.2 (Evaluation Using Sigma Notation).** Write using sigma notation and evaluate:
a. The sum of the terms (i-3)^2 for i = 1, 2, ..., 200.
b. The sum of the terms (i^3 - i^2) for i = 1, 2, 3, 4, 5, 6.

Solution:
a. Multiplying out (i-3)^2 = i^2 - 6i + 9 and applying the sum, difference, and constant-multiple rules:
sum_{i=1}^{200} (i-3)^2 = sum_{i=1}^{200} i^2 - 6*sum_{i=1}^{200} i + sum_{i=1}^{200} 9. Using the power formulas,
sum_{i=1}^{200} i^2 = 200(201)(401)/6 = 2,686,700 and sum_{i=1}^{200} i = 200(201)/2 = 20,100, so the total is
2,686,700 - 6(20,100) + 9(200) = 2,686,700 - 120,600 + 1,800 = 2,567,900.
b. Using the difference rule and the squared/cubed formulas with n=6: sum_{i=1}^{6} (i^3-i^2) =
sum_{i=1}^{6} i^3 - sum_{i=1}^{6} i^2 = 6^2(7)^2/4 - 6(7)(13)/6 = 1764/4 - 546/6 = 441 - 91 = 350.

### Approximating area with rectangles
Let f(x) be a continuous, nonnegative function defined on a closed interval [a,b]; we want to approximate the
area A bounded above by f(x), below by the x-axis, on the left by the line x=a, and on the right by x=b. This
section restricts attention to continuous, nonnegative f(x); net signed area, where a region below the x-axis
would count as negative, is not introduced in this section (it is taken up in the section that follows, on the
definite integral).

To approximate A, divide [a,b] into n subintervals of equal width by choosing equally spaced points
x_0, x_1, x_2, ..., x_n with x_0 = a and x_n = b, so x_i - x_(i-1) = (b-a)/n for i = 1, 2, ..., n. The common
subinterval width is denoted Delta x, so Delta x = (b-a)/n and x_i = x_0 + i*Delta x.

### Definition: partition and regular partition
A set of points P = {x_i} for i = 0, 1, 2, ..., n with a = x_0 < x_1 < x_2 < ... < x_n = b, which divides [a,b]
into subintervals [x_0,x_1], [x_1,x_2], ..., [x_(n-1),x_n], is called a partition of [a,b]. If all the
subintervals have the same width, the set of points forms a regular partition of [a,b].

### Rule: left-endpoint approximation
On each subinterval [x_(i-1), x_i] (for i = 1, 2, ..., n), construct a rectangle with width Delta x and height
f(x_(i-1)), the function value at the left endpoint. The area of this rectangle is f(x_(i-1))*Delta x. Summing
the rectangle areas gives the left-endpoint approximation of A, denoted L_n:
A is approximately L_n = sum_{i=1}^{n} f(x_(i-1)) * Delta x.

### Rule: right-endpoint approximation
Construct a rectangle on each subinterval [x_(i-1), x_i], but with height f(x_i), the function value at the
right endpoint. The area of each rectangle is f(x_i)*Delta x, and the right-endpoint approximation is denoted
R_n: A is approximately R_n = sum_{i=1}^{n} f(x_i) * Delta x.

**EXAMPLE 5.4 (Approximating the Area Under a Curve).** Use both left-endpoint and right-endpoint
approximations to approximate the area under f(x) = x^2 on [0,2]; use n = 4.

Solution: Delta x = (2-0)/4 = 0.5, giving subintervals [0,0.5], [0.5,1], [1,1.5], [1.5,2]. The needed function
values are f(0)=0, f(0.5)=0.25, f(1)=1, f(1.5)=2.25, f(2)=4.
Left-endpoint: L_4 = 0.5*[f(0)+f(0.5)+f(1)+f(1.5)] = 0.5*[0+0.25+1+2.25] = 0.5*3.5 = 1.75.
Right-endpoint: R_4 = 0.5*[f(0.5)+f(1)+f(1.5)+f(2)] = 0.5*[0.25+1+2.25+4] = 0.5*7.5 = 3.75.
The left-endpoint approximation (1.75) underestimates and the right-endpoint approximation (3.75) overestimates,
since f(x) = x^2 is increasing on [0,2].

### Convergence as n increases
Using more, thinner rectangles improves the approximation. For f(x) = (x-1)^3 + 4 on [0,2] (whose exact area is
8 square units), left- and right-endpoint approximations at increasing n converge toward 8 from opposite sides:
at n=4, L_4 = 7.5 and R_4 = 8.5; at n=8, L_8 = 7.75 and R_8 = 8.25; at n=32, L_32 = 7.9375 and R_32 = 8.0625.
As n grows, both approximations approach the same value, which motivates defining the exact area as a limit.

### Forming Riemann sums
There is no need to evaluate f only at a left or right endpoint. On each subinterval [x_(i-1), x_i], f may be
evaluated at any point x_i*, using f(x_i*) as the rectangle's height. This gives the estimate
A is approximately sum_{i=1}^{n} f(x_i*) * Delta x, called a Riemann sum, named for Bernhard Riemann.

### Definition: Riemann sum
Let f(x) be defined on a closed interval [a,b] and let P be a regular partition of [a,b] with subinterval width
Delta x. For each i let x_i* be any point in [x_(i-1), x_i]. A Riemann sum for f(x) is defined as
sum_{i=1}^{n} f(x_i*) * Delta x.

### Definition: area under the curve as a limit
Let f(x) be a continuous, nonnegative function on [a,b], and let sum_{i=1}^{n} f(x_i*) * Delta x be a Riemann
sum for f(x). The area under the curve y = f(x) on [a,b] is given by
A = the limit, as n approaches infinity, of sum_{i=1}^{n} f(x_i*) * Delta x.
If f(x) is continuous on [a,b], this limit exists and is unique: it does not depend on the choice of the points
x_i*.

### Upper sums and lower sums
Although any choice of {x_i*} gives an estimate of the area, it is not automatically known whether the estimate
is too high or too low. Choosing each x_i* so that f(x_i*) is the maximum value of f on [x_(i-1), x_i] for every
i produces an upper sum (a guaranteed overestimate). Choosing each x_i* so that f(x_i*) is the minimum value of
f on [x_(i-1), x_i] for every i produces a lower sum (a guaranteed underestimate). If f is either increasing or
decreasing throughout [a,b], the maximum and minimum values on each subinterval occur at its endpoints, so the
upper and lower sums coincide with the left- and right-endpoint approximations (whichever endpoint corresponds
to the larger, respectively smaller, function value).

**EXAMPLE 5.5 (Finding a Lower Sum).** Find a lower sum for f(x) = 10 - x^2 on [1,2]; let n = 4 subintervals.

Solution: Delta x = (2-1)/4 = 0.25, giving subintervals [1,1.25], [1.25,1.5], [1.5,1.75], [1.75,2]. Because
f(x) = 10 - x^2 is decreasing on [1,2], the minimum value on each subinterval occurs at its right endpoint, so
the lower sum is obtained using right endpoints: f(1.25) = 10 - 1.5625 = 8.4375, f(1.5) = 10 - 2.25 = 7.75,
f(1.75) = 10 - 3.0625 = 6.9375, f(2) = 10 - 4 = 6. The lower sum is
0.25*[8.4375 + 7.75 + 6.9375 + 6] = 0.25*29.125 = 7.28125, which is an underestimate of the true area.

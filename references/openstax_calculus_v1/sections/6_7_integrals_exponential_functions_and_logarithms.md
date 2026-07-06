# OpenStax Calculus Volume 1, Section 6.7: Integrals, Exponential Functions, and Logarithms

## Learning Objectives
- Write the definition of the natural logarithm as an integral.
- Recognize the derivative of the natural logarithm.
- Integrate functions involving the natural logarithmic function.
- Define the number e through an integral.
- Recognize the derivative and integral of the exponential function.
- Prove properties of logarithms and exponential functions using integrals.
- Express general logarithmic and exponential functions in terms of natural logarithms and exponentials.

## Topic Keywords
- natural logarithm
- integral definition of ln
- derivative of natural logarithm
- properties of logarithms
- definition of e
- exponential function
- general exponential function
- general logarithm
- change of base formula

## Content

Exponential functions and logarithms were introduced informally in earlier chapters, but two things were left
incomplete: exponential functions with irrational exponents were never rigorously defined, and the number e
itself was never rigorously defined. This section fixes both gaps using integration tools. For the purposes of
this section, treat the natural logarithm, the number e, and all associated differentiation and integration
formulas as not yet defined, even though they are consistent with the informal versions seen earlier.

DISCLOSED OVERRUN: this file exceeds the 150-line soft target because the section is unusually theorem-dense,
containing seven numbered theorems (6.15 through 6.21), four definition boxes (ln, e, e^x, and general a^x), and
two multi-part proofs, all of which must be stated in full; condensing further would have dropped required
theorem content. The example count (3) stays within the default.

### The Natural Logarithm as an Integral

Recall the power rule for integrals: the integral of x^n dx = x^(n+1)/(n+1) + C, for n not equal to -1. This
rule clearly fails when n = -1, since it would force division by zero. So the question becomes: what do we do
with the integral of (1/x) dx? By the Fundamental Theorem of Calculus, the integral from 1 to x of (1/t) dt is
an antiderivative of 1/x. This motivates the following definition.

### Definition: The Natural Logarithm
For x > 0, define the natural logarithm function by
ln(x) = the integral from 1 to x of (1/t) dt. (this is equation 6.24 in the text)

For x > 1, ln(x) is just the area under the curve y = 1/t from t = 1 to t = x. For 0 < x < 1, the integral from
1 to x of (1/t) dt equals the negative of the integral from x to 1 of (1/t) dt, so in this case ln(x) is the
negative of the area under the curve from t = x to t = 1 (it is negative, since x < 1 there). Notice that
ln(1) = 0. Furthermore, y = 1/t > 0 for t > 0, so by the properties of integrals, ln(x) is increasing for x > 0.

### Theorem 6.15 (Derivative of the Natural Logarithm)
For x > 0, the derivative of the natural logarithm is given by
d/dx ln(x) = 1/x.

This falls out immediately from the Fundamental Theorem of Calculus, given how ln(x) was defined.

### Theorem 6.16 (Corollary to the Derivative of the Natural Logarithm)
The function ln(x) is differentiable; therefore, it is continuous.

A graph of ln(x) is continuous throughout its domain of (0, infinity): it decreases without bound as x
approaches 0 from the right, passes through (1, 0), and increases without bound (but ever more slowly) as x
grows.

Note that if we use the absolute value function and form a new function ln|x|, we can extend the domain of the
natural logarithm to include x < 0. Then d/dx ln|x| = 1/x. This gives rise to the following familiar
integration formula.

### Theorem 6.17 (Integral of (1/u) du)
The natural logarithm is the antiderivative of the function f(u) = 1/u:
the integral of (1/u) du = ln|u| + C.

**EXAMPLE 6.36 (Calculating Integrals Involving Natural Logarithms).** Calculate the integral of x/(x^2 + 4) dx.

Solution: Using u-substitution, let u = x^2 + 4. Then du = 2x dx, and we have
the integral of x/(x^2 + 4) dx = (1/2) the integral of (1/u) du = (1/2) ln|u| + C = (1/2) ln|x^2 + 4| + C
= (1/2) ln(x^2 + 4) + C, dropping the absolute value bars since x^2 + 4 > 0 for every x.
[Recomputed independently: with u = x^2 + 4, the integral matches the book's answer exactly, (1/2) ln(x^2+4)+C.]

Although this function has been called a "logarithm," none of the familiar logarithm properties have actually
been proved for it yet from this integral definition. That is done next.

### Theorem 6.18 (Properties of the Natural Logarithm)
If a, b > 0 and r is a rational number, then:
i. ln(1) = 0
ii. ln(ab) = ln(a) + ln(b)
iii. ln(a/b) = ln(a) - ln(b)
iv. ln(a^r) = r ln(a)

Proof (as given in the text):
i. By definition, ln(1) = the integral from 1 to 1 of (1/t) dt = 0.
ii. ln(ab) = the integral from 1 to ab of (1/t) dt = the integral from 1 to a of (1/t) dt
   + the integral from a to ab of (1/t) dt. Apply the substitution u = t/a to the last integral: du = (1/a) dt;
   when t = a, u = 1, and when t = ab, u = b. This turns the last integral into the integral from 1 to b of
   (1/u) du = ln(b). So ln(ab) = ln(a) + ln(b).
iv. Note that d/dx ln(x^r) = r x^(r-1)/x^r = r/x, and also d/dx (r ln(x)) = r/x. Since these two functions have
   the same derivative, they differ by a constant: ln(x^r) = r ln(x) + C for some constant C. Setting x = 1
   gives ln(1^r) = r ln(1) + C, i.e. 0 = r(0) + C, so C = 0. Thus ln(x^r) = r ln(x). [Note: this argument
   establishes the property for rational r only; the text extends it to irrational r later in the section, once
   e^x has been properly defined.]
Part iii follows from parts ii and iv together; the text leaves the actual derivation to the reader rather than
spelling it out (informally: write a/b as a times b^(-1) and combine ii and iv).

### Defining the Number e

Now that the natural logarithm is defined, it can be used to define the number e.

### Definition: The Number e
The number e is defined to be the real number such that ln(e) = 1.

Equivalently, the area under the curve y = 1/t between t = 1 and t = e is exactly 1. The text leaves the proof
that such a number exists and is unique as an exercise (hint given in the book: use the Intermediate Value
Theorem for existence, and the fact that ln(x) is increasing for uniqueness). The number e can be shown to be
irrational, though the text does not do so in this section (it is shown via a Taylor/Maclaurin series argument
in the Volume 2 Student Project material, which is cross-referenced but not reproduced here). Its approximate
value is e is approximately 2.71828182846 (a rounded decimal; the true value continues 2.718281828459045...).

### The Exponential Function

Since ln(x) is one-to-one, it has an inverse function, temporarily denoted exp(x), satisfying
exp(ln(x)) = x for x > 0, and ln(exp(x)) = x for all x.

The natural hypothesis is that exp(x) = e^x. For rational x this is easy to confirm: ln(e^x) = x ln(e) = x (by
property iv of Theorem 6.18, using the rational exponent x), so e^x = exp(x) whenever x is rational. For
irrational x, e^x has no prior meaning, so it is simply defined to be exp(x), the inverse function of ln(x).

### Definition: The Natural Exponential Function
For any real number x, define y = e^x to be the number for which
ln(y) = ln(e^x) = x. (equation 6.25 in the text)

Consequently e^x = exp(x) for all x, and
e^(ln(x)) = x for x > 0, and ln(e^x) = x for all x. (equation 6.26 in the text)

### Theorem 6.19 (Properties of the Exponential Function)
If p and q are any real numbers and r is a rational number, then:
i. e^p e^q = e^(p+q)
ii. e^p / e^q = e^(p-q)
iii. (e^p)^r = e^(pr)

Proof (as given in the text): if p and q are rational, the properties hold automatically from ordinary exponent
rules. If p or q is irrational, the inverse-function definition of e^x must be used instead. Only property i is
proved in the text (the other two are explicitly left to the reader): ln(e^p e^q) = ln(e^p) + ln(e^q) = p + q
= ln(e^(p+q)), using property ii of the natural logarithm; since ln(x) is one-to-one, e^p e^q = e^(p+q). The
text notes that, as with property iv of the logarithm, property iii here is extended to irrational values of r
later in the section (once general exponentials a^x have been defined for all real exponents).

To find the derivative of y = e^x, differentiate ln(y) = x implicitly with respect to x:
(1/y)(dy/dx) = 1, so dy/dx = y. Thus d/dx e^x = e^x, which leads immediately to the integration formula
the integral of e^x dx = e^x + C.

**EXAMPLE 6.39 (Using Properties of Exponential Functions).** Evaluate the integral of 2x e^(-x^2) dx.

Solution: Using u-substitution, let u = -x^2. Then du = -2x dx, and we have
the integral of 2x e^(-x^2) dx = -(the integral of e^u du) = -e^u + C = -e^(-x^2) + C.
[Recomputed independently: differentiating -e^(-x^2)+C gives -e^(-x^2) * (-2x) = 2x e^(-x^2), confirming the
book's answer.]

### General Logarithmic and Exponential Functions

The section closes by treating exponential functions and logarithms with bases other than e. A general
exponential function has the form f(x) = a^x, but without further work there is still no rigorous meaning for
a^x at irrational exponents unless a = e. This is fixed by defining f(x) = a^x in terms of the already-rigorous
function e^x.

### Definition: General Exponential Functions
For any a > 0, and for any real number x, define y = a^x as follows:
y = a^x = e^(x ln(a)).

This makes a^x rigorously defined for all real x, and it also lets the earlier property iv of logarithms and
property iii of exponential functions be generalized to hold for both rational and irrational values of r; the
text states that it is straightforward (though not shown in full) that the usual laws of exponents hold for
general exponential functions defined this way.

Differentiating this definition gives the differentiation formula for a^x:
d/dx a^x = d/dx e^(x ln(a)) = e^(x ln(a)) ln(a) = a^x ln(a).
The corresponding integration formula follows immediately.

### Theorem 6.20 (Derivatives and Integrals Involving General Exponential Functions)
Let a > 0. Then:
d/dx a^x = a^x ln(a), and
the integral of a^x dx = (1/ln(a)) a^x + C.

**EXAMPLE 6.41 (Integrating General Exponential Functions).** Evaluate the integral of 3/2^(3x) dx.

Solution: Using u-substitution, let u = -3x. Then du = -3 dx, and we have
the integral of 3/2^(3x) dx = the integral of 3 * 2^(-3x) dx = -(the integral of 2^u du)
= -(1/ln(2)) 2^u + C = -(1/ln(2)) 2^(-3x) + C.
[Recomputed independently: differentiating -(1/ln(2)) 2^(-3x)+C gives -(1/ln(2)) * 2^(-3x) * ln(2) * (-3)
= 3 * 2^(-3x), matching the integrand 3/2^(3x). Confirmed correct.]
[Note: this example's full worked solution spans the page break between the two source pages in the scanned
PDF; the final line was confirmed on the page immediately preceding the section's exercises and is included
here in full, with nothing from the exercises themselves transcribed.]

If a is not equal to 1, then a^x is one-to-one and has a well-defined inverse, denoted log_a(x):
y = log_a(x) if and only if x = a^y.

General logarithms can be rewritten in terms of the natural logarithm. Let y = log_a(x), so x = a^y. Taking the
natural logarithm of both sides: ln(x) = ln(a^y) = y ln(a), so y = ln(x)/ln(a). Thus
log_a(x) = ln(x)/ln(a),
which shows that all logarithmic functions are constant multiples of one another (this is the change-of-base
relationship). Differentiating y = log_a(x) = ln(x)/ln(a) with respect to x gives
dy/dx = (1/ln(a)) d/dx ln(x) = (1/ln(a))(1/x) = 1/(x ln(a)).

### Theorem 6.21 (Derivatives of General Logarithm Functions)
Let a > 0. Then:
d/dx log_a(x) = 1/(x ln(a)).
[Note: the text gives only this derivative formula for general logarithms in this section; no separate
integral formula for the integral of log_a(x) dx is stated here, so none is invented for this file.]

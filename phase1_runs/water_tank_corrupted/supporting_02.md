# Calculus Volume 1 (Strang/Herman) Sec 5.3: The Fundamental Theorem of Calculus

**OER:** Calculus Volume 1 (Gilbert Strang and Edwin "Jed" Herman, CC BY-NC-SA 4.0)
**Source:** https://openstax.org/books/calculus-volume-1
**License:** Creative Commons Attribution Non-Commercial ShareAlike 4.0 International License (CC BY-NC-SA 4.0)
**Attribution required:** Access for free at openstax.org.

## Section Outcomes / Learning Objectives
- Describe the meaning of the Mean Value Theorem for Integrals.
- State the meaning of the Fundamental Theorem of Calculus, Part 1.
- Use the Fundamental Theorem of Calculus, Part 1, to evaluate derivatives of integrals.
- State the meaning of the Fundamental Theorem of Calculus, Part 2.
- Use the Fundamental Theorem of Calculus, Part 2, to evaluate definite integrals.
- Explain the relationship between differentiation and integration.

## Section Topics
- mean value theorem for integrals
- average value of a function
- fundamental theorem of calculus part 1
- fundamental theorem of calculus part 2
- evaluation theorem
- variable upper limit of integration
- chain rule with integrals
- net signed area

## Content

This section develops the two-part Fundamental Theorem of Calculus, which lets a definite integral be evaluated directly from an antiderivative rather than from Riemann sums or geometric area formulas, and states the closely related Mean Value Theorem for Integrals.

#### thm 1: Mean Value Theorem for Integrals {#openstax_calc1-5.3-thm-1}
If $f$ is continuous over $[a,b]$, there is at least one point $c$ in $[a,b]$ such that
$$f(c) = \frac{1}{b-a}\int_a^b f(x)\,dx,$$
i.e. $\int_a^b f(x)\,dx = f(c)(b-a)$. The quantity $\frac{1}{b-a}\int_a^b f(x)\,dx$ is called the average value of $f$ over $[a,b]$: it is the single constant rate that, held for the whole interval, would produce the same net change as the actual (possibly non-constant) rate $f$. The average value of a continuous function over $[a,b]$ lies between its minimum and its maximum on $[a,b]$, and equals its peak value only when $f$ is constant (or coincides with its peak densely enough to average out to it); in general the average value of a non-constant function is strictly less than its maximum.

#### ex 1: Finding the Average Value of a Function {#openstax_calc1-5.3-ex-1}
Problem: find the average value of $f(x) = 8-2x$ over $[0,4]$, and a point $c$ where $f(c)$ equals it.

Solution: the region under $f$ on $[0,4]$ is a right triangle of base 4 and height 8, so $\int_0^4 (8-2x)\,dx = \frac{1}{2}(4)(8)=16$; the average value is $\frac{1}{4}(16)=4$. Setting $f(c)=4$: $8-2c=4$ gives $c=2$, and indeed $f(2)=4$.

#### thm 2: Fundamental Theorem of Calculus, Part 2 (the Evaluation Theorem) {#openstax_calc1-5.3-thm-2}
If $f$ is continuous over $[a,b]$ and $F$ is any antiderivative of $f$, then
$$\int_a^b f(x)\,dx = F(b) - F(a),$$
written $F(x)\big|_a^b$. Any antiderivative of $f$ works, because the "+C" terms of two antiderivatives of the same $f$ always cancel in the subtraction $F(b)-F(a)$, so it is conventional to drop the "+C" when evaluating a definite integral this way.

#### ex 2: Evaluating an Integral with the Fundamental Theorem of Calculus {#openstax_calc1-5.3-ex-2}
Problem: evaluate $\int_{-2}^{2} (t^2-4)\,dt$ using the evaluation theorem.

Solution: an antiderivative of $t^2-4$ is $t^3/3-4t$, so
$$\int_{-2}^{2}(t^2-4)\,dt = \left(\frac{t^3}{3}-4t\right)\bigg|_{-2}^{2} = \left(\frac{8}{3}-8\right)-\left(\frac{-8}{3}+8\right) = \frac{16}{3}-16 = -\frac{32}{3}.$$
The "+C" was omitted because, by the evaluation theorem, any antiderivative gives the same result.

# Kuttler §1.2: Systems of Equations, Algebraic Procedures

**OER:** A First Course in Linear Algebra (Ken Kuttler, CC BY 4.0)
**Source:** https://math.libretexts.org/Bookshelves/Linear_Algebra/A_First_Course_in_Linear_Algebra_(Kuttler)/01%3A_Systems_of_Equations/1.02%3A_Elementary_Operations
**License:** CC BY 4.0 - https://creativecommons.org/licenses/by/4.0/
**Attribution required:** "A First Course in Linear Algebra" by Ken Kuttler, used under CC BY 4.0.

## Section Outcomes / Learning Objectives
- Use elementary operations to find the solution to a linear system of equations.
- Find the row-echelon form and reduced row-echelon form of a matrix.
- Determine whether a system of linear equations has no solution, a unique solution or an infinite number of solutions.
- Solve a system of equations using Gaussian Elimination and Gauss-Jordan Elimination.
- Model a physical system with linear equations and then solve.

## Section Topics
- elementary operations
- augmented matrix
- row operations
- consistent system

## Content

## Algebraic Procedures


We have taken an in depth look at graphical representations of systems of equations, as well as how to find possible solutions graphically. Our attention now turns to working with systems algebraically.

#### Definition 1.2.1: System of Linear Equations {#kuttler-1.2-def-1}
A **system of linear equations** is a list of equations, 
$$\begin{array}{c} a_{11}x_{1}+a_{12}x_{2}+\cdots +a_{1n}x_{n}=b_{1} \\ a_{21}x_{1}+a_{22}x_{2}+\cdots +a_{2n}x_{n}=b_{2} \\ \vdots \\ a_{m1}x_{1}+a_{m2}x_{2}+\cdots +a_{mn}x_{n}=b_{m} \end{array}$$
 where $a_{ij}$ and $b_{j}$ are real numbers. The above is a system of $m$ equations in the $n$ variables, $x_{1},x_{2}\cdots ,x_{n}$. We can also call $a_{ij}$ and $b_{j}$ **scalars**.

#### Definition 1.2.2: Homogeneous System of Equations {#kuttler-1.2-def-2}
A system of equations is called **homogeneous** if each equation in the system is equal to 0. A homogeneous system has the form 
$$\begin{array}{c} a_{11}x_{1}+a_{12}x_{2}+\cdots +a_{1n}x_{n}= 0 \\ \vdots \\ a_{m1}x_{1}+a_{m2}x_{2}+\cdots +a_{mn}x_{n}= 0 \end{array} $$


#### Definition 1.2.3: Consistent and Inconsistent Systems {#kuttler-1.2-def-3}
A system of linear equations is called **consistent** if there exists at least one solution. It is called **inconsistent** if there is no solution.

### Elementary Operations

#### Example 1.2.1: Verifying an Ordered Pair is a Solution {#kuttler-1.2-ex-1}
Algebraically verify that $(x, y) = (-1, 4)$ is a solution to 
$$\begin{array}{c} x+y=3 \\ y-x=5 \end{array} $$


###### Solution

Substituting: $x+y = -1+4 = 3$ and $y-x = 4-(-1) = 5$. Both check, so $(-1,4)$ is a solution.

#### Definition 1.2.4: Elementary Operations {#kuttler-1.2-def-4}
**Elementary operations** consist of: 1. Interchange the order of equations. 2. Multiply any equation by a nonzero number. 3. Replace any equation with itself plus a multiple of another. None changes the solution set.

#### Example 1.2.2: Effects of an Elementary Operation {#kuttler-1.2-ex-2}
Show $\{x+y=7, 2x-y=8\}$ has the same solution as $\{x+y=7, -3y=-6\}$.

###### Solution

Adding $-2$ times the first equation to the second: $2x-y -2(x+y) = 8-14 \Rightarrow -3y = -6$. Both systems have the unique solution $(5,2)$.

#### Theorem 1.2.1: Elementary Operations and Solutions {#kuttler-1.2-thm-1}
For a system $\{E_1=b_1, E_2=b_2\}$, applying any of the three elementary operations yields a system with the same solution set.

#### Example 1.2.3: Solving a System of Equations with Elementary Operations {#kuttler-1.2-ex-3}
Find the solutions to 
$$\begin{array}{c} x+3y+6z=25 \\ 2x+7y+14z=58 \\ 2y+5z=19 \end{array} $$


###### Solution

Replace second equation with $(-2)\cdot E_1 + E_2$: gives $y+2z=8$. Replace third with $(-2)\cdot E_2 + E_3$: gives $z=3$. Back-substitute: $y = 8-6 = 2$, $x = 25 - 6 - 18 = 1$. Solution $(x,y,z) = (1,2,3)$.

## Common Pitfalls and Tips

- Confusing rows and columns: matrix dimensions and entry indexing always come row-first ($a_{ij}$ is row $i$, column $j$).
- Forgetting that matrix multiplication is not commutative: $AB$ and $BA$ are different in general (and may not even be defined together).
- Sign errors in cofactor expansion: don't forget the $(-1)^{i+j}$ factor.
- Misreading determinants: only square matrices have determinants.
- For procedures: write out the row operations explicitly before computing — silent shortcuts cause errors.
- For exercises: always check by substituting your answer back into the original problem statement.

## Further Reading

- The corresponding chapter in *A First Course in Linear Algebra* by Ken Kuttler.
- Lay, Lay, McDonald, *Linear Algebra and Its Applications* (for an alternate exposition).
- Strang, *Introduction to Linear Algebra* (especially for geometric intuition).
- LibreTexts and Lyryx provide free, openly-licensed alternatives.

## Quick Self-Check

- Can you state the central definition(s) of this section?
- Can you reproduce the worked example from memory?
- Can you identify which sections must precede this one as prerequisites?
- Can you connect this section's concepts to applied problems from the chapter's application sections?

## Cross-Reference Index

This section is referenced from:
- The chapter-end Exercises page (see book map).
- Subsequent sections that use these definitions and theorems.

Definitions and theorems from this section may be invoked in later chapters as foundational results. Consult the master book map (`books/first_course_linear_algebra_kuttler.json`) for prerequisite/follow-up structure.

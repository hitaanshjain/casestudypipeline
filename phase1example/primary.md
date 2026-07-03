# Kuttler §1.3: Gaussian Elimination

**OER:** A First Course in Linear Algebra (Ken Kuttler, CC BY 4.0)
**Source:** https://math.libretexts.org/Bookshelves/Linear_Algebra/A_First_Course_in_Linear_Algebra_(Kuttler)/01%3A_Systems_of_Equations/1.03%3A_Gaussian_Elimination
**License:** CC BY 4.0 - https://creativecommons.org/licenses/by/4.0/
**Attribution required:** "A First Course in Linear Algebra" by Ken Kuttler, used under CC BY 4.0.

## Section Outcomes / Learning Objectives
- Use Gaussian Elimination to solve systems of linear equations.
- Identify a matrix in row-echelon and reduced row-echelon form.
- Find the rank of a matrix.

## Section Topics
- Gaussian elimination
- Gauss-Jordan elimination
- row-echelon form
- reduced row-echelon form
- leading entry
- pivot

## Content

In this section, we explore a less cumbersome way to find solutions: using the **augmented matrix**. A **matrix** is a rectangular array of numbers, of size $m\times n$.

For example, the system 
$$\begin{array}{c} x+3y+6z=25 \\ 2x+7y+14z=58 \\ 2y+5z=19 \end{array} $$
 becomes 
$$\left[ \begin{array}{rrr|r} 1 & 3 & 6 & 25 \\ 2 & 7 & 14 & 58 \\ 0 & 2 & 5 & 19 \end{array} \right] $$


#### Definition 1.3.1: Augmented Matrix of a Linear System {#kuttler-1.3-def-1}
For a system $\sum a_{ij}x_j = b_i$, the **augmented matrix** is $[a_{ij}\,|\,b_i]$.

#### Definition 1.3.2: Elementary Row Operations {#kuttler-1.3-def-2}
The **elementary row operations** are: 1. Switch two rows. 2. Multiply a row by a nonzero number. 3. Replace a row by any multiple of another row added to it.

#### Definition 1.3.3: Row-Echelon Form {#kuttler-1.3-def-3}
A matrix is in **row-echelon form** if (1) all nonzero rows are above any zero rows; (2) each leading entry is in a column to the right of leading entries above; (3) each leading entry is 1.

#### Definition 1.3.4: Reduced Row-Echelon Form {#kuttler-1.3-def-4}
A matrix is in **reduced row-echelon form** if it is in row-echelon form and (4) all entries above and below a leading entry are zero.

#### Example 1.3.1: Not in Row-Echelon Form {#kuttler-1.3-ex-1}
Examples of matrices NOT in row-echelon form (zero row not at bottom; missing leading 1; etc.).

#### Example 1.3.2: Matrices in Row-Echelon Form {#kuttler-1.3-ex-2}
Examples in row-echelon but not reduced form.

#### Example 1.3.3: Matrices in Reduced Row-Echelon Form {#kuttler-1.3-ex-3}
Examples in reduced row-echelon form.

#### Definition 1.3.5: Pivot Position and Pivot Column {#kuttler-1.3-def-5}
A **pivot position** is the location of a leading entry in row-echelon form. A **pivot column** contains a pivot position.

#### Example 1.3.4: Pivot Position {#kuttler-1.3-ex-4}
Let 
$$A=\left[ \begin{array}{rrr|r} 1 & 2 & 3 & 4 \\ 3 & 2 & 1 & 6 \\ 4 & 4 & 4 & 10 \end{array} \right] $$
 Identify pivot positions and columns.

###### Solution

Row-echelon form has leading 1s in row 1 col 1 and row 2 col 2. Pivot positions: $(1,1)$ and $(2,2)$. Pivot columns: 1 and 2.

#### Algorithm 1.3.1: Reduced Row-Echelon Form Algorithm {#kuttler-1.3-proc-1}
1. Find the first nonzero column; this is the first pivot column. Swap if needed to put a nonzero in the pivot position. 2. Use row operations to make entries below the pivot zero. 3. Repeat for the submatrix excluding the row with the first pivot. 4. Divide each nonzero row by its leading entry to make it 1. 5. Working right-to-left, create zeros above each pivot.

#### Example 1.3.5: Finding Row-Echelon and Reduced Row-Echelon Form {#kuttler-1.3-ex-5}
Reduce 
$$A = \left[ \begin{array}{rrr} 0 & -5 & -4 \\ 1 & 4 & 3 \\ 5 & 10 & 7 \end{array} \right] $$
 to row-echelon and reduced row-echelon form.

###### Solution

After applying the algorithm, RREF is 
$$\left[ \begin{array}{rrr} 1 & 0 & -1/5 \\ 0 & 1 & 4/5 \\ 0 & 0 & 0 \end{array} \right] $$


#### Example 1.3.6: Finding the Solution to a System {#kuttler-1.3-ex-6}
Solve 
$$\begin{array}{c} 2x+4y-3z=-1\\ 5x+10y-7z=-2\\ 3x+6y+5z=9 \end{array} $$


###### Solution

Augmented matrix row-reduces to a row $[0, 0, 0 \mid 20]$, which is impossible. The system is **inconsistent**, no solution.

#### Example 1.3.7: An Infinite Set of Solutions {#kuttler-1.3-ex-7}
Solve 
$$\begin{array}{c} 3x-y-5z=9 \\ y-10z=0 \\ -2x+y=-6 \end{array} $$


###### Solution

RREF gives $x = 3+5z$, $y = 10z$, $z=t$. Infinite family parameterized by $t$.

#### Example 1.3.8: A Two Parameter Set of Solutions {#kuttler-1.3-ex-8}
Solve 
$$\begin{array}{c} x+2y-z+w=3 \\ x+y-z+w=1 \\ x+3y-z+w=5 \end{array} $$


###### Solution

RREF gives $y = 2$ and $x = -1 + z - w$. Letting $z=s, w=t$: $\mathbf{x} = (-1+s-t, 2, s, t)^T$. Two-parameter family.

The process of going to row-echelon form and back-substituting is **Gaussian Elimination**. Going all the way to reduced row-echelon form is **Gauss-Jordan Elimination**.

# Austin §1.4: Pivots and their influence on solution spaces

**OER:** Understanding Linear Algebra (David Austin, CC BY 4.0)
**Source:** https://understandinglinearalgebra.org/sec-pivots.html
**Crawled:** 20260427
**License:** CC BY 4.0 - https://creativecommons.org/licenses/by/4.0/
**Attribution required:** "Understanding Linear Algebra" by David Austin, used under CC BY 4.0.

## Section Learning Objectives
- A linear system is inconsistent exactly when a pivot position appears in the rightmost column of the augmented matrix.
- If a linear system is consistent, the solution is unique when every column of the coefficient matrix contains a pivot position. There are infinitely many solutions when there is a column of the coefficient matrix without a pivot position.
- If a linear system is consistent, the columns of the coefficient matrix containing pivot positions correspond to basic variables and the columns without pivot positions correspond to free variables.
- infinitely many solutions
- one and only one solution
- no solution

## Section Topics
- row-echelon, rref, pivot, linear-system

## Introduction

By now, we have seen several examples illustrating how the reduced row echelon matrix leads to a convenient description of the solution space to a linear system. In this section, we will use this understanding to make some general observations about how certain features of the reduced row echelon matrix reflect the nature of the solution space.

Remember that a leading entry in a reduced row echelon matrix is the leftmost nonzero entry in a row of the matrix. As we'll see, the positions of these leading entries encode a lot of information about the solution space of the corresponding linear system. For this reason, we make the following definition.

pivot position A **pivot position** in a matrix $A$ is the position of a leading entry in the reduced row echelon matrix of $A$.

For instance, in this reduced row echelon matrix, the pivot positions are indicated in bold: $$ \begin{bmatrix} {\mathbf 1} & \gray{0} & \gray{*} & \gray{0} \\ \gray{0} & {\mathbf 1} & \gray{*} & \gray{0} \\ \gray{0} & \gray{0} & \gray{0} & {\mathbf 1} \\ \gray{0} & \gray{0} & \gray{0} & \gray{0} \\ \end{bmatrix}. $$ We can refer to pivot positions by their row and column number saying, for instance, that there is a pivot position in the third row and fourth column.

Shown below is a matrix and its reduced row echelon form. Indicate the pivot positions. $$ \left[ \begin{array}{rrrr} 2 & 4 & 6 & -1 \\ -3 & 1 & 5 & 0 \\ 1 & 3 & 5 & 1 \\ \end{array} \right] \sim \left[ \begin{array}{rrrr} 1 & 0 & -1 & 0 \\ 0 & 1 & 2 & 0 \\ 0 & 0 & 0 & 1 \\ \end{array} \right] $$ . *Solution.* The pivot positions are indicated below $$ \left[ \begin{array}{rrrr} {\mathbf 2} & 4 & 6 & -1 \\ -3 & {\mathbf 1} & 5 & 0 \\ 1 & 3 & 5 & {\mathbf 1} \\ \end{array} \right] \sim \left[ \begin{array}{rrrr} {\mathbf 1} & 0 & -1 & 0 \\ 0 & {\mathbf 1} & 2 & 0 \\ 0 & 0 & 0 & {\mathbf 1} \\ \end{array} \right]\text{.} $$ *Answer.* The pivot positions are indicated below $$ \left[ \begin{array}{rrrr} {\mathbf 2} & 4 & 6 & -1 \\ -3 & {\mathbf 1} & 5 & 0 \\ 1 & 3 & 5 & {\mathbf 1} \\ \end{array} \right] \sim \left[ \begin{array}{rrrr} {\mathbf 1} & 0 & -1 & 0 \\ 0 & {\mathbf 1} & 2 & 0 \\ 0 & 0 & 0 & {\mathbf 1} \\ \end{array} \right]\text{.} $$ How many pivot positions can there be in one row? In a $3\times5$ matrix, what is the largest possible number of pivot positions? Give an example of a $3\times5$ matrix that has the largest possible number of pivot positions. *Solution.* A row contains at most one pivot position. Therefore, a $3\times 5$ matrix, which has three rows, contains at most three pivot positions. Here is an example: $$ \left[\begin{array}{rrrrr} 1 & 0 & 0 & -1 & 2 \\ 0 & 1 & 0 & 1 & 3 \\ 0 & 0 & 1 & 2 & 3 \\ \end{array}\right]\text{.} $$ *Answer.* Three. How many pivots can there be in one column? In a $5\times3$ matrix, what is the largest possible number of pivot positions? Give an example of a $5\times3$ matrix that has the largest possible number of pivot positions. *Solution.* A column contains at most one pivot position. Therefore, a $5\times 3$ matrix, which has three columns, contains at most three pivot positions. Here is an example $$ \left[\begin{array}{rrr} 1 & 0 & 0 \\ 0 & 1 & 0 \\ 0 & 0 & 1 \\ 0 & 0 & 0 \\ 0 & 0 & 0 \\ \end{array}\right]\text{.} $$ *Answer.* Three. Give an example of a matrix with a pivot position in every row and every column. What is special about such a matrix? *Solution.* A matrix with a pivot position in every row and every column would have the following reduced row echelon form: $$ \left[\begin{array}{rrr} 1 & 0 & 0 \\ 0 & 1 & 0 \\ 0 & 0 & 1 \\ \end{array}\right]\text{.} $$ Such a matrix must necessarily have the same number of rows and columns, which means it is what we call a square matrix. *Answer.* Such a matrix must necessarily have the same number of rows and columns, which means it is what we call a square matrix. What would you need to know to feel more confident about this material?

When we have looked at solution spaces of linear systems, we have frequently asked whether there are infinitely many solutions, exactly one solution, or no solutions. We will now break this question into two separate questions.

When we encounter a linear system, we often ask Is there a solution to the linear system? If so, we say that the system is *consistent*; if not, we say it is *inconsistent*. consistent system inconsistent system If the linear system is consistent, is the solution unique or are there infinitely many solutions?

These two questions represent two sides of a coin that appear in many variations throughout our explorations. In this section, we will study how the location of the pivots influence the answers to these two questions. We begin by considering the first question concerning the existence of solutions.

#### Definition 1.4.1 {#definition-1-4-1}

pivot position

A **pivot position** in a matrix $A$ is the position of a leading entry in the reduced row echelon matrix of $A$.

#### Exploration 1.4.1 - Some basic observations about pivots {#exploration-1-4-1}

Shown below is a matrix and its reduced row echelon form. Indicate the pivot positions. $$ \left[ \begin{array}{rrrr} 2 & 4 & 6 & -1 \\ -3 & 1 & 5 & 0 \\ 1 & 3 & 5 & 1 \\ \end{array} \right] \sim \left[ \begin{array}{rrrr} 1 & 0 & -1 & 0 \\ 0 & 1 & 2 & 0 \\ 0 & 0 & 0 & 1 \\ \end{array} \right] $$ .

*Solution.* The pivot positions are indicated below $$ \left[ \begin{array}{rrrr} {\mathbf 2} & 4 & 6 & -1 \\ -3 & {\mathbf 1} & 5 & 0 \\ 1 & 3 & 5 & {\mathbf 1} \\ \end{array} \right] \sim \left[ \begin{array}{rrrr} {\mathbf 1} & 0 & -1 & 0 \\ 0 & {\mathbf 1} & 2 & 0 \\ 0 & 0 & 0 & {\mathbf 1} \\ \end{array} \right]\text{.} $$

*Answer.* The pivot positions are indicated below $$ \left[ \begin{array}{rrrr} {\mathbf 2} & 4 & 6 & -1 \\ -3 & {\mathbf 1} & 5 & 0 \\ 1 & 3 & 5 & {\mathbf 1} \\ \end{array} \right] \sim \left[ \begin{array}{rrrr} {\mathbf 1} & 0 & -1 & 0 \\ 0 & {\mathbf 1} & 2 & 0 \\ 0 & 0 & 0 & {\mathbf 1} \\ \end{array} \right]\text{.} $$





How many pivot positions can there be in one row? In a $3\times5$ matrix, what is the largest possible number of pivot positions? Give an example of a $3\times5$ matrix that has the largest possible number of pivot positions.

*Solution.* A row contains at most one pivot position. Therefore, a $3\times 5$ matrix, which has three rows, contains at most three pivot positions. Here is an example: $$ \left[\begin{array}{rrrrr} 1 & 0 & 0 & -1 & 2 \\ 0 & 1 & 0 & 1 & 3 \\ 0 & 0 & 1 & 2 & 3 \\ \end{array}\right]\text{.} $$

*Answer.* Three.





How many pivots can there be in one column? In a $5\times3$ matrix, what is the largest possible number of pivot positions? Give an example of a $5\times3$ matrix that has the largest possible number of pivot positions.

*Solution.* A column contains at most one pivot position. Therefore, a $5\times 3$ matrix, which has three columns, contains at most three pivot positions. Here is an example $$ \left[\begin{array}{rrr} 1 & 0 & 0 \\ 0 & 1 & 0 \\ 0 & 0 & 1 \\ 0 & 0 & 0 \\ 0 & 0 & 0 \\ \end{array}\right]\text{.} $$

*Answer.* Three.





Give an example of a matrix with a pivot position in every row and every column. What is special about such a matrix?

*Solution.* A matrix with a pivot position in every row and every column would have the following reduced row echelon form: $$ \left[\begin{array}{rrr} 1 & 0 & 0 \\ 0 & 1 & 0 \\ 0 & 0 & 1 \\ \end{array}\right]\text{.} $$ Such a matrix must necessarily have the same number of rows and columns, which means it is what we call a square matrix.

*Answer.* Such a matrix must necessarily have the same number of rows and columns, which means it is what we call a square matrix.





What would you need to know to feel more confident about this material?

### The existence of solutions

#### Activity 1.4.1 {#activity-1-4-1}

1. Shown below are three augmented matrices in reduced row echelon form. $$ \left[ \begin{array}{rrr|r} 1 & 0 & 0 & 3 \\ 0 & 1 & 0 & 0 \\ 0 & 0 & 1 & -2 \\ 0 & 0 & 0 & 0 \\ \end{array} \right] $$ $$ \left[ \begin{array}{rrr|r} 1 & 0 & 2 & 3 \\ 0 & 1 & -1 & 0 \\ 0 & 0 & 0 & 0 \\ 0 & 0 & 0 & 0 \\ \end{array} \right] $$ $$ \left[ \begin{array}{rrr|r} 1 & 0 & 2 & 0 \\ 0 & 1 & -1 & 0 \\ 0 & 0 & 0 & 1 \\ 0 & 0 & 0 & 0 \\ \end{array} \right] $$ For each matrix, identify the pivot positions and determine if the corresponding linear system is consistent. Explain how the location of the pivots determines whether the system is consistent or inconsistent. 2. Each of the augmented matrices above has a row in which each entry is zero. What, if anything, does the presence of such a row tell us about the consistency of the corresponding linear system? 3. Give an example of a $3\times5$ augmented matrix in reduced row echelon form that represents a consistent system. Indicate the pivot positions in your matrix and explain why these pivot positions guarantee a consistent system. 4. Give an example of a $3\times5$ augmented matrix in reduced row echelon form that represents an inconsistent system. Indicate the pivot positions in your matrix and explain why these pivot positions guarantee an inconsistent system. 5. Write the reduced row echelon form of the coefficient matrix of the corresponding linear system in li-pivots-existence? (Remember that the Augmentation Principle says that the reduced row echelon form of the coefficient matrix simply consists of the first four columns of the augmented matrix.) What do you notice about the pivot positions in this coefficient matrix? 6. Suppose we have a linear system for which the *coefficient* matrix has the following reduced row echelon form. $$ \left[ \begin{array}{rrrrr} 1 & 0 & 0 & 0 & -1 \\ 0 & 1 & 0 & 0 & 2 \\ 0 & 0 & 1 & 0 & 0 \\ 0 & 0 & 0 & 1 & -3 \\ \end{array} \right] $$ What can you say about the consistency of the linear system?

*Solution.* 1. The pivot positions are indicated below. $$ \left[ \begin{array}{rrr|r} {\mathbf 1} & 0 & 0 & 3 \\ 0 & {\mathbf 1} & 0 & 0 \\ 0 & 0 & {\mathbf 1} & -2 \\ 0 & 0 & 0 & 0 \\ \end{array} \right] $$ $$ \left[ \begin{array}{rrr|r} {\mathbf 1} & 0 & 2 & 3 \\ 0 & {\mathbf 1} & -1 & 0 \\ 0 & 0 & 0 & 0 \\ 0 & 0 & 0 & 0 \\ \end{array} \right] $$ $$ \left[ \begin{array}{rrr|r} {\mathbf 1} & 0 & 2 & 0 \\ 0 & {\mathbf 1} & -1 & 0 \\ 0 & 0 & 0 & {\mathbf 1} \\ 0 & 0 & 0 & 0 \\ \end{array} \right] $$ The first two augmented matrices correspond to consistent linear systems. The third does not, however, since the third row corresponds to the equation $0=1$. In general, a linear system is inconsistent exactly when there is a pivot position in the rightmost column of the augmented matrix. 2. A row in which every entry is zero corresponds to the equation $0=0$, which is always true. Such an equation has no bearing on the consistency of the linear system. 3. $$ \left[\begin{array}{rrrr|r} {\mathbf 1} & 0 & 0 & 2 & 4 \\ 0 & {\mathbf 1} & 0 & -2 & 1 \\ 0 & 0 & {\mathbf 1} & 0 & 3 \\ \end{array}\right] $$ This corresponds to a consistent system because there is not a pivot in the rightmost column. 4. $$ \left[\begin{array}{rrrr|r} {\mathbf 1} & 0 & 0 & 2 & 4 \\ 0 & {\mathbf 1} & 0 & -2 & 1 \\ 0 & 0 & 0 & 0 & {\mathbf 1} \\ \end{array}\right] $$ This is an inconsistent system because the third row corresponds to the equation $0=1$, which is never satisfied. 5. $$ \left[\begin{array}{rrrr} {\mathbf 1} & 0 & 0 & 2 \\ 0 & {\mathbf 1} & 0 & -2 \\ 0 & 0 & 0 & 0 \\ \end{array}\right] $$ In the coefficient matrix, there is a row without a pivot position so that each entry is $0$. This allows a pivot position to appear in the rightmost column of the augmented matrix. 6. This linear system must be consistent because the augmented matrix cannot have a pivot position in the rightmost column.



Let's summarize the results of this activity by considering the following reduced row echelon matrix: $$ \left[ \begin{array}{rrr|r} 1 & * & 0 & 0 \\ 0 & 0 & 1 & 0 \\ 0 & 0 & 0 & 1 \\ 0 & 0 & 0 & 0 \\ \end{array} \right] $$ . In terms of variables $x$, $y$, and $z$, the final equation says $$ 0x + 0y + 0z = 0 $$ . If we evaluate the left-hand side with any values of $x$, $y$, and $z$, we get 0, which means that the equation always holds. Therefore, its presence has no effect on the solution space defined by the other three equations.




The third equation, however, says that $$ 0x + 0y + 0z = 1 $$ . Again, if we evaluate the left-hand side with any values of $x$, $y$, and $z$, we get 0 so this equation cannot be satisfied for any $(x,y,z)$. This means that the entire linear system has no solution and is therefore inconsistent.




An equation like this appears in the reduced row echelon matrix as $$ \left[ \begin{array}{cccc|c} \vdots & \vdots & \vdots & \vdots & \vdots \\ 0 & 0 & \cdots & 0 & 1 \\ \vdots & \vdots & \vdots & \vdots & \vdots \\ \end{array} \right] $$ . The pivot positions make this condition clear: *the system is inconsistent if there is a pivot position in the rightmost column of the corresponding augmented matrix.*




In fact, we will soon see that the system is consistent if there is not a pivot in the rightmost column of the corresponding augmented matrix. This leaves us with the following


#### Proposition 1.4.1 {#thm-pivot-inconsistency}

A linear system is inconsistent if and only if there is a pivot position in the rightmost column of the corresponding augmented matrix.



This also says something about the pivot positions of the coefficient matrix. Consider an example of an inconsistent system corresponding to the reduced row echelon form of the following augmented matrix $$ \left[ \begin{array}{ccc|c} 1 & 0 & * & 0 \\ 0 & 1 & * & 0 \\ 0 & 0 & 0 & 1 \\ \end{array} \right] $$ . The Augmentation Principle says that that the reduced row echelon form of the coefficient matrix is $$ \left[ \begin{array}{ccc} 1 & 0 & * \\ 0 & 1 & * \\ 0 & 0 & 0 \\ \end{array} \right], $$ which shows that the coefficient matrix has a row without a pivot position. To turn this around, we see that *if every row of the coefficient matrix has a pivot position, then the system must be consistent.* For instance, if our linear system has a coefficient matrix whose reduced row echelon form is $$ \left[ \begin{array}{ccc} 1 & 0 & 0 \\ 0 & 1 & 0 \\ 0 & 0 & 1 \\ \end{array} \right] $$ , then we can guarantee that the linear system is consistent because there is no way to obtain a pivot in the rightmost column of the augmented matrix.


#### Proposition 1.4.2 {#proposition-1-4-2}



### The uniqueness of solutions



Now that we have studied the role that pivot positions play in the existence of solutions, let's turn to the question of uniqueness.


#### Activity 1.4.2 {#activity-1-4-2}

1. Here are the three augmented matrices in reduced row echelon form that we considered in the previous section. $$ \left[ \begin{array}{rrr|r} 1 & 0 & 0 & 3 \\ 0 & 1 & 0 & 0 \\ 0 & 0 & 1 & -2 \\ 0 & 0 & 0 & 0 \\ \end{array} \right] $$ $$ \left[ \begin{array}{rrr|r} 1 & 0 & 2 & 3 \\ 0 & 1 & -1 & 0 \\ 0 & 0 & 0 & 0 \\ 0 & 0 & 0 & 0 \\ \end{array} \right] $$ $$ \left[ \begin{array}{rrr|r} 1 & 0 & 2 & 0 \\ 0 & 1 & -1 & 0 \\ 0 & 0 & 0 & 1 \\ 0 & 0 & 0 & 0 \\ \end{array} \right] $$ For each matrix, identify the pivot positions and state whether the corresponding linear system is consistent. If the system is consistent, explain whether the solution is unique or whether there are infinitely many solutions. 2. If possible, give an example of a $3\times5$ augmented matrix that corresponds to a linear system having a unique solution. If it is not possible, explain why. 3. If possible, give an example of a $5\times3$ augmented matrix that corresponds to a linear system having a unique solution. If it is not possible, explain why. 4. What condition on the pivot positions guarantees that a linear system has a unique solution? 5. If a linear system has a unique solution, what can we say about the relationship between the number of equations and the number of variables?

*Solution.* 1. The pivot positions are indicated below. $$ \left[ \begin{array}{rrr|r} {\mathbf 1} & 0 & 0 & 3 \\ 0 & {\mathbf 1} & 0 & 0 \\ 0 & 0 & {\mathbf 1} & -2 \\ 0 & 0 & 0 & 0 \\ \end{array} \right] $$ $$ \left[ \begin{array}{rrr|r} {\mathbf 1} & 0 & 2 & 3 \\ 0 & {\mathbf 1} & -1 & 0 \\ 0 & 0 & 0 & 0 \\ 0 & 0 & 0 & 0 \\ \end{array} \right] $$ $$ \left[ \begin{array}{rrr|r} {\mathbf 1} & 0 & 2 & 0 \\ 0 & {\mathbf 1} & -1 & 0 \\ 0 & 0 & 0 & {\mathbf 1} \\ 0 & 0 & 0 & 0 \\ \end{array} \right] $$ The third linear system is inconsistent. The first system is consistent and has exactly one solution because $x_1=3$, $x_2=0$, and $x_3=-2$. The second system is consistent and has infinitely many solutions since we can write the equations as $$ \begin{alignedat}{2} x_1 & {}={} & 3 -2x_3 \\ x_2 & {}={} & x_3\text{.} \\ \end{alignedat} $$ 2. This is not possible as we see by considering the shape of a typical matrix: $$ \left[\begin{array}{rrrr|r} 1 & 0 & 0 & -3 & 1 \\ 0 & 1 & 0 & 1 & 2 \\ 0 & 0 & 1 & 2 & 4 \\ \end{array}\right] $$ In this case, the variable $x_4$ is free meaning there are infinitely many solutions. 3. This is possible as the following matrix illustrates: $$ \left[\begin{array}{rr|r} 1 & 0 & 0 \\ 0 & 1 & -3 \\ 0 & 0 & 0 \\ 0 & 0 & 0 \\ 0 & 0 & 0 \\ \end{array}\right]\text{.} $$ 4. If every column of the coefficient matrix has a pivot position, we can guarantee that the solution is unique. 5. If the coefficient matrix has a pivot position in every column, there must be at least as many rows as columns. Therefore, the number of equations must be at least as many as the number of variables.



Let's consider what we've learned in this activity. Since we are interested in the question of whether a consistent linear system has a unique solution or infinitely many, we will only consider consistent systems. By the results of the previous section, this means that there is not a pivot in the rightmost column of the augmented matrix. Here are two possible examples: $$ \left[ \begin{array}{rrr|r} 1 & 0 & 0 & 4 \\ 0 & 1 & 0 & -1 \\ 0 & 0 & 1 & 2 \\ \end{array} \right] $$ $$ \left[ \begin{array}{rrr|r} 1 & 0 & 2 & -2 \\ 0 & 1 & 1 & 4 \\ 0 & 0 & 0 & 0 \\ \end{array} \right] $$




In the first example, we have the equations $$ \begin{alignedat}{4} x_1 & {}={} & 4 \\ x_2 & {}={} & -1 \\ x_3 & {}={} & 2 \\ \end{alignedat} $$ demonstrating the fact that there is a unique solution $(x_1,x_2,x_3) = (4,-1,2)$.




In the second example, we have the equations $$ \begin{alignedat}{4} x_1 & & & {}+{} & 2x_3& {}={} & -2 \\ & & x_2 & {}+{} & x_3& {}={} & 4 \\ \end{alignedat} $$ that we may rewrite in parametric form as $$ \begin{alignedat}{4} x_1 & {}={} & -2-2x_3 \\ x_2 & {}={} & 4-x_3 \\ \end{alignedat} $$ . Here we see that $x_1$ and $x_2$ are basic variables that may be expressed in terms of the free variable $x_3$. In this case, the presence of the free variable leads to infinitely many solutions.




Remember that every column of the coefficient matrix corresponds to a variable in our linear system. In the first example, we see that every column of the coefficient contains a pivot position, which means that every variable is uniquely determined. In the second example, the column of the coefficient matrix corresponding to $x_3$ does not contain a pivot position, which results in $x_3$ appearing as a free variable. This illustrates the following principle.


#### Principle 1.4.1 {#principle-1-4-1}

Suppose that we consider a consistent linear system. - If every column of the coefficient matrix contains a pivot position, then the system has a unique solution. - If there is a column in the coefficient matrix that contains no pivot position, then the system has infinitely many solutions. - Columns that contain a pivot position correspond to basic variables while columns that do not correspond to free variables.



When a linear system has a unique solution, every column of the coefficient matrix has a pivot position. Since every row contains at most one pivot position, there must be at least as many rows as columns in the coefficient matrix. Therefore, the linear system has at least as many equations as variables, which is something we intuitively suspected in sec-expect.




It is reasonable to ask how we choose the free variables. For instance, if we have a single equation $$ x + 2y = 4 $$ , then we may write $$ x = 4-2y $$ or, equivalently, $$ y = 2 - \frac12 x $$ . Clearly, either variable may be considered as a free variable in this case.




As we'll see in the future, we are more interested in the *number* of free variables rather than in their choice. For convenience, we will adopt the convention that free variables correspond to columns without a pivot position, which allows us to quickly identify them. For example, the variables $x_2$ and $x_4$ appear as free variables in the following linear system: $$ \left[ \begin{array}{rrrr|r} 1 & 0 & 0 & 2 & 3 \\ 0 & 0 & 1 & -1 & 0 \\ \end{array} \right] $$ .


### Summary



We have seen how the locations of pivot positions, in both the augmented and coefficient matrices, give vital information about the existence and uniqueness of solutions to linear systems. More specifically,




- A linear system is inconsistent exactly when a pivot position appears in the rightmost column of the *augmented* matrix. - If a linear system is consistent, the solution is unique when every column of the *coefficient* matrix contains a pivot position. There are infinitely many solutions when there is a column of the *coefficient* matrix without a pivot position. - If a linear system is consistent, the columns of the coefficient matrix containing pivot positions correspond to basic variables and the columns without pivot positions correspond to free variables.


#### Exercise 1.4.1 - Pivots and the solution sets of linear systems {#exercise-1-4-1}

Suppose that $A=\left[\begin{array}{ccc|c} 1 & 0 & 1 & * \\ 0 & 1 & -2 & * \\ 0 & 0 & 0 & * \\ 0 & 0 & 0 & * \\ \end{array}\right]$, where each $*$ represents an unknown number.



If the linear system represented by $A$ is *consistent* and $A$ is in *reduced row echelon form*, can we determine any of the unknown numbers? If so, which ones? Explain your thinking.





If the linear system represented by $A$ is *inconsistent* and $A$ is in *reduced row echelon form*, can we determine any of the unknown numbers? If so, which ones? Explain your thinking.





If the linear system represented by $A$ is *consistent* and $A$ is in *reduced row echelon form*, can you guarantee that there is a single solution or that there are infinitely many solutions? Explain your thinking.

#### Exercise 1.4.2 - The shape of a matrix and consistency {#exercise-1-4-2}

Give an example of a $3\times5$ augmented matrix in reduced row echelon form having two pivot positions and for which the associated system is consistent or explain why this is not possible.

#### Exercise 1.4.3 - The shape of a matrix and solutions to a linear system {#exercise-1-4-3}

Suppose you have a linear system with 4 equations and 5 variables. Which of the following options are not possible as solution sets of the linear system? - infinitely many solutions - one and only one solution - no solution

Explain your response by considering the possible pivot positions.

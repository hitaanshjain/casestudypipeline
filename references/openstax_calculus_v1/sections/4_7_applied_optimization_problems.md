# OpenStax Calculus Volume 1, Section 4.7: Applied Optimization Problems

## Learning Objectives
- Set up and solve optimization problems in several applied fields.

## Topic Keywords
- optimization problem
- objective function
- constraint equation
- closed bounded interval
- critical point
- absolute maximum
- absolute minimum
- unbounded domain

## Content

One common application of calculus is calculating the minimum or maximum value of a function: companies often
want to minimize production costs or maximize revenue, and in manufacturing it is often desirable to minimize the
amount of material used to package a product of a certain volume. This section sets up and solves problems of
this type.

### Solving Optimization Problems over a Closed, Bounded Interval

In an optimization problem we have a particular quantity of interest that is to be maximized or minimized, subject
to some auxiliary condition (a constraint) that must be satisfied. If the quantity can be written as a continuous
function on a closed, bounded interval, the extreme value theorem guarantees that the function has both an
absolute maximum and an absolute minimum on that interval, and each extreme value occurs either at a critical
point in the interior or at an endpoint.

**EXAMPLE 4.32 (Maximizing the Area of a Garden).** A rectangular garden is to be constructed using a rock wall
as one side of the garden and wire fencing for the other three sides. Given 100 ft of wire fencing, determine the
dimensions that would create a garden of maximum area. What is the maximum area?

Solution:
Let x denote the length of the side perpendicular to the rock wall and y denote the length of the side parallel to
the rock wall. The area is A = x*y. Since the fencing covers two sides of length x and one side of length y, the
constraint is 2x + y = 100, so y = 100 - 2x. Substituting, A(x) = x(100 - 2x) = 100x - 2x^2. For a valid garden we
need x > 0 and y > 0 (equivalently 0 < x < 50), so we consider the closed interval [0, 50], on which A is
continuous; by the extreme value theorem A attains an absolute maximum there. At the endpoints A(0) = A(50) = 0,
and A(x) > 0 on the open interval, so the maximum must occur at an interior critical point. Differentiating,
A'(x) = 100 - 4x, which is zero only at x = 25, the sole critical point. Therefore the maximum area occurs at
x = 25, giving y = 100 - 2(25) = 50. To maximize the area of the garden, let x = 25 ft and y = 50 ft; the maximum
area is A = 25 * 50 = 1250 ft^2.

### Strategy: Solving Optimization Problems
1. Introduce all variables. If applicable, draw a figure and label all variables.
2. Determine which quantity is to be maximized or minimized, and for what range of values of the other variables
   (if this can be determined at this time).
3. Write a formula for the quantity to be maximized or minimized in terms of the variables. This formula may
   involve more than one variable.
4. Write any equations relating the independent variables in the formula from step 3. Use these equations to
   write the quantity to be maximized or minimized as a function of one variable.
5. Identify the domain of consideration for the function in step 4 based on the physical problem to be solved.
6. Locate the maximum or minimum value of the function from step 4. This step typically involves looking for
   critical points and evaluating the function at endpoints.

**EXAMPLE 4.34 (Minimizing Travel Time).** An island is 2 mi due north of the closest point along a straight
shoreline. A visitor is staying at a cabin on the shore that is 6 mi west of that closest point. The visitor plans
to go from the cabin to the island, running at a rate of 8 mph and swimming at a rate of 3 mph. How far should the
visitor run before swimming, to minimize the time it takes to reach the island?

Solution:
Step 1: Let x be the distance run (measured along the shore, starting at the cabin) and let y be the distance
swum. Let T be the total travel time.
Step 2: The problem is to minimize T.
Step 3: Since Distance = Rate * Time, the time spent running is x/8 and the time spent swimming is y/3, so
T = x/8 + y/3.
Step 4: The remaining distance along the shore to the point closest to the island is 6 - x, and y is the
hypotenuse of a right triangle with legs 2 and 6 - x, so by the Pythagorean theorem, y = sqrt((6-x)^2 + 4). Thus
T(x) = x/8 + sqrt((6-x)^2 + 4)/3.
Step 5: Since the visitor can run anywhere from none of the 6 mi to all of it, the domain of consideration is the
closed interval [0, 6].
Step 6: T is continuous on the closed, bounded interval [0, 6], so it has an absolute minimum, occurring at a
critical point or an endpoint. The derivative is T'(x) = 1/8 - (6-x)/(3*sqrt((6-x)^2+4)). Setting T'(x) = 0 gives
1/8 = (6-x)/(3*sqrt((6-x)^2+4)), i.e., 3*sqrt((6-x)^2+4) = 8(6-x). Squaring both sides, 9[(6-x)^2+4] = 64(6-x)^2,
which simplifies to 55(6-x)^2 = 36, so (6-x)^2 = 36/55 and 6 - x = +/- 6/sqrt(55), giving x = 6 -/+ 6/sqrt(55).
Since x = 6 + 6/sqrt(55) is outside [0, 6], it is rejected; x = 6 - 6/sqrt(55) is in [0, 6] and does satisfy the
un-squared equation (the squaring step can introduce extraneous roots, so this check is necessary), so it is the
only critical point. Comparing values: T(0) = sqrt(40)/3 ~= 2.108 h, T(6) = 6/8 + 2/3 ~= 1.417 h, and
T(6 - 6/sqrt(55)) ~= 1.368 h. The minimum occurs at the critical point, so T has a minimum at x ~= 5.19 mi: the
visitor should run about 5.19 mi along the shore before swimming the rest of the way to the island.

### Solving Optimization Problems when the Interval Is Not Closed or Is Unbounded

The previous examples considered functions on closed, bounded domains, where the extreme value theorem guarantees
an absolute maximum and minimum. Many functions defined on a domain that is not closed or not bounded still have
at least one absolute extremum; for example, f(x) = x^2 + 4 on (-infinity, infinity) has an absolute minimum of 4
at x = 0. The next example minimizes a function over an open, unbounded domain by reasoning about the function's
behavior as x approaches the ends of that domain instead of comparing endpoint values.

**EXAMPLE 4.37 (Minimizing Surface Area).** A rectangular box with a square base, an open top, and a volume of
216 in^3 is to be constructed. What should the dimensions of the box be to minimize the surface area of the box?
What is the minimum surface area?

Solution:
Step 1: Let x be the side length of the square base and y be the height of the box. Let S denote the surface
area of the open-top box.
Step 2: The problem is to minimize S.
Step 3: Since the box has an open top, its surface area is the area of the four vertical sides plus the base:
each side has area x*y, and the base has area x^2, so S = 4xy + x^2.
Step 4: The volume constraint is x^2 * y = 216, so y = 216/x^2. Substituting, S(x) = 4x(216/x^2) + x^2, i.e.,
S(x) = 864/x + x^2.
Step 5: Since x^2 * y = 216, x cannot be 0, but x may be any other positive value (as x grows large, y shrinks
correspondingly, and vice versa), so the domain of consideration is the open, unbounded interval (0, infinity).
Because this interval is neither closed nor bounded, the extreme value theorem does not directly apply.
Step 6: As x -> 0+, S(x) -> infinity, and as x -> infinity, S(x) -> infinity. Since S is continuous on (0, infinity)
and approaches infinity at both ends, S must attain an absolute minimum at some interior critical point. The
derivative is S'(x) = -864/x^2 + 2x. Setting S'(x) = 0 gives 2x = 864/x^2, so x^3 = 432 = 216*2 = 6^3*2, hence
x = 6*2^(1/3) is the only critical point, so the absolute minimum occurs there. Then
y = 216/x^2 = 216/(36*4^(1/3)) = 6/4^(1/3) = 3*2^(1/3). Therefore the dimensions of the box should be
x = 6*2^(1/3) in (about 7.56 in) for the base and y = 3*2^(1/3) in (about 3.78 in) for the height. With these
dimensions, the surface area is S = 864/(6*2^(1/3)) + (6*2^(1/3))^2 = 108*4^(1/3) in^2, approximately 171.4 in^2.

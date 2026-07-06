# OpenStax Calculus Volume 1, Section 3.4: Derivatives as Rates of Change

## Learning Objectives
- Determine a new value of a quantity from the old value and the amount of change.
- Calculate the average rate of change and explain how it differs from the instantaneous rate of change.
- Apply rates of change to displacement, velocity, and acceleration of an object moving along a straight line.
- Predict the future population from the present value and the population growth rate.
- Use derivatives to calculate marginal cost and revenue in a business situation.

## Topic Keywords
- amount of change formula
- average rate of change
- instantaneous rate of change
- velocity, speed, and acceleration
- motion along a line
- population growth rate
- marginal cost
- marginal revenue and profit

## Content

### Amount of Change Formula
If f(x) is a function defined on an interval [a, a+h], then the amount of change of f(x)
over the interval is the change in the y-values of the function over that interval,
given by f(a+h) - f(a). The average rate of change of f over that same interval is the
ratio of the amount of change to the corresponding change in the x-values:

    (f(a+h) - f(a)) / h.

As already established, the instantaneous rate of change of f(x) at a is its derivative

    f'(a) = lim_(h->0) (f(a+h) - f(a)) / h.

For small enough values of h, f'(a) ~= (f(a+h) - f(a)) / h. Solving for f(a+h) gives the
amount of change formula:

    f(a+h) ~= f(a) + f'(a) h.                                              (3.10)

This formula lets us estimate f(a+h) knowing only f(a) and f'(a): the new value of a
changed quantity equals the original value plus the rate of change times the interval of
change. For example, the current population of a city together with its growth rate can
be used to estimate the population in the near future.

**EXAMPLE 3.33 (Estimating the Value of a Function).** If f(3) = 2 and f'(3) = 5,
estimate f(3.2).

Solution: Begin by finding h. We have h = 3.2 - 3 = 0.2. Thus,

    f(3.2) = f(3 + 0.2) ~= f(3) + (0.2) f'(3) = 2 + 0.2(5) = 3.

### Definition: Velocity, Speed, and Acceleration
Let s(t) be a function giving the position of an object at time t.
- The velocity of the object at time t is v(t) = s'(t).
- The speed of the object at time t is |v(t)|, the magnitude of the velocity.
- The acceleration of the object at time t is a(t) = v'(t) = s''(t).

The sign of v(t) gives the direction of motion along the line: positive velocity means
the object moves in the positive direction, negative velocity means it moves in the
negative direction. Comparing the signs of v(t) and a(t) tells whether the object is
speeding up or slowing down: when velocity and acceleration have the same sign, the
object is speeding up; when they have opposite signs, the acceleration is acting against
the direction of travel, |v(t)| is decreasing, and the object is slowing down.

**EXAMPLE 3.35 (Interpreting the Relationship between v(t) and a(t)).** A particle moves
along a coordinate axis in the positive direction to the right. Its position at time t is
given by s(t) = t^3 - 4t + 2. Find v(1) and a(1) and use these values to answer:
a. Is the particle moving from left to right or from right to left at time t = 1?
b. Is the particle speeding up or slowing down at time t = 1?

Solution: Begin by finding v(t) and a(t):

    v(t) = s'(t) = 3t^2 - 4  and  a(t) = v'(t) = s''(t) = 6t.

Evaluating these at t = 1, we obtain v(1) = 3(1)^2 - 4 = -1 and a(1) = 6(1) = 6.
a. Because v(1) < 0, the particle is moving from right to left.
b. Because v(1) < 0 and a(1) > 0, velocity and acceleration are acting in opposite
   directions. The particle is being accelerated in the direction opposite the direction
   in which it is traveling, causing |v(t)| to decrease. The particle is slowing down.

### Definition: Population Growth Rate
If P(t) is the number of entities present in a population, then the population growth
rate of P(t) is defined to be P'(t). As with motion along a line, a current population
together with a growth rate can be used, via the amount of change formula, to estimate
the size of a population in the future.

**EXAMPLE 3.37 (Estimating a Population).** The population of a city is tripling every 5
years. If its current population is 10,000, what will be its approximate population 2
years from now?

Solution: Let P(t) be the population (in thousands) t years from now. We know P(0) = 10
and, based on the tripling information, we anticipate P(5) = 30. Estimate P'(0), the
current growth rate, using

    P'(0) ~= (P(5) - P(0)) / (5 - 0) = (30 - 10) / 5 = 4.

Applying the amount of change formula (3.10) to P(t), we can estimate the population 2
years from now:

    P(2) ~= P(0) + (2) P'(0) ~= 10 + 2(4) = 18;

thus, in 2 years the population will be about 18,000.

### Definition: Marginal Cost, Revenue, and Profit
- If C(x) is the cost of producing x items, the marginal cost MC(x) is MC(x) = C'(x).
- If R(x) is the revenue obtained from selling x items, the marginal revenue MR(x) is
  MR(x) = R'(x).
- If P(x) = R(x) - C(x) is the profit obtained from selling x items, the marginal profit
  MP(x) is defined to be MP(x) = P'(x) = MR(x) - MC(x) = R'(x) - C'(x).

Since MC(x) = C'(x) = lim_(h->0) (C(x+h) - C(x)) / h, and x represents whole objects, a
reasonable small value for h is 1. Substituting h = 1 gives the approximation
MC(x) = C'(x) ~= C(x+1) - C(x). Consequently, C'(x) for a given value of x can be thought
of as the change in cost associated with producing one additional item; similarly,
R'(x) approximates the revenue from selling one additional item, and P'(x) approximates
the profit from producing and selling one additional item.

**EXAMPLE 3.38 (Applying Marginal Revenue).** The number of barbeque dinners that can be
sold, x, is related to the price charged, p, by p(x) = 9 - 0.03x, 0 <= x <= 300. The
revenue (in dollars) from selling x dinners is R(x) = x p(x) = x(9 - 0.03x) =
-0.03x^2 + 9x. Use the marginal revenue function to estimate the revenue obtained from
selling the 101st dinner, and compare this to the actual revenue from that sale.

Solution: First find the marginal revenue function: MR(x) = R'(x) = -0.06x + 9. Next, use
R'(100) to approximate R(101) - R(100), the revenue from the sale of the 101st dinner.
Since R'(100) = -0.06(100) + 9 = 3, the revenue from the sale of the 101st dinner is
approximately $3. The actual revenue from the sale of the 101st dinner is

    R(101) - R(100) = 602.97 - 600 = 2.97, or $2.97.

The marginal revenue is a fairly good estimate in this case and has the advantage of
being easy to compute.

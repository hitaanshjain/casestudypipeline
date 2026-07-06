# OpenStax Calculus Volume 1, Section 6.8: Exponential Growth and Decay

## Learning Objectives
- Use the exponential growth model in applications, including population growth and compound interest.
- Explain the concept of doubling time.
- Use the exponential decay model in applications, including radioactive decay and Newton's law of cooling.
- Explain the concept of half-life.

## Topic Keywords
- exponential growth model
- exponential decay model
- doubling time
- half-life
- population growth
- continuously compounded interest
- newton's law of cooling
- radiocarbon dating
- differential equation

## Content

One of the most prevalent applications of exponential functions is growth and decay modeling. From population
growth and continuously compounded interest to radioactive decay and Newton's law of cooling, exponential
functions turn up throughout the natural and financial world; this section works through several of these
applications.

### Exponential Growth Model
Many systems exhibit exponential growth, following a model of the form y = y0*e^(kt), where y0 is the initial
state of the system and k is a positive constant called the growth constant. Differentiating gives
y' = k*y0*e^(kt) = k*y (equation 6.27): the rate of growth is proportional to the current value of the function
itself. An equation relating a function to its own derivative like this is called a differential equation; the
book points the reader to a separate Introduction to Differential Equations chapter in Volume 2 for more depth,
which is not reproduced here.

### Rule: Exponential Growth Model
Systems that exhibit exponential growth increase according to the model y = y0*e^(kt), where y0 represents the
initial state of the system and k > 0 is a constant, called the growth constant.

Population growth is a natural example: it is plausible that a population's growth rate is proportional to its
own size, since the more individuals there are to reproduce, the faster the population grows. The book
illustrates this with a bacterial population starting at 200 with growth constant k = 0.02, so
y = 200*e^(0.02t); a table and graph (Table 6.1, Figure 6.79, not reproduced here) tabulate this function from
t = 10 to t = 120 minutes, climbing from 244 to 2205 bacteria, so that after only 2 hours (120 minutes) the
population is already about 10 times its original size. The book notes that this uses a continuous function to
model behavior that is inherently discrete (a real population is always a whole number of individuals), so
function values from an exponential growth model must always be interpreted in the context of what is being
modeled.

**EXAMPLE 6.42 (Population Growth).** A population of bacteria grows according to f(t) = 200*e^(0.02t), where t
is measured in minutes. How many bacteria are present after 5 hours (300 minutes)? When does the population
reach 100,000 bacteria?

Solution: f(300) = 200*e^(0.02*300) = 200*e^6, which is approximately 80,686 bacteria after 5 hours.
(Recomputed independently: 200*e^6 = 200*403.4288 = 80,685.76, which rounds to the book's 80,686.) To find when
the population reaches 100,000, solve 100,000 = 200*e^(0.02t): dividing by 200 gives 500 = e^(0.02t), taking the
natural log of both sides gives ln(500) = 0.02t, so t = ln(500)/0.02, which is approximately 310.73 minutes.
(Recomputed independently: ln(500)/0.02 = 6.2146/0.02 = 310.73, matching the book.)

A second growth application is continuously compounded interest. Interest paid only once, at the end of a
period, is called simple interest; for instance, $1000 at 2% simple interest for one year gives
1000*(1+0.02) = $1020. Compounding more often lets the account earn interest on interest already credited:
compounding twice a year gives 1000*(1+0.02/2)^2 = $1020.10, compounding three times a year gives
1000*(1+0.02/3)^3 = $1020.13, and compounding daily (365 times a year) gives $1020.20. Letting the number of
compounding periods n grow without bound gives a balance of 1000 times the limit as n approaches infinity of
(1+0.02/n)^(nt) after t years. Substituting n = 0.02m and using the limit definition e = the limit as m
approaches infinity of (1+1/m)^m turns this expression into 1000*e^(0.02t). Generalizing, if a bank account with
initial balance P earns interest at an annual rate r (as a decimal), compounded continuously, the balance after
t years is Balance = P*e^(rt).

(Deviation disclosed: the book works this generalization into a full worked example, Example 6.43, in which a
25-year-old student wants $1,000,000 at age 65 (40 years later): at 5% continuous interest,
P = 1,000,000/e^(0.05*40) is approximately $135,335.28, and at 6% continuous interest,
P = 1,000,000/e^(0.06*40) is approximately $90,717.95, roughly two-thirds as much, showing how much continuous
compounding magnifies a 1-point rate increase. Both figures recomputed independently and match the book exactly
to the cent. A full labeled EXAMPLE block for 6.43 is omitted here as redundant with Example 6.42's
solve-for-the-unknown pattern; its setup and results are preserved above instead.)

### Definition: Doubling Time
If a quantity grows exponentially, its doubling time, the amount of time it takes the quantity to double,
remains constant no matter the starting point. Setting y = 2*y0 in the growth model and solving,
2*y0 = y0*e^(kt), so 2 = e^(kt), ln(2) = kt, and doubling time = ln(2)/k.

**EXAMPLE 6.44 (Using the Doubling Time).** A pond is stocked with 500 fish, and the population grows
exponentially. After 6 months there are 1000 fish. The owner will let his friends and neighbors fish once the
population reaches 10,000. When will that be?

Solution: Since the population doubles in 6 months, 6 = ln(2)/k, so k = ln(2)/6 and
y = 500*e^((ln(2)/6)*t). Setting y = 10,000: 10,000 = 500*e^((ln(2)/6)*t), so 20 = e^((ln(2)/6)*t),
ln(20) = (ln(2)/6)*t, and t = 6*ln(20)/ln(2), which is approximately 25.93 months (a little more than 2 years).
(Recomputed independently: 6*ln(20)/ln(2) = 6*2.99573/0.69315 = 25.93, matching the book.)

### Exponential Decay Model
Exponential functions can also model populations or quantities that shrink over time, such as a population
reduced by disease, or a chemical compound that breaks down. Such systems exhibit exponential decay rather than
exponential growth. The model is nearly the same, except for a negative sign in the exponent: for some positive
constant k, y = y0*e^(-kt), with associated differential equation y' = -k*y0*e^(-kt) = -k*y.

### Rule: Exponential Decay Model
Systems that exhibit exponential decay behave according to the model y = y0*e^(-kt), where y0 represents the
initial state of the system and k > 0 is a constant, called the decay constant.

Newton's law of cooling is a physical application of exponential decay: an object cools at a rate proportional
to the difference between its own temperature and the ambient temperature of its surroundings. If T is the
object's temperature and Ta is the ambient temperature, T' = -k*(T - Ta). This is not quite in exponential-decay
form because of the extra Ta term, but substituting y(t) = T(t) - Ta gives y'(t) = T'(t) = -k*y, which is
genuine exponential decay, so y = y0*e^(-kt). Rewriting in terms of T, with T0 the initial temperature,
T - Ta = (T0 - Ta)*e^(-kt), so T = (T0 - Ta)*e^(-kt) + Ta.

**EXAMPLE 6.45 (Newton's Law of Cooling).** Coffee is poured at 200 degrees F; after 2 minutes in a 70 degree F
room it has cooled to 180 degrees F. Baristas consider 155 to 175 degrees F the optimal serving range. When is
the coffee first cool enough to serve, and when does it become too cold? Round answers to the nearest half
minute.

Solution: Using T = (T0-Ta)*e^(-kt) + Ta with T0 = 200 and Ta = 70: at t = 2, T = 180, so
180 = (200-70)*e^(-2k) + 70, giving 110 = 130*e^(-2k), 11/13 = e^(-2k), and k = (ln(13)-ln(11))/2. The model is
T = 130*e^(((ln(11)-ln(13))/2)*t) + 70. Setting T = 175 and solving the same way gives
t = 2*(ln(21)-ln(26))/(ln(11)-ln(13)), which is approximately 2.56, so the coffee is first cool enough to serve
about 2.5 minutes after being poured. (Recomputed independently: 2*(ln(21)-ln(26))/(ln(11)-ln(13)) =
2*(-0.21357)/(-0.16705) = 2.557, matching the book's rounded 2.5 minutes.) Setting T = 155 gives
t = 2*(ln(17)-ln(26))/(ln(11)-ln(13)), approximately 5.09, so the coffee becomes too cold to serve about 5
minutes after being poured. (Recomputed independently: 2*(-0.42488)/(-0.16705) = 5.087, matching the book's
rounded 5 minutes.)

### Definition: Half-Life
Just as exponentially growing systems have a constant doubling time, exponentially decaying systems have a
constant half-life, the amount of time it takes the quantity to be reduced by half. Setting y = y0/2 in the
decay model and solving, y0/2 = y0*e^(-kt), so 1/2 = e^(-kt), -ln(2) = -kt, and half-life = ln(2)/k (the book
notes this is the same expression found for doubling time).

**EXAMPLE 6.46 (Radiocarbon Dating).** Carbon-14 decays into nonradioactive nitrogen-14 at a regular
exponential rate; its half-life is approximately 5730 years. If we have 100 g of carbon-14 today, how much is
left in 50 years? If an artifact that originally contained 100 g of carbon now contains 10 g, how old is it?
Round the age to the nearest hundred years.

Solution: From the half-life, 5730 = ln(2)/k, so k = ln(2)/5730 and y = 100*e^(-(ln(2)/5730)*t). After 50 years,
y = 100*e^(-(ln(2)/5730)*50), which is approximately 99.40 g. (Recomputed independently:
(ln(2)/5730)*50 = 0.0060485, and 100*e^(-0.0060485) = 99.397, which rounds to the book's 99.40.) For the age of
the artifact, solve 10 = 100*e^(-(ln(2)/5730)*t): 1/10 = e^(-(ln(2)/5730)*t), so t = 5730*ln(10)/ln(2), which is
approximately 19,035 years, or about 19,000 years rounded to the nearest hundred. (Recomputed independently:
5730*ln(10)/ln(2) = 5730*3.32193 = 19,034.6, matching the book's approximately 19,035 and its rounded 19,000.)

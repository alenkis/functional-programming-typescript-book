# Introduction

Functional programming has been significantly gaining popularity in the last decade, but it's actually a very old idea and has influenced the industry since it's begginings.

It has it's roots in Alonzo Church's _lambda calculus_, developed in early 1930's, and LISP programming language developed in late 1950's, and has ever since influenced programming languages. Although this is an interesting topic, we won't bother too much with history and theory, and will instead focus on the practical benefits of adopting a functional programming style.

## What is FP style, anyway?

There is no one true answer to this question, and most people agree this is more a question of a _spectrum_. Here are some characteristics that are usually found in programming languages that describe themselves as functional:

### 1. Functional composition

Functional composition has the emphasis on building programs by composing smaller functions. This allows us to create specialized functions that _do one thing and do it well_ ([UNIX philosophy](https://en.wikipedia.org/wiki/Unix_philosophy#Do_One_Thing_and_Do_It_Well)). This approach helps us create software that has less coupling (complexity) and is easier to maintain.

### 2. Functions as first-class citizens

We are able to create functions on the fly and pass them around as regular values.

### 3. Referential transparency

A _referentially transparent_ expression is one that can be replaced with its result without changing the result of the program. It _always_ returns the same value whenever it's evaluated with the same inputs. It makes reasoning about our programs easier and reduces complexity.

The following expression is referentially transparent:

```typescript
const add = (x, y) => x + y;

add(2, 3) === 5;
// In any expression, add(2,3) can be freely substituted with the value 5
// without changing the result of the program.
```

This expression, on the other hand, cannot be freely substituted with it's value because the evaluation of `add` also creates a _side effect_, logging in this case:

```typescript
const add = (x, y) => {
  console.log(x, y);
  return x + y;
};
```

If we substituted `add(2,3)` with value `5`, we would not evaluate `console.log` and would thus change the behavior of the program. We call functions like these _impure_.

### 4. Immutability

There is no direct mutation and instead values, once created, are unchangeable. New values are created by applying functions to the old values.

```typescript
// mutable style
let value = 1;
value += 1;

// immutable style
const increment = (x) => x + 1;
const value = 1;
const newValue = increment(value);
```

Unfortunately, Typescript being a superset of Javascript, doesn't natively support immutability so we have to be extra careful not to mutate values. Some other languages like [Haskell](https://mmhaskell.com/blog/2017/1/9/immutability-is-awesome) and [Clojure](https://clojure.org/reference/transients#_how_they_work) implement immutable data structures efficiently; Javascript will pay additional memory overhead which is well worth it in majority of situations for application development as it makes the programs easier to debug and reason about.

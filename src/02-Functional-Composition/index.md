# Functional composition

Since functional composition is a central theme of functional programming, we will introduce some helpers that will make our lives easier: `flow`, `pipe` and `apply`.

### Flow

It's useful to think about types when composing functions, for example:

```typescript
const multBy10 = (a: number): number => a * 10;
const increment = (a: number): number => a + 1;
```

Both these functions take a `number` and return a `number`. Their type signatures are `number => number`. If we want to _compose_ these two, we can think of "plugging" the ouput of the first to the input of the second function, like this:

```typescript
  A           B           C
number  =>  number  =>  number
^- increment -^
              ^-- multBy10 --^
```

If we have a function `increment` (`A => B`), and a function `multBy10` (`B => C`), we can create a _new_ function that would have a type signature `A => C`

```typescript
import { flow } from "fp-ts/lib/function";

const composedFn = flow(increment, multBy10);
composedFn(1); // 20
```

This is equivalent to:

```typescript
const result = multBy10(increment(1)); // 20
```

You will notice that the order is different. With `flow`, we can read from left to right, while with traditional approach we would have to read from the inside out.

```typescript
flow(a, b, c)(1) === c(b(a(1)));
```

### Pipe

Pipe is very similar to flow, the only difference is that the first value `pipe` takes is the value itself, which is then applied to a composition of an arbitrary number of functions.

```typescript
pipe(
  value, // value
  f1,    // f1(value)
  f2,    // f2(f1(value))
  f3,    // f3(f2(f1(value)))
  ...,   // ...etc
  fn
)
```

Our previous example would look like this:

```typescript
import { pipe } from "fp-ts/lib/function";

const result = pipe(1, increment, multBy10); // 20
```

### Currying

As we've seen, `flow` returns a function that further expects it's argument; it's _curried_.

Curried functions are functions which don't accept all of their arguments at once, instead they accept it one argument at a time, each time returning a new function. Some languages like Haskell and Elm don't even have a notion of multi-argument functions, _all_ functions are automatically curried. This provides an important benefit - _partial application_

We'll often write functions that return new functions in the following style:

```typescript
const add3Numbers =
  (a: number) =>
  (b: number) =>
  (c: number): number =>
    a + b + c;

// instead of
const add3Numbers_ = (a: number, b: number, c: number): number => a + b + c;
```

### Apply

We've seen an example where inside `pipe` every step produces a new value, which is then fed into the next function. This is very straightforward when we're dealing with single argument functions, but let's see an example how this would work when we introduce multi argument functions in the mix.

```typescript
const result = pipe(
  1,
  increment, // 2
  multBy10, // 20
  add3Numbers, // first argument `a` (20) was partially applied
  (fn) => fn(30), // second argument `b` (30) was partially applied
  (fn) => fn(100) // last argument, `c` (100) was applied
); // 150
```

We can use `apply` to partially apply these values and reduce some boilerplate:

```typescript
import { apply } from "fp-ts/lib/function";

const result = pipe(
  1,
  increment,
  multBy10,
  add3Numbers,
  apply(30),
  apply(100) // 150
);
```

# Functional composition

Since functional composition is a central theme of functional programming, we will introduce two helpers that will make our lives easier, `pipe` and `flow`.

### Flow

It's useful to think about types when composing functions, for example:

```typescript
const multBy10 = (a: number): number => a * 10;
const increment = (a: number): number => a + 1;
```

Both these functions take a `number` and return a `number`. Their type signatures are `number => number`.

```typescript
  A           B           C
number  =>  number  =>  number
^_ increment _^
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

You will notice that the order is different. With `flow`, we can read from left to right, while with traditional approach we have to read from inside out

```typescript
flow(a, b, c)(1) === c(b(a(1)));
```

### Pipe

Pipe is very similar to flow, the only difference is that the first value `pipe` takes is the value itself which it then _threads_ through an arbitrary number of functions.

Our previous example would look like this:

```typescript
import { pipe } from "fp-ts/lib/function";

const result = pipe(1, increment, multBy10); // 20
```

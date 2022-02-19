# Either

In the last chapter we've introduced a pattern for dealing with missing values and failed computations, `Option`. Unfortunately, `Option` can only tell us that there _is_ a missing value (by returning `None`), but it can't tell us _why_ is that the case. If we wanted to capture this additional context, we need another abstraction, `Either`.

We can define it as:

```ts
type Left<E> = {
  readonly _tag: "Left";
  readonly left: E;
};

type Right<A> = {
  readonly _tag: "Right";
  readonly left: A;
};

type Either<E, A> = Left<E> | Right<A>;
```

Using tagged union pattern, we can now assign data to both branches, _left_ and _right_. By convention, _left_ represents a failure and _right_ represents a successful outcome (right, correct).

## Why not throw?

A common pattern in the case of failures is to throw an exception which is then (hopefully) caught somewhere in the stack.

```ts
const validateInput = (input: string): boolean => {
  if (!input) {
    throw new Error("Input should not be empty");
  }

  return input.length > 5;
};
```

The problem with this approach is that it makes the function impure, it performs a side effect. This makes it harder to test because it doesn't only return values. It also _shifts_ the burden of handling this error outwards, possibly many levels of abstraction higher, so this reduces our ability to reason about this code locally.

We can instead use `Either` return the data that _represents_ the error.

```ts
const validateInput = (input: string): Either<Error, boolean> =>
  input
    ? right(input.length > 5)
    : left(new Error("Input should not be empty"));
```

This version is also more informative; its return type describes what it does more closely.

## Constructors and guards

```ts
// constructors
const left = <E = never, A = never>(e: E): Either<E, A> => ({
  _tag: "Left",
  left: e,
});
const right = <E = never, A = never>(a: A): Either<E, A> => ({
  _tag: "Right",
  right: a,
});

// guards
const isLeft = <E, A>(ma: Either<E, A>): ma is Left<E> => ma._tag === "Left";
const isRight = <E, A>(ma: Either<E, A>): ma is Right<A> => ma._tag === "Right";
```

Similar to what we've seen with `Option`, by having these low level constructors and guards we can now construct `fromPredicate` and `match` functions:

```ts
// Constructs a Right instance if predicate returns true, otherwise returns Left
const fromPredicate =
  <E, A>(predicate: (a: A) => boolean, onLeft: (a: A) => E) =>
  (value: A): Either<E, A> =>
    predicate(value) ? right(value) : left(onLeft(a));

fromPredicate(
  (n) => n > 5,
  (n) => `${n} was NOT greater than 5`
)(1); // Left<number>
fromPredicate(
  (n) => n > 5,
  (n) => `${n} was NOT greater than 5`
)(6); // Right<number>
```

`fromPredicate` is very similar to the one used with `Option`, the only difference being that it needs additional input argument, `onLeft`, a function that will create a value we can attach to `Left` instance

## Pattern matching

```ts
// Evaluates appropriate handler based on whether an Option is Some or None
const match =
  <E, A, C>(onLeft: (e: E) => B, onRight: (a: A) => C) =>
  (ma: Either<E, A>) =>
    isLeft(ma) ? onLeft(ma.left) : onRight(ma.right);

pipe(
  left("failed to fetch"),
  match(
    (errorMessage) => `error: ${errorMessage}`,
    (result) => result + 1
  )
); // "error: failed to fetch"

pipe(
  right(100),
  match(
    (errorMessage) => `error: ${errorMessage}`,
    (result) => result + 1
  )
); // 101
```

`match` is also very similar, the only difference is that `onLeft` handler now "holds" a value because `Left` instance is parametricized by a type (`Left<E>`), compared to `None` which cannot hold any value.

In fact, all af the helpers we've defined for `Option` can be defined for `Either` as well, with the main difference of having to provide a value for `Left` instance. Implementation of these methods will be left as an exercise for reader.

# Exercises

1. Create a helper `fromNullable` which takes a default value and and a nullable value and returns an `Either`

2. Create a function `parseString` which takes a parsing `pattern` and an `input` string. If the `input` starts with the `pattern`, return `Right` instance holding _the rest_ of the string (unconsumed portion). If the `input` doesn't start with the `pattern`, return `Left` instance with a message "could not parse"

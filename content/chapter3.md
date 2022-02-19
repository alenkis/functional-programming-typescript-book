# Option

There is a common concept in programming that is often a source of many bugs, and that's a concept of a _missing_ value. Many programming languages use [null](https://www.infoq.com/presentations/Null%2DReferences%2DThe%2DBillion%2DDollar%2DMistake%2DTony%2DHoare/) to represent this state, and some like JavaScript also use `undefined`. In case of JavaScript, these 2 account for 8 of 10 [most common errors](https://www.rollbar.com/blog/blog/top%2D10%2Djavascript%2Derrors%2Dfrom%2D1000%2Dprojects%2Dand%2Dhow%2Dto%2Davoid%2Dthem) found in production.

<!-- We'll look how deeper into functional programming patterns, specifically `Option` monad, that can help us control this behaviour in a more safe, predictable and maintainable way.  -->

## Nullable types

We can get some type safety by returning nullable types and using optional chaining operator. If an expression can return some type `A` or `null`, we can ensure that the return type of the expression is `A | null` thus forcing us to check and narrow down the type before use.

```typescript
const result = Math.random() > 0.5 ? { nested: { value: 1 } } : null
// { nested: { value: number } } | null

const checkedValue = result?.nested?.value
// number | undefined

if (checkedValue) {
  // Only here have we finally narrowed our type to `number`
  ...
}
```

We can even create a generic type helper for this approach, `Nullable`

```typescript
type Nullable<T> = T | null;
```

There are a couple of problems with this approach:

- we are forced to use `if` statements which are brittle, poorly legible and can lead to some complex states
- it's harder to compose functions

Consider the following example of functions (whose implementation doesn't matter, but their types do):

```typescript
declare function getName(id: string): Nullable<string>;
declare function formatName(name: string): string;
declare function countLetters(name: string): number;
```

`getName` can possibly fail, and so we return a `Nullable<string>` (`string` | `null`). The problem arises if we try to combine this function with others like this:

```typescript
pipe("id", getName, formatName, countLetters);
//                  ^-- type `null` is not assignable to type `string`
```

We get an error _type `null` is not assignable to type `string`_. We now have to introduce manual checking with `if` statements which leads to decreased readability. If the functions are used a lot, in order to avoid this boilerplate we might be tempted to handle this check inside `formatName` function and decide to rewrite it as:

```typescript
declare function formatName(name: Nullable<string>): Nullable<string>;
```

Of course, now we've created another problem because we have to do the same to `countLetters` and any other function in this chain, making our code a lot less type safe. We've also increased coupling between these functions. Type signature of `formatName` shouldn't reflect possibly missing data, that's the concern of `getName` function.

## Option

We can take a slightly different approach and create a container for an optional value using discriminated unions:

```typescript
type None = {
  readonly _tag: "None";
};

type Some<A> = {
  readonly _tag: "Some";
  readonly value: A;
};

type Option<A> = None | Some<A>;
```

We use `_tag` field for comparison (_"discrimination"_) between the types `None` and `Some`. This pattern is also sometimes called _tagged union_ because we can use literal values of the "tag" to narrow down our type. Even though this looks very similar to a plain union like we've used with `Nullable`, this approach will allow us to build some very powerful abstractions that will allow us to reason about our code on a higher level.

We also need a way how to create `Option`s and check which variant we have, `Some` or `None`.

```typescript
// constructors
const some = <A>(a: A): Option<A> => ({ _tag: "Some", value: a });
const none: Option<never> = { _tag: "None" };

// guards
const isSome = <A>(fa: Option<A>): fa is Some<A> => fa._tag === "Some";
const isNone = <A>(fa: Option<A>): fa is None => fa._tag === "None";
```

So, now we can create and check options, but it would be pretty tedious to write code like this directly. Instead we can use these to create more elaborate constructors like `fromPredicate` and use these guards to create a pattern matching function `match`

```typescript
// Constructs a Some instance if predicate returns true, otherwise returns None
const fromPredicate =
  <A>(predicate: (a: A) => boolean) =>
  (value: A): Option<A> =>
    predicate(value) ? some(value) : none;

// Evaluates appropriate handler based on whether an Option is Some or None
const match =
  <B, A>(onNone: () => B, onSome: (a: A) => B) =>
  (ma: Option<A>) =>
    isNone(ma) ? onNone() : onSome(ma.value);
```

We can create an option using `fromPredicate` like this:

```typescript
const optionalNumber = pipe(
  Math.random(),
  fromPredicate((n) => n > 0.5)
); // Option<number>
```

The above code will create `Some` instance _only_ if the predicate functions returns true for a given input. Otherwise, it will return `None`.

We can use `match` to pattern match against these two possibilities:

```typescript
const result = pipe(
  Math.random(),
  fromPredicate((n) => n > 0.5),
  match(
    // None handler
    () => "Number was lower than 0.5",
    // Some(n) handler
    (n) => `Number value: ${n}`
  )
); // string
```

We cannot decide _not_ to handle both cases, that would be a type error.

Sometimes we just want to extract the value in case of `Some`, and handle the `None` case with some default value. We could do this with `match`, but we can also use `getOrElse` and `getOrElseW`

```typescript
pipe(
  someOption,
  match(
    () => 1 // return default value in case of `None`
    n => n  // or return n in case of `Some`
  )
)
```

```typescript
// we can simplify above by using `getOrElse`
import * as O from "fp-ts/Option";

pipe(
  someOption,
  O.getOrElse(() => 1)
);
```

Both `match` and `getOrElse` need to return the same type from both branches, so that the resulting value is of a single type. We can also _widen_ the result by using `getOrElseW`. In `fp-ts`, `W` suffix means _widen_ and functions that end with `W` aggregate types from different branches into a type union

```typescript
const result = pipe(
  O.some(1),
  O.getOrElseW(() => "hello")
); // number | string
```

There are a couple of more useful helpers:

```typescript
import * as O from "fp-ts/Option";

O.fromNullable(null); // O.None
O.fromNullable(undefined); // O.None
O.fromNullable(""); // O.Some("")

O.toNullable(O.some("hello")) // "hello"
O.toNullable(O.none)) // null

O.toUndefined(O.some("hello")) // "hello"
O.toUndefined(O.none)) // undefined
```

So far, we've managed to create a specialized container, created some helper constructors, guards and a pattern matching tool. We are able to create `Option` from values, pattern match against it and destructure its value. Later, we will see how `Option` can have even more interesting behaviour.

# Exercises

1. Create a function `isValidName` which when supplied with a name of type `string`, returns a `Some` instance only when `name` is longer than 2 characters, otherwise it returns `None`

2. Create a function `greetUser` that, using previously defined function `isValidName`, checks whether a name is valid, and if it is, returns `Welcome, ${name}, you have a great name!`, otherwise returns `Hey there, isn't your name a bit short?`

# Option

There is a common concept in programming that is often a source of many bugs, and that's a concept of a _missing_ value. Many programming languages use [null](https://www.infoq.com/presentations/Null%2DReferences%2DThe%2DBillion%2DDollar%2DMistake%2DTony%2DHoare/) to represent this state, and some like JavaScript also use `undefined`. In case of JavaScript, these 2 account for 8 of 10 [most common errors](https://www.rollbar.com/blog/blog/top%2D10%2Djavascript%2Derrors%2Dfrom%2D1000%2Dprojects%2Dand%2Dhow%2Dto%2Davoid%2Dthem) found in production.

We'll look deeper into functional programming patterns, specifically `Option` monad, that can help us control this behaviour in a more safe, predictable and maintainable way. Our weapon of choice here is going to be `TypeScript`.

## Nullable types

We _can_ get some type safety by returning nullable types and using optional chaining operator. If an expression can return some type `A` or `null`, we can ensure that the return type of the expression is `A | null` thus forcing us to check and narrow down the type before use.

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

What do I mean by harder function composition? Consider the following example of functions (whose implementation doesn't matter, but their types do):

```typescript
declare function getName(id: string): Nullable<string>;
declare function formatName(name: string): string;
declare function countLetters(name: string): number;
```

`getName` can possibly fail, and so we return a `Nullable<string>` (`string` | `null`). The problem arises if we try to combine this functions with others like this:

```typescript
countLetters(formatName(getName("id")));
// type `null` is not assignable to type `string`
```

We get an error _type `null` is not assignable to type `string`_. We now have to introduce manual checking with `if` statements which leads to decreased readability. If the functions are used a lot, in order to avoid this boilerplate we might be tempted to handle this inside `formatName` function and decide to rewrite it as:

```typescript
declare function formatName(name: Nullable<string>): Nullable<string>;
```

Of course, now we've created another problem because we have to do the same to `countLetters` and any other function in this chain, making our code lot less type safe and we've also increased function coupling. Type signature of `formatName` shouldn't reflect possibly missing data, that's the concern of `getName` function.

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

Even though this looks very similar to a plain union like we've used with `Nullable`, this approach will allow us to build some very powerful abstractions that will allow us to reason about our code on a higher level.

Before we do that, we will also need `pipe`, a function that will help us compose different functions in a more readable (and maintainable) way.

```typescript
// Instead of
countLetters(formatName(getName("id")));

// we can use pipe
pipe(
  "id", // <-- a value, followed by arbitrary number of functions
  getName,
  formatName,
  countLetters
);
```

If we ever need to add additional function, we just need to insert it in this "pipeline" of tranformations, compared to nested function calls where we'd need to mess with parentheses as well.

We've seen how we've defined `Option`, but now we need a way how to create them and also check which variant we have, `Some` or `None`

```typescript
// constructors
const some = <A>(a: A): Option<A> => ({ _tag: "Some", value: a });
const none: Option<never> = { _tag: "None" };

// guards
const isSome: <A>(fa: Option<A>) => fa is Some<A> = _.isSome;
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

We are using currying (functions that return functions) in order to use `pipe` more efficiently. For example we can create an option using `fromPredicate` like this:

```typescript
const result = pipe(
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
    () => "Number was lower than 0.5",
    (n) => `Number value: ${n}`
  )
); // string
```

We cannot decide _not_ to handle both cases, that would be a type error.

So far, we've managed to create a specialized container, create some helper constructors and guards and a pattern matching tool. We will now build on this by making our `Option` a `Functor`!

## Option is a Functor

Scary sounding word but it only means that we are able to apply a function to a value inside our `Option`. You are already familiar with some data structures that are also functors, `Array` for example, so it's no surprise that we need a function called `map` in order make our `Option` a functor

```typescript
const map =
  <A, B>(f: (a: A) => B) =>
  (fa: Option<A>): Option<B> =>
    isNone(fa) ? none : some(f(fa.value));
```

`map` takes two arguments (curried)

- a function `f` that transforms some value (`A => B`)
- a Functor `fa` ("Functor of type A"), in our case `Option<A>`

if `fa`, our `Option` we're operating on, is `None`, then the result is also a `None` - we've essentially bypassed this operation and tranformation was not performed. If our `Option` is a `Some` instance, then we apply our function to it's underlying value. This gives us an amazing ability to chain operations that can produce `None`, without worrying about manual value checking.

Let's implement our fictional example with name formatting using `Option` and `map`

```typescript
declare function getName(id: string): Option<string>;
declare function formatName(name: string): string;
declare function countLetters(name: string): number;

const result = pipe(
  "id",
  getName, // <-- returns an Option<string>
  map(formatName), // <-- returns an Option<string>
  map(countLetters), // <-- returns an Option<number>
  match(
    () => 0, // if the whole thing returned `None`
    (value) => value
  )
); // number
```

We have used pure functions `formatName` and `countLetters` inside of a context of potentially missing value and we were able to decouple our functions. `map` lets us gradually build up the result while staying inside our `Option` container, all the while never needing to worry about a possibly missing state.

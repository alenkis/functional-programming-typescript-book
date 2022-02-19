# Functor

A `Functor` is a type constructor that supports mapping operation. The name comes from mathematics, specifically category theory. If it was invented in the context of programming, it might have been called `Mappable`.

Mapping operation allows us to apply a function inside a generic type without changing its structure. This sounds very familiar, and in fact many common data structures _are_ functors, for example `Array`. It's `map` function allows us to apply function to values inside the container without changing it's structure - the result is still an array of the same size.

```ts
type MappingFn<A, B> = (a: A) => B;

const numberToString: MappingFn<number, string> = (a) => a.toString();

[1, 2, 3].map(numberToString); // ["1", "2", "3"]
```

We can implement the same operation for `Option` and `Either`

## Option

```typescript
const map =
  <A, B>(f: (a: A) => B) =>
  (fa: Option<A>): Option<B> =>
    isNone(fa) ? none : some(f(fa.value));
```

`map` takes two arguments (curried)

- a function `f` that transforms some value (`A => B`)
- a Functor `fa` ("Functor of type A"), in our case `Option<A>`

if `fa`, our `Option` we're operating on, is `None`, then the result is also a `None` - we've essentially bypassed this operation and mapping function was not applied. If our `Option` is a `Some` instance, then we apply our function to it's underlying value. This gives us an ability to chain operations that can produce `None`, without worrying about manual value checking.

We can refactor our nullable types example from [chapter 3](chapter3.md#nullable-types) like this:

```typescript
declare function getName(id: string): Option<string>;
declare function formatName(name: string): string;
declare function countLetters(name: string): number;

pipe(
  "id",
  getName, // <-- returns an Option<string>
  map(formatName), // <-- returns an Option<string>
  map(countLetters), // <-- returns an Option<number>
  getOrElse(() => 0) // return the final value if `Some`, otherwise return 0
); // number
```

We have used pure functions `formatName` and `countLetters` inside of a context of potentially missing value and we were able to decouple our functions. `map` lets us gradually build up the result while staying inside our `Option` container, all the while never needing to worry about a possibly missing state.

## Either

We can create `map` for `Either` as well:

```ts
const map =
  <A, B>(f: (a: A) => B) =>
  <E>(fa: Either<E, A>): Either<E, B> =>
    isLeft(fa) ? fa : right(f(fa.right));
```

Implementation is very similar to `Option`, we are returning our `Either` instance unchanged if it's a `Left` instance, otherwise we are returning a new `Either` instance with its value now being a result of applying function `f` to the old value.

Unlike `Option`, `Either` can also have a mapping operation over it's `Left` value. Implementing `mapLeft` will be left as an exercise for the reader.

## Functor laws

There are many more data types that have a `Functor` instance, in other words, that implement `map` operation. Unfortunately, Typescript can't support a single, polymorhphic function `map` that is able to operate on any functor instance, so each data needs to implement is own specialized version (like we did here for `Option` and `Either`).

All of the instances need to obey functor laws, rules that guarantee that `map` operation produces sane functor instances. Data types that `fp-ts` exports already obey them, but they are useful to know if we decide to create custom data types with functor instance (and we will, later in the tutorial).

1. _Identity law_

   If we map the identity function over a container, the result should be the same unchanged container. `map` should not be applying any other changes or side effects, it should only apply the function.

   ```ts
   map(fa, (a) => a) === fa;
   ```

2. _Composition law_

   This rules ensures composition of functions works properly for our functor instance. There should be no difference if we map over container `fa` using composed function `fg`, or if we we perform mapping with `f` and then with `g`.

   ```ts
   const fg = flow(f, g); // composed function
   map(fa, (a) => fg(a)) === map(map(fa, f), g);
   ```

# Exercises

1. Create a `mapLeft` function for `Either` instances

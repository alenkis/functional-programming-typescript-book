# Functor

## Option

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

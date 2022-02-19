import { Either, left, right } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";

export const fromNullable =
  <E>(defaultValue: E) =>
  <A>(a: A): Either<E, A> =>
    typeof a === "undefined" || a === null ? left(defaultValue) : right(a);

export const parseString =
  (pattern: string) =>
  (input: string): Either<string, string> =>
    pipe(input.split(pattern), ([f, rest]) =>
      f === "" ? right(rest) : left("could not parse")
    );

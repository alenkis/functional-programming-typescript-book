import { Either, isRight, left } from "fp-ts/lib/Either";

export const mapLeft =
  <E1, E2>(f: (e: E1) => E2) =>
  <A>(fa: Either<E1, A>): Either<E2, A> =>
    isRight(fa) ? fa : left(f(fa.left));

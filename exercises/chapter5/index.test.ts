import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/lib/function";
import { mapLeft } from "./";

describe("mapLeft", () => {
  it("Should not apply function f to right value", () => {
    const value = 1;
    const result = pipe(
      E.right(value),
      mapLeft((x: number) => x + 1)
    );

    expect(result).toEqualRight(value);
  });

  it("Should apply function f to left value", () => {
    const value = 1;
    const f = (x: number) => x + 1;
    const result = pipe(E.left(value), mapLeft(f));

    expect(result).toEqualLeft(f(value));
  });
});

import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/Option";

export const isValidName = (name: string): O.Option<string> =>
  pipe(
    name,
    O.fromPredicate((n) => n.length > 5)
  );

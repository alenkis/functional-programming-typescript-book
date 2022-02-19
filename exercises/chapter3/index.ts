import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/Option";

export const isValidName = (name: string): O.Option<string> =>
  pipe(
    name,
    O.fromPredicate((n) => n.length > 2)
  );

export const greetUser = (name: string): string =>
  pipe(
    name,
    isValidName,
    O.match(
      () => "Hey there, isn't your name a bit short?",
      (validName) => `Welcome, ${validName}, you have a great name!`
    )
  );

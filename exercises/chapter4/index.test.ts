import { fromNullable, parseString } from "./";

describe("fromNullable", () => {
  it("Should return Left instance with default value if given nullable value", () => {
    const defaultValue = "foo";

    expect(fromNullable(defaultValue)(null)).toEqualLeft(defaultValue);
    expect(fromNullable(defaultValue)(undefined)).toEqualLeft(defaultValue);
  });

  it("Should return Right instance with provided value if given non nullable value", () => {
    const defaultValue = "foo";

    expect(fromNullable(defaultValue)(1)).toEqualRight(1);
    expect(fromNullable(defaultValue)("")).toEqualRight("");
  });
});

describe("parseString", () => {
  it("Should return Left instance if input does not start with pattern", () => {
    const pattern = "hello";
    const input = "world";

    expect(parseString(pattern)(input)).toEqualLeft("could not parse");
  });

  it("Should return Left instance if input does not start with pattern", () => {
    const pattern = "hello";
    const input = "hello world";

    expect(parseString(pattern)(input)).toEqualRight(" world");
  });
});

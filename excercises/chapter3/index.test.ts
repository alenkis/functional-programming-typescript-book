import { isValidName } from "./";

describe("isValidName", () => {
  it("Should return an option", () => {
    expect(isValidName("hi")).toBeOption();
  });

  it("Should return None for names with length <= 5", () => {
    expect(isValidName("")).toBeNone();
    expect(isValidName("hi")).toBeNone();
    expect(isValidName("hello")).toBeNone();
  });

  it("Should return Some for names with length > 5", () => {
    const name = "correctName";
    expect(isValidName(name)).toEqualSome(name);
  });
});

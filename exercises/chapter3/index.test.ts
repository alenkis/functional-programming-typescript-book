import { isValidName, greetUser } from "./";

describe("isValidName", () => {
  it("Should return an option", () => {
    expect(isValidName("hi")).toBeOption();
  });

  it("Should return None for names with length <= 2", () => {
    expect(isValidName("")).toBeNone();
    expect(isValidName("h")).toBeNone();
    expect(isValidName("hi")).toBeNone();
  });

  it("Should return Some for names with length > 2", () => {
    const name = "validName";
    expect(isValidName(name)).toEqualSome(name);
  });
});

describe("greetUser", () => {
  const fallbackMessage = "Hey there, isn't your name a bit short?";
  const greetMessage = (name: string) =>
    `Welcome, ${name}, you have a great name!`;

  it("Should return a string", () => {
    expect(typeof greetUser("John")).toBe("string");
  });

  it("Should return fallback message for short names", () => {
    expect(greetUser("")).toBe(fallbackMessage);
  });

  it("Should return greet message for valid names", () => {
    expect(greetUser("John")).toBe(greetMessage("John"));
  });
});

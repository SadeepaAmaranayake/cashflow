import {
  loginFormSchema,
  registerFormSchema,
} from "../src/validation/auth";
import { transactionFormSchema } from "../src/validation/transaction";

describe("authentication form validation", () => {
  test("accepts valid registration input", () => {
    expect(
      registerFormSchema.safeParse({
        name: "Nimal",
        email: "nimal@example.com",
        password: "long-test-password",
      }).success,
    ).toBe(true);
  });

  test("rejects malformed login input", () => {
    expect(
      loginFormSchema.safeParse({
        email: "not-an-email",
        password: "",
      }).success,
    ).toBe(false);
  });
});

describe("transaction form validation", () => {
  test("accepts valid transaction input", () => {
    expect(
      transactionFormSchema.safeParse({
        type: "expense",
        amount: "250.50",
        category: "Food",
        description: "Lunch",
        transactionDate: "2026-09-05T12:00:00.000Z",
      }).success,
    ).toBe(true);
  });

  test("rejects invalid money and categories", () => {
    expect(
      transactionFormSchema.safeParse({
        type: "expense",
        amount: "1.999",
        category: "Invalid",
        description: "",
        transactionDate: "2026-09-05T12:00:00.000Z",
      }).success,
    ).toBe(false);
  });
});

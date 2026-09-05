import {
  formatMoney,
  formatMoneyInput,
  parseMoneyInput,
} from "../src/utils/money";

describe("parseMoneyInput", () => {
  test.each([
    ["1", 100],
    ["1.5", 150],
    ["1.50", 150],
    ["250.50", 25_050],
  ])("converts %s to %i minor units", (input, expected) => {
    expect(parseMoneyInput(input)).toEqual({
      ok: true,
      amountMinor: expected,
    });
  });

  test.each([
    "",
    "0",
    "letters",
    "-1",
    "Infinity",
    "1.001",
    "100000000.01",
  ])("rejects invalid value %p", (input) => {
    expect(parseMoneyInput(input).ok).toBe(false);
  });
});

describe("money formatting", () => {
  test("formats display values in LKR", () => {
    expect(formatMoney(100_050)).toBe(
      "LKR 1,000.50",
    );
    expect(formatMoney(-100_050)).toBe(
      "LKR -1,000.50",
    );
  });

  test("formats stored values for an editable input", () => {
    expect(formatMoneyInput(25_000)).toBe("250");
    expect(formatMoneyInput(25_050)).toBe("250.50");
  });
});

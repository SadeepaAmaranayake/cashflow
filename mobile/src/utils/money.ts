const MINOR_UNITS_PER_LKR = 100;
const MAX_AMOUNT_LKR = 100_000_000;
const MAX_AMOUNT_MINOR =
  MAX_AMOUNT_LKR * MINOR_UNITS_PER_LKR;

const DECIMAL_MONEY_PATTERN =
  /^\d+(?:\.\d{1,2})?$/;

export type ParseMoneyInputResult =
  | {
      ok: true;
      amountMinor: number;
    }
  | {
      ok: false;
      message: string;
    };

export function formatMoney(
  amountMinor: number,
): string {
  if (!Number.isSafeInteger(amountMinor)) {
    throw new Error(
      "amountMinor must be a safe integer",
    );
  }

  const sign = amountMinor < 0 ? "-" : "";
  const absoluteAmount = Math.abs(amountMinor);

  const wholePart = Math.trunc(
    absoluteAmount / MINOR_UNITS_PER_LKR,
  );

  const fractionalPart = (
    absoluteAmount % MINOR_UNITS_PER_LKR
  )
    .toString()
    .padStart(2, "0");

  return `LKR ${sign}${wholePart.toLocaleString(
    "en-LK",
  )}.${fractionalPart}`;
}

export function formatMoneyInput(
  amountMinor: number,
): string {
  if (
    !Number.isSafeInteger(amountMinor) ||
    amountMinor <= 0
  ) {
    throw new Error(
      "amountMinor must be a positive safe integer",
    );
  }

  const wholePart = Math.trunc(
    amountMinor / MINOR_UNITS_PER_LKR,
  );

  const fractionalPart = (
    amountMinor % MINOR_UNITS_PER_LKR
  )
    .toString()
    .padStart(2, "0");

  return fractionalPart === "00"
    ? wholePart.toString()
    : `${wholePart}.${fractionalPart}`;
}

export function parseMoneyInput(
  text: string,
): ParseMoneyInputResult {
  const normalizedText = text.trim();

  if (normalizedText.length === 0) {
    return {
      ok: false,
      message: "Amount is required",
    };
  }

  if (!DECIMAL_MONEY_PATTERN.test(normalizedText)) {
    return {
      ok: false,
      message:
        "Enter a positive amount with at most 2 decimal places",
    };
  }

  const [
    wholePart,
    fractionalPart = "",
  ] = normalizedText.split(".");

  const amountMinor =
    Number(wholePart) * MINOR_UNITS_PER_LKR +
    Number(fractionalPart.padEnd(2, "0"));

  if (amountMinor <= 0) {
    return {
      ok: false,
      message: "Amount must be greater than zero",
    };
  }

  if (amountMinor > MAX_AMOUNT_MINOR) {
    return {
      ok: false,
      message: "Amount exceeds the maximum allowed value",
    };
  }

  if (!Number.isSafeInteger(amountMinor)) {
    return {
      ok: false,
      message: "Amount is outside the safe integer range",
    };
  }

  return {
    ok: true,
    amountMinor,
  };
}

// amountMinor is always an integer: 250.50 becomes 25050. Integer arithmetic avoids decimal rounding errors.
// The regular expression accepts only digits plus an optional one- or two-digit decimal part. It rejects -1, 1.999, abc, Infinity, and 12abc.
// We split text into whole and fractional strings instead of doing Number(text) * 100. Floating-point arithmetic is unsafe for money in general.
// The maximum matches your server: LKR 100,000,000.
// formatMoney is for display only. Its output, such as LKR 1,000.00, must never be sent back to parseMoneyInput or used in calculations.

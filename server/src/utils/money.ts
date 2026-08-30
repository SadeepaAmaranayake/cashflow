import { AppError } from "../errors/app-error.js";

const MINOR_UNITS_PER_LKR = 100n;
const MAX_AMOUNT_LKR = 100_000_000n;

const MAX_AMOUNT_MINOR =
  MAX_AMOUNT_LKR * MINOR_UNITS_PER_LKR;

const DECIMAL_AMOUNT_PATTERN =
  /^\d+(?:\.\d{1,2})?$/;

export function parseLkrToMinorUnits(
  input: string,
): number {
  const normalizedInput = input.trim();

  if (normalizedInput.length === 0) {
    throw new AppError(400, "Amount is required");
  }

  if (!DECIMAL_AMOUNT_PATTERN.test(normalizedInput)) {
    throw new AppError(
      400,
      "Amount must be a positive decimal with at most 2 decimal places",
    );
  }

  const [
    wholePart = "",
    fractionalPart = "",
  ] = normalizedInput.split(".");

  const paddedFractionalPart =
    fractionalPart.padEnd(2, "0");

  const amountMinorBigInt =
    BigInt(wholePart) * MINOR_UNITS_PER_LKR +
    BigInt(paddedFractionalPart);

  if (amountMinorBigInt <= 0n) {
    throw new AppError(
      400,
      "Amount must be greater than zero",
    );
  }

  if (amountMinorBigInt > MAX_AMOUNT_MINOR) {
    throw new AppError(
      400,
      "Amount exceeds the maximum allowed value",
    );
  }

  const amountMinor = Number(amountMinorBigInt);

  if (!Number.isSafeInteger(amountMinor)) {
    throw new AppError(
      400,
      "Amount is outside the safe integer range",
    );
  }

  return amountMinor;
}

export function formatLkrFromMinorUnits(
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
    absoluteAmount / 100,
  );

  const fractionalPart = (
    absoluteAmount % 100
  )
    .toString()
    .padStart(2, "0");

  return `${sign}${wholePart}.${fractionalPart} LKR`;
}
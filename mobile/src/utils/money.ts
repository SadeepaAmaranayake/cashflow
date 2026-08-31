export function formatMoney(
  amountMinor: number,
  currency = "LKR",
): string {
  if (!Number.isSafeInteger(amountMinor)) {
    throw new Error(
      "amountMinor must be a safe integer",
    );
  }

  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountMinor / 100);
}
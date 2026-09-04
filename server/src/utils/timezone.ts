export const DEFAULT_TIMEZONE = "Asia/Colombo";

export function isValidTimeZone(
  timezone: string,
): boolean {
  try {
    new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
    }).format();

    return true;
  } catch {
    return false;
  }
}

export function requireValidTimeZone(
  value: unknown,
): string {
  if (
    typeof value !== "string" ||
    !isValidTimeZone(value)
  ) {
    throw new Error("Stored user timezone is invalid");
  }

  return value;
}

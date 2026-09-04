export const BCRYPT_MAX_PASSWORD_BYTES = 72;

export function isWithinBcryptPasswordLimit(
  password: string,
): boolean {
  return (
    Buffer.byteLength(password, "utf8") <=
    BCRYPT_MAX_PASSWORD_BYTES
  );
}

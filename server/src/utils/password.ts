import bcrypt from "bcrypt";

const BCRYPT_COST = 12;
const BCRYPT_MAX_PASSWORD_BYTES = 72;

function isWithinBcryptLimit(password: string): boolean {
  return Buffer.byteLength(password, "utf8") <= BCRYPT_MAX_PASSWORD_BYTES;
}

export async function hashPassword(password: string): Promise<string> {
  if (!isWithinBcryptLimit(password)) {
    throw new Error("Password exceeds bcrypt's 72-byte limit");
  }

  return bcrypt.hash(password, BCRYPT_COST);//bcrypt.hash() automatically generates a random salt and includes it in the resulting hash. You should not generate or store a separate salt.
}

export async function comparePassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  if (!isWithinBcryptLimit(password)) {
    return false;
  }

  return bcrypt.compare(password, passwordHash);
}
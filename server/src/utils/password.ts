import bcrypt from "bcrypt";
import {
  isWithinBcryptPasswordLimit,
} from "../constants/password.js";

const BCRYPT_COST = 12;

export async function hashPassword(password: string): Promise<string> {
  if (!isWithinBcryptPasswordLimit(password)) {
    throw new Error("Password exceeds bcrypt's 72-byte limit");
  }

  return bcrypt.hash(password, BCRYPT_COST);//bcrypt.hash() automatically generates a random salt and includes it in the resulting hash. You should not generate or store a separate salt.
}

export async function comparePassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  if (!isWithinBcryptPasswordLimit(password)) {
    return false;
  }

  return bcrypt.compare(password, passwordHash);
}

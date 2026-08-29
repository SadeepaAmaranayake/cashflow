import jwt, { type SignOptions } from "jsonwebtoken";//satisfies SignOptions checks that the object is valid without changing "HS256" and "1h" into overly broad or optional types.

const JWT_SIGN_OPTIONS = {
  algorithm: "HS256",
  expiresIn: "1h",
} satisfies SignOptions;

function getJwtSecret(): string {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is missing from the environment");
  }

  if (Buffer.byteLength(jwtSecret, "utf8") < 32) {
    throw new Error("JWT_SECRET must contain at least 32 bytes");
  }

  return jwtSecret;
}

export function signAccessToken(userId: string): string {
  if (!userId) {
    throw new Error("A userId is required to create an access token");
  }

  return jwt.sign(
    {
      userId,
    },
    getJwtSecret(),
    JWT_SIGN_OPTIONS,
  );
}
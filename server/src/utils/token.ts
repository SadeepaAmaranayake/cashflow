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

export interface VerifiedAccessToken {
  userId: string;
}

export function verifyAccessToken(
  token: string,
): VerifiedAccessToken {
  const decoded = jwt.verify(
    token,
    getJwtSecret(),
    {
      algorithms: ["HS256"],//prevents verification with an unexpected signing algorithm.
    },
  );

  if (
    typeof decoded === "string" ||
    typeof decoded.userId !== "string" ||
    decoded.userId.length === 0
  ) {
    throw new Error("Token does not contain a valid userId");
  }

  return {
    userId: decoded.userId,
  };
}
// jwt.verify(...)
// does more than decode the token. It checks:
// - The signature.
// - The signing secret.
// - The allowed algorithm.
// - The exp expiration claim.
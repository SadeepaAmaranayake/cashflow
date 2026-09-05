import assert from "node:assert/strict";
import test from "node:test";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { registerSchema } from "../validation/auth.schemas.js";
import {
  formatLkrFromMinorUnits,
  parseLkrToMinorUnits,
} from "../utils/money.js";
import {
  DEFAULT_TIMEZONE,
  isValidTimeZone,
} from "../utils/timezone.js";
import {
  comparePassword,
  hashPassword,
} from "../utils/password.js";

test("converts accepted LKR strings to minor units", () => {
  assert.equal(parseLkrToMinorUnits("1"), 100);
  assert.equal(parseLkrToMinorUnits("1.5"), 150);
  assert.equal(parseLkrToMinorUnits("1.50"), 150);
  assert.equal(parseLkrToMinorUnits("250.50"), 25_050);
});

test("rejects invalid LKR strings", () => {
  for (const value of [
    "",
    "0",
    "-1",
    "letters",
    "Infinity",
    "1.001",
    "100000000.01",
  ]) {
    assert.throws(() => parseLkrToMinorUnits(value));
  }
});

test("formats integer minor units without floating-point arithmetic", () => {
  assert.equal(
    formatLkrFromMinorUnits(25_050),
    "250.50 LKR",
  );
  assert.equal(
    formatLkrFromMinorUnits(-25_050),
    "-250.50 LKR",
  );
});

test("registration normalizes input and rejects unknown fields", () => {
  const result = registerSchema.parse({
    name: "  Nimal  ",
    email: "  NIMAL@EXAMPLE.COM  ",
    password: "long-test-password",
  });

  assert.equal(result.name, "Nimal");
  assert.equal(result.email, "nimal@example.com");

  assert.throws(() =>
    registerSchema.parse({
      name: "Nimal",
      email: "nimal@example.com",
      password: "long-test-password",
      isAdmin: true,
    }),
  );
});

test("registration enforces bcrypt's UTF-8 byte limit", () => {
  assert.equal(
    registerSchema.safeParse({
      name: "Nimal",
      email: "nimal@example.com",
      password: "😀".repeat(19),
    }).success,
    false,
  );
});

test("password helpers hash with cost 12 and compare safely", async () => {
  const password = "long-test-password";
  const passwordHash = await hashPassword(password);

  assert.notEqual(passwordHash, password);
  assert.equal(bcrypt.getRounds(passwordHash), 12);
  assert.equal(
    await comparePassword(password, passwordHash),
    true,
  );
  assert.equal(
    await comparePassword("wrong-password", passwordHash),
    false,
  );
});

test("timezone validation accepts IANA names and rejects invalid names", () => {
  assert.equal(DEFAULT_TIMEZONE, "Asia/Colombo");
  assert.equal(isValidTimeZone("Asia/Colombo"), true);
  assert.equal(isValidTimeZone("Not/A_Timezone"), false);
});

test("access tokens contain userId but no private user data", async () => {
  process.env.PORT = "4000";
  process.env.MONGODB_URI = "mongodb://127.0.0.1/Cashflow-test";
  process.env.JWT_SECRET =
    "test-only-secret-with-at-least-32-bytes";

  const { signAccessToken, verifyAccessToken } =
    await import("../utils/token.js");

  const userId = "507f1f77bcf86cd799439011";
  const token = signAccessToken(userId);
  const decoded = jwt.decode(token);

  assert.equal(typeof decoded, "object");
  assert.ok(decoded !== null);
  assert.deepEqual(
    Object.keys(decoded).sort(),
    ["exp", "iat", "userId"],
  );
  assert.deepEqual(verifyAccessToken(token), { userId });
});

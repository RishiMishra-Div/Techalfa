import { randomBytes } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { passwordHash } from "../src/auth/adminAuth.js";

const readline = createInterface({ input: stdin, output: stdout });
try {
  const password = await readline.question("Choose an admin password (minimum 12 characters): ");
  if (password.length < 12) throw new Error("Admin passwords must contain at least 12 characters.");
  const salt = randomBytes(16).toString("hex");
  console.log(`ADMIN_PASSWORD_HASH=${passwordHash(password, salt)}`);
} finally {
  readline.close();
}

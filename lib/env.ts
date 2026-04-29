import "server-only";
import { z } from "zod";

const EnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
  SWAG_BYPASS_TOKEN: z.string().min(1, "SWAG_BYPASS_TOKEN is required"),
});

const parsed = EnvSchema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  SWAG_BYPASS_TOKEN: process.env.SWAG_BYPASS_TOKEN,
});

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
    .join("\n");
  throw new Error(`Invalid environment variables:\n${issues}`);
}

export const env = parsed.data;

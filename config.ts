import { z } from "zod";

const environmentSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  HOST: z.string().trim().min(1).default("127.0.0.1"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
});

export function readConfig(environment: NodeJS.ProcessEnv = process.env) {
  const result = environmentSchema.safeParse(environment);
  if (!result.success) {
    // Report field names, never raw environment values or credentials.
    const fields = [...new Set(result.error.issues.map(issue => issue.path.join(".")))];
    throw new Error(`Invalid configuration: ${fields.join(", ")}`);
  }
  return result.data;
}

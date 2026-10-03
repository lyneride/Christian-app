import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // PostgreSQL connection string, e.g. postgresql://user:pass@host/db?sslmode=require
    url: process.env["DATABASE_URL"] ?? "postgresql://postgres:postgres@localhost:5432/bleibe",
  },
});

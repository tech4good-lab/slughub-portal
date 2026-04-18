import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
  pool: Pool;
};

export const pool = globalForPrisma.pool || new Pool({ connectionString });

pool.on("connect", () => {
  console.log("New client connected to the pool");
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
});
if (process.env.NODE_ENV !== "production") globalForPrisma.pool = pool;

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

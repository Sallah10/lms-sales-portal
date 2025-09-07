// sales-portal/prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding portal database...");

  const hashedPassword = await bcrypt.hash("password123", 12);

  // Create a sample sales user
  await prisma.user.upsert({
    where: { email: "salesrep@company.com" },
    update: {},
    create: {
      name: "John SalesRep",
      email: "salesrep@company.com",
      password: hashedPassword,
      role: "SALES",
    },
  });

  await prisma.user.upsert({
    where: { email: "sales1@example.com" },
    update: {},
    create: {
      name: "Sales Rep 1",
      email: "sales1@example.com",
      password: await bcrypt.hash("password123", 10),
      role: "SALES",
    },
  });

  console.log(
    "Seeding finished. User created: salesrep@company.com / password123"
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

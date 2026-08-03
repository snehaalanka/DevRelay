import prisma from './src/lib/prisma.js';

async function main() {
  try {
    console.log("Adding 'status' column...");
    await prisma.$executeRawUnsafe(`ALTER TABLE "Device" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'offline';`);
    
    console.log("Adding 'lastSeen' column...");
    await prisma.$executeRawUnsafe(`ALTER TABLE "Device" ADD COLUMN IF NOT EXISTS "lastSeen" TIMESTAMP(3);`);
    
    console.log("Successfully migrated the database!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

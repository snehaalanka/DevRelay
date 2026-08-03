import prisma from './src/lib/prisma.js';

async function main() {
  try {
    const owner = await prisma.user.findFirst();
    if (!owner) {
      console.log("No users found in database.");
      return;
    }
    
    console.log(`Testing with user ID: ${owner.id}`);
    
    const device = await prisma.device.create({
      data: {
        name: 'test-device',
        ownerId: owner.id
      }
    });
    
    console.log("Successfully created device:", device);
    
    const permission = await prisma.permission.create({
      data: {
        deviceId: device.id,
        userId: owner.id,
        permission: "*"
      }
    });
    console.log("Successfully created permission:", permission);
    
    // Clean up
    await prisma.device.delete({
      where: { id: device.id }
    });
  } catch (error) {
    console.error("Prisma error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

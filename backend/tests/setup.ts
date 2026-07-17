import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => {
  // Connect to test database if needed
});

afterAll(async () => {
  // Clean up database
  const deleteEvents = prisma.event.deleteMany();
  const deleteVendors = prisma.vendor.deleteMany();
  const deleteUsers = prisma.user.deleteMany();

  await prisma.$transaction([deleteEvents, deleteVendors, deleteUsers]);
  await prisma.$disconnect();
});

import { prisma } from '../config/db';
import { AppError } from '../middleware/errorHandler';

export const registerVendor = async (userId: string, data: any) => {
  const existingVendor = await prisma.vendor.findUnique({
    where: { userId }
  });

  if (existingVendor) {
    throw new AppError('You have already registered a business', 400);
  }

  // Also update user role to VENDOR
  await prisma.user.update({
    where: { id: userId },
    data: { role: 'VENDOR' }
  });

  const vendor = await prisma.vendor.create({
    data: {
      ...data,
      userId
    }
  });

  return vendor;
};

export const getAllVendors = async (query: any) => {
  const { category, search, featured } = query;
  
  let where: any = { isApproved: true };
  
  if (category) where.category = category;
  if (featured === 'true') where.isFeatured = true;
  if (search) {
    where.OR = [
      { businessName: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ];
  }

  return await prisma.vendor.findMany({
    where,
    orderBy: { rating: 'desc' }
  });
};

export const getVendorById = async (id: string) => {
  const vendor = await prisma.vendor.findUnique({
    where: { id },
    include: { services: true, reviews: { include: { user: { select: { firstName: true, lastName: true } } } } }
  });

  if (!vendor) throw new AppError('Vendor not found', 404);
  return vendor;
};

export const approveVendor = async (id: string) => {
  return await prisma.vendor.update({
    where: { id },
    data: { isApproved: true }
  });
};

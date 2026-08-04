import { prisma } from '../config/db';
import { AppError } from '../middleware/errorHandler';

export const registerVendor = async (userId: string | null, data: any) => {
  // If authenticated and already has a vendor, throw
  if (userId) {
    const existingVendor = await prisma.vendor.findUnique({ where: { userId } });
    if (existingVendor) throw new AppError('You have already registered a business', 400);
    // Update user role to VENDOR
    await prisma.user.update({ where: { id: userId }, data: { role: 'VENDOR' } });
  }

  const vendor = await prisma.vendor.create({
    data: {
      userId: userId || null,
      businessName: data.businessName || data.name || '',
      category: data.category || '',
      description: data.description || '',
      location: data.location || '',
      contactName: data.contactName || '',
      contactEmail: data.contactEmail || '',
      contactPhone: data.contactPhone || '',
      rating: Number(data.rating) || 0,
      reviews: Number(data.reviews) || 0,
      isFeatured: data.featured || false,
      // Auto-approve for demo purposes; in production set false and require admin approval
      isApproved: true,
    }
  });

  return vendor;
};

export const getAllVendors = async (query: any) => {
  const { category, search } = query;

  let where: any = {};  // Show all vendors (approved or not) for the demo

  if (category && category !== 'all') where.category = category;
  if (search) {
    where.OR = [
      { businessName: { contains: search } },
      { description: { contains: search } }
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
    include: {
      services: true,
      vendorReviews: true
    }
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

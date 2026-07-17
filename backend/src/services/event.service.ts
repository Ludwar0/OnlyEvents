import { prisma } from '../config/db';
import { AppError } from '../middleware/errorHandler';

const PACKAGE_PRICES = {
  BRONZE: 50000,
  SILVER: 100000,
  GOLD: 200000
};

export const createEvent = async (clientId: string, data: any) => {
  const totalAmount = PACKAGE_PRICES[data.package as keyof typeof PACKAGE_PRICES];
  
  if (!totalAmount) {
    throw new AppError('Invalid package selected', 400);
  }

  const event = await prisma.event.create({
    data: {
      ...data,
      clientId,
      totalAmount
    }
  });

  return event;
};

export const getClientEvents = async (clientId: string) => {
  return await prisma.event.findMany({
    where: { clientId },
    orderBy: { createdAt: 'desc' },
    include: { payments: true }
  });
};

export const getAllEvents = async () => {
  return await prisma.event.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      client: { select: { firstName: true, lastName: true, email: true, phone: true } },
      truckAssignment: true,
      allocations: { include: { equipment: true } }
    }
  });
};

export const getEventById = async (id: string) => {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      client: { select: { firstName: true, lastName: true, email: true, phone: true } },
      truckAssignment: true,
      allocations: { include: { equipment: true } },
      payments: true
    }
  });

  if (!event) throw new AppError('Event not found', 404);
  return event;
};

export const updateEventStatus = async (id: string, status: any) => {
  const event = await prisma.event.update({
    where: { id },
    data: { status }
  });
  return event;
};

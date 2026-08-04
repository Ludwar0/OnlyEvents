import { prisma } from '../config/db';
import { AppError } from '../middleware/errorHandler';

const PACKAGE_PRICES: Record<string, number> = {
  BRONZE: 50000,
  SILVER: 120000,
  GOLD: 280000,
  Bronze: 50000,
  Silver: 120000,
  Gold: 280000,
};

export const createEvent = async (clientId: string | null, data: any) => {
  const pkgKey = (data.package || '').toString();
  const totalAmount = data.amount || PACKAGE_PRICES[pkgKey] || 0;

  // Normalize the eventDate to a proper Date object
  let eventDate: Date;
  try {
    eventDate = new Date(data.eventDate);
    if (isNaN(eventDate.getTime())) throw new Error('Invalid date');
  } catch {
    throw new AppError('Invalid eventDate format', 400);
  }

  const event = await prisma.event.create({
    data: {
      clientId: clientId || null,
      clientName: data.clientName || '',
      clientEmail: data.clientEmail || '',
      clientPhone: data.clientPhone || '',
      eventType: data.eventType || 'OTHER',
      customEventType: data.customEventType || null,
      eventDate,
      venue: data.venue || '',
      package: pkgKey,
      guests: Number(data.guests) || 0,
      specialRequirements: data.specialRequirements || null,
      totalAmount,
      amountPaid: Number(data.amountPaid) || 0,
      paymentStatus: data.paymentStatus || 'PENDING',
      status: data.status || 'UPCOMING',
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
      truckAssignment: true,
      allocations: { include: { equipment: true } },
      payments: true
    }
  });
};

export const getEventById = async (id: string) => {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
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

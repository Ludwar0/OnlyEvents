"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEventStatus = exports.getEventById = exports.getAllEvents = exports.getClientEvents = exports.createEvent = void 0;
const db_1 = require("../config/db");
const errorHandler_1 = require("../middleware/errorHandler");
const PACKAGE_PRICES = {
    BRONZE: 50000,
    SILVER: 100000,
    GOLD: 200000
};
const createEvent = async (clientId, data) => {
    const totalAmount = PACKAGE_PRICES[data.package];
    if (!totalAmount) {
        throw new errorHandler_1.AppError('Invalid package selected', 400);
    }
    const event = await db_1.prisma.event.create({
        data: {
            ...data,
            clientId,
            totalAmount
        }
    });
    return event;
};
exports.createEvent = createEvent;
const getClientEvents = async (clientId) => {
    return await db_1.prisma.event.findMany({
        where: { clientId },
        orderBy: { createdAt: 'desc' },
        include: { payments: true }
    });
};
exports.getClientEvents = getClientEvents;
const getAllEvents = async () => {
    return await db_1.prisma.event.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            client: { select: { firstName: true, lastName: true, email: true, phone: true } },
            truckAssignment: true,
            allocations: { include: { equipment: true } }
        }
    });
};
exports.getAllEvents = getAllEvents;
const getEventById = async (id) => {
    const event = await db_1.prisma.event.findUnique({
        where: { id },
        include: {
            client: { select: { firstName: true, lastName: true, email: true, phone: true } },
            truckAssignment: true,
            allocations: { include: { equipment: true } },
            payments: true
        }
    });
    if (!event)
        throw new errorHandler_1.AppError('Event not found', 404);
    return event;
};
exports.getEventById = getEventById;
const updateEventStatus = async (id, status) => {
    const event = await db_1.prisma.event.update({
        where: { id },
        data: { status }
    });
    return event;
};
exports.updateEventStatus = updateEventStatus;

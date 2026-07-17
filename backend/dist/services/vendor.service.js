"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.approveVendor = exports.getVendorById = exports.getAllVendors = exports.registerVendor = void 0;
const db_1 = require("../config/db");
const errorHandler_1 = require("../middleware/errorHandler");
const registerVendor = async (userId, data) => {
    const existingVendor = await db_1.prisma.vendor.findUnique({
        where: { userId }
    });
    if (existingVendor) {
        throw new errorHandler_1.AppError('You have already registered a business', 400);
    }
    // Also update user role to VENDOR
    await db_1.prisma.user.update({
        where: { id: userId },
        data: { role: 'VENDOR' }
    });
    const vendor = await db_1.prisma.vendor.create({
        data: {
            ...data,
            userId
        }
    });
    return vendor;
};
exports.registerVendor = registerVendor;
const getAllVendors = async (query) => {
    const { category, search, featured } = query;
    let where = { isApproved: true };
    if (category)
        where.category = category;
    if (featured === 'true')
        where.isFeatured = true;
    if (search) {
        where.OR = [
            { businessName: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
        ];
    }
    return await db_1.prisma.vendor.findMany({
        where,
        orderBy: { rating: 'desc' }
    });
};
exports.getAllVendors = getAllVendors;
const getVendorById = async (id) => {
    const vendor = await db_1.prisma.vendor.findUnique({
        where: { id },
        include: { services: true, reviews: { include: { user: { select: { firstName: true, lastName: true } } } } }
    });
    if (!vendor)
        throw new errorHandler_1.AppError('Vendor not found', 404);
    return vendor;
};
exports.getVendorById = getVendorById;
const approveVendor = async (id) => {
    return await db_1.prisma.vendor.update({
        where: { id },
        data: { isApproved: true }
    });
};
exports.approveVendor = approveVendor;

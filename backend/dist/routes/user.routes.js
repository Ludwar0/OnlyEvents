"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const db_1 = require("../config/db");
const router = (0, express_1.Router)();
// Get user profile
router.get('/profile', auth_middleware_1.protect, async (req, res, next) => {
    try {
        const user = await db_1.prisma.user.findUnique({
            where: { id: req.user.id },
            include: { vendorProfile: true }
        });
        res.json({ status: 'success', data: { user } });
    }
    catch (error) {
        next(error);
    }
});
// Update user profile
router.patch('/profile', auth_middleware_1.protect, async (req, res, next) => {
    try {
        const { firstName, lastName, phone } = req.body;
        const user = await db_1.prisma.user.update({
            where: { id: req.user.id },
            data: { firstName, lastName, phone }
        });
        res.json({ status: 'success', data: { user } });
    }
    catch (error) {
        next(error);
    }
});
// Get all users (Admin)
router.get('/', auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)('ADMIN'), async (req, res, next) => {
    try {
        const users = await db_1.prisma.user.findMany({
            select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true }
        });
        res.json({ status: 'success', data: { users } });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;

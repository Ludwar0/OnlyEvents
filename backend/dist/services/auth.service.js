"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserById = exports.refreshTokens = exports.loginUser = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../config/db");
const env_1 = require("../config/env");
const errorHandler_1 = require("../middleware/errorHandler");
const generateTokens = (userId, role) => {
    const accessToken = jsonwebtoken_1.default.sign({ id: userId, role }, env_1.env.JWT_SECRET, {
        expiresIn: env_1.env.JWT_EXPIRES_IN,
    });
    const refreshToken = jsonwebtoken_1.default.sign({ id: userId, role }, env_1.env.JWT_REFRESH_SECRET, {
        expiresIn: env_1.env.JWT_REFRESH_EXPIRES_IN,
    });
    return { accessToken, refreshToken };
};
const registerUser = async (data) => {
    const existingUser = await db_1.prisma.user.findUnique({
        where: { email: data.email }
    });
    if (existingUser) {
        throw new errorHandler_1.AppError('Email already in use', 400);
    }
    const hashedPassword = await bcryptjs_1.default.hash(data.password, 12);
    const user = await db_1.prisma.user.create({
        data: {
            ...data,
            password: hashedPassword
        },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            createdAt: true
        }
    });
    return user;
};
exports.registerUser = registerUser;
const loginUser = async (email, password, ip, userAgent) => {
    const user = await db_1.prisma.user.findUnique({
        where: { email }
    });
    if (!user || !(await bcryptjs_1.default.compare(password, user.password))) {
        throw new errorHandler_1.AppError('Incorrect email or password', 401);
    }
    const tokens = generateTokens(user.id, user.role);
    // Store refresh token in db (Session)
    await db_1.prisma.session.create({
        data: {
            userId: user.id,
            refreshToken: tokens.refreshToken,
            ipAddress: ip,
            userAgent: userAgent,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        }
    });
    return {
        user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
        },
        ...tokens
    };
};
exports.loginUser = loginUser;
const refreshTokens = async (refreshToken) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(refreshToken, env_1.env.JWT_REFRESH_SECRET);
        const session = await db_1.prisma.session.findUnique({
            where: { refreshToken }
        });
        if (!session || session.expiresAt < new Date()) {
            if (session)
                await db_1.prisma.session.delete({ where: { id: session.id } });
            throw new errorHandler_1.AppError('Invalid or expired refresh token', 401);
        }
        const user = await db_1.prisma.user.findUnique({ where: { id: decoded.id } });
        if (!user)
            throw new errorHandler_1.AppError('User not found', 404);
        const tokens = generateTokens(user.id, user.role);
        await db_1.prisma.session.update({
            where: { id: session.id },
            data: {
                refreshToken: tokens.refreshToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
        });
        return tokens;
    }
    catch (error) {
        throw new errorHandler_1.AppError('Invalid refresh token', 401);
    }
};
exports.refreshTokens = refreshTokens;
const getUserById = async (id) => {
    const user = await db_1.prisma.user.findUnique({
        where: { id },
        select: { id: true, email: true, firstName: true, lastName: true, role: true }
    });
    if (!user)
        throw new errorHandler_1.AppError('User not found', 404);
    return user;
};
exports.getUserById = getUserById;

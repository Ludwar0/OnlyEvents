"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerVendorSchema = void 0;
const zod_1 = require("zod");
exports.registerVendorSchema = zod_1.z.object({
    body: zod_1.z.object({
        businessName: zod_1.z.string().min(2),
        category: zod_1.z.string().min(2),
        description: zod_1.z.string().min(10),
        location: zod_1.z.string(),
        contactEmail: zod_1.z.string().email(),
        contactPhone: zod_1.z.string()
    })
});

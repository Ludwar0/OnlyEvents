"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.approveVendor = exports.getVendorById = exports.getAllVendors = exports.registerVendor = void 0;
const vendorService = __importStar(require("../services/vendor.service"));
const registerVendor = async (req, res, next) => {
    try {
        const vendor = await vendorService.registerVendor(req.user.id, req.body);
        res.status(201).json({ status: 'success', data: { vendor } });
    }
    catch (error) {
        next(error);
    }
};
exports.registerVendor = registerVendor;
const getAllVendors = async (req, res, next) => {
    try {
        const vendors = await vendorService.getAllVendors(req.query);
        res.status(200).json({ status: 'success', data: { vendors } });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllVendors = getAllVendors;
const getVendorById = async (req, res, next) => {
    try {
        const vendor = await vendorService.getVendorById(req.params.id);
        res.status(200).json({ status: 'success', data: { vendor } });
    }
    catch (error) {
        next(error);
    }
};
exports.getVendorById = getVendorById;
const approveVendor = async (req, res, next) => {
    try {
        const vendor = await vendorService.approveVendor(req.params.id);
        res.status(200).json({ status: 'success', data: { vendor } });
    }
    catch (error) {
        next(error);
    }
};
exports.approveVendor = approveVendor;

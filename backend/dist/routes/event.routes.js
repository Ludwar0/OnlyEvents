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
const express_1 = require("express");
const eventController = __importStar(require("../controllers/event.controller"));
const validate_1 = require("../middleware/validate");
const event_validator_1 = require("../validators/event.validator");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post('/', auth_middleware_1.protect, (0, validate_1.validate)(event_validator_1.createEventSchema), eventController.createEvent);
router.get('/my-events', auth_middleware_1.protect, eventController.getMyEvents);
router.get('/', auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)('ADMIN'), eventController.getAllEvents);
router.get('/:id', auth_middleware_1.protect, eventController.getEventById);
router.patch('/:id/status', auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)('ADMIN'), (0, validate_1.validate)(event_validator_1.updateEventStatusSchema), eventController.updateEventStatus);
exports.default = router;

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
exports.updateEventStatus = exports.getEventById = exports.getAllEvents = exports.getMyEvents = exports.createEvent = void 0;
const eventService = __importStar(require("../services/event.service"));
const createEvent = async (req, res, next) => {
    try {
        const event = await eventService.createEvent(req.user.id, req.body);
        res.status(201).json({ status: 'success', data: { event } });
    }
    catch (error) {
        next(error);
    }
};
exports.createEvent = createEvent;
const getMyEvents = async (req, res, next) => {
    try {
        const events = await eventService.getClientEvents(req.user.id);
        res.status(200).json({ status: 'success', data: { events } });
    }
    catch (error) {
        next(error);
    }
};
exports.getMyEvents = getMyEvents;
const getAllEvents = async (req, res, next) => {
    try {
        const events = await eventService.getAllEvents();
        res.status(200).json({ status: 'success', data: { events } });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllEvents = getAllEvents;
const getEventById = async (req, res, next) => {
    try {
        const event = await eventService.getEventById(req.params.id);
        res.status(200).json({ status: 'success', data: { event } });
    }
    catch (error) {
        next(error);
    }
};
exports.getEventById = getEventById;
const updateEventStatus = async (req, res, next) => {
    try {
        const event = await eventService.updateEventStatus(req.params.id, req.body.status);
        res.status(200).json({ status: 'success', data: { event } });
    }
    catch (error) {
        next(error);
    }
};
exports.updateEventStatus = updateEventStatus;

import { Request, Response, NextFunction } from 'express';
import * as eventService from '../services/event.service';

export const createEvent = async (req: any, res: Response, next: NextFunction) => {
  try {
    const event = await eventService.createEvent(req.user.id, req.body);
    res.status(201).json({ status: 'success', data: { event } });
  } catch (error) {
    next(error);
  }
};

export const getMyEvents = async (req: any, res: Response, next: NextFunction) => {
  try {
    const events = await eventService.getClientEvents(req.user.id);
    res.status(200).json({ status: 'success', data: { events } });
  } catch (error) {
    next(error);
  }
};

export const getAllEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const events = await eventService.getAllEvents();
    res.status(200).json({ status: 'success', data: { events } });
  } catch (error) {
    next(error);
  }
};

export const getEventById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const event = await eventService.getEventById(req.params.id);
    res.status(200).json({ status: 'success', data: { event } });
  } catch (error) {
    next(error);
  }
};

export const updateEventStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const event = await eventService.updateEventStatus(req.params.id, req.body.status);
    res.status(200).json({ status: 'success', data: { event } });
  } catch (error) {
    next(error);
  }
};

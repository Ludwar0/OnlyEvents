import { Request, Response, NextFunction } from 'express';
import * as vendorService from '../services/vendor.service';

export const registerVendor = async (req: any, res: Response, next: NextFunction) => {
  try {
    const vendor = await vendorService.registerVendor(req.user.id, req.body);
    res.status(201).json({ status: 'success', data: { vendor } });
  } catch (error) {
    next(error);
  }
};

export const getAllVendors = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vendors = await vendorService.getAllVendors(req.query);
    res.status(200).json({ status: 'success', data: { vendors } });
  } catch (error) {
    next(error);
  }
};

export const getVendorById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vendor = await vendorService.getVendorById(req.params.id);
    res.status(200).json({ status: 'success', data: { vendor } });
  } catch (error) {
    next(error);
  }
};

export const approveVendor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vendor = await vendorService.approveVendor(req.params.id);
    res.status(200).json({ status: 'success', data: { vendor } });
  } catch (error) {
    next(error);
  }
};

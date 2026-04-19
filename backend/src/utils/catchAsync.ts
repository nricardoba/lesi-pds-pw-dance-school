import { RequestHandler } from 'express';

export const catchAsync = <T extends RequestHandler>(fn: T): RequestHandler => {
  return (req, res, next) => {
    try {
      return Promise.resolve(fn(req, res, next)).catch(next);
    } catch (error) {
      return next(error);
    }
  };
};

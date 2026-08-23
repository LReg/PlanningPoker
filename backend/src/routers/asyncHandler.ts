import { NextFunction, Request, Response } from "express";

/**
 * Express 4 (unlike 5) doesn't catch a rejected promise from an async route handler — it becomes
 * an unhandled rejection that crashes the process instead of a response. Every handler that talks
 * to Redis is async now, so this wraps them once instead of a try/catch in each of the ~15
 * handlers in sessionRouter.ts.
 */
export function asyncHandler(
    fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
    return (req: Request, res: Response, next: NextFunction): void => {
        fn(req, res, next).catch((error: unknown) => {
            console.error('Unhandled error in route handler:', error);
            if (!res.headersSent) {
                res.status(500).send('Internal error');
            }
        });
    };
}

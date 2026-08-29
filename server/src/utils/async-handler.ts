import type { RequestHandler } from "express";

export function asyncHandler(
    handler: RequestHandler,
): RequestHandler {
    return (request, response, next) => {
        Promise.resolve(handler(request, response, next)).catch(next);
    };
}
//  wrapper executes an async controller.
// A rejected promise is passed to Express using next(error).
// The error then reaches the final error middleware.
// Controllers do not need repetitive try/catch blocks.
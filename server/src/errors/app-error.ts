export class AppError extends Error {
  public readonly statusCode: number;
  public readonly safeMessage: string;

  public constructor(
    statusCode: number,
    safeMessage: string,
  ) {
    super(safeMessage);

    this.name = "AppError";
    this.statusCode = statusCode;
    this.safeMessage = safeMessage;

    Error.captureStackTrace(this, AppError);
  }
}

// - statusCode determines the HTTP response status.
// - safeMessage is suitable for exposing to clients.
// - The normal Error stack remains available for server-side debugging.
// - Internal database or implementation details should never become the client message.
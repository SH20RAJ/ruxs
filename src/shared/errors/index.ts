export type ErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_FAILED"
  | "CUTOFF_EXCEEDED"
  | "IDEMPOTENCY_CONFLICT"
  | "TENANT_MISMATCH"
  | "INSUFFICIENT_ASSET_BALANCE"
  | "PAYMENT_FAILED"
  | "INTERNAL_SERVER_ERROR";

export interface ErrorEnvelope {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: Record<string, any>;
  };
}

export interface SuccessEnvelope<T> {
  success: true;
  data: T;
  meta?: Record<string, any>;
}

export type ApiResponse<T> = SuccessEnvelope<T> | ErrorEnvelope;

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly statusCode: number = 400,
    public readonly details?: Record<string, any>
  ) {
    super(message);
    this.name = "AppError";
  }

  toEnvelope(): ErrorEnvelope {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
      },
    };
  }
}

export function createSuccessResponse<T>(data: T, meta?: Record<string, any>): SuccessEnvelope<T> {
  return {
    success: true,
    data,
    meta,
  };
}

export function createErrorResponse(
  code: ErrorCode,
  message: string,
  details?: Record<string, any>
): ErrorEnvelope {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };
}

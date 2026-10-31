import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public detail?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  const requestId = req.requestId ?? '-';

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.code ?? 'ERROR',
      message: err.message,
      requestId,
      ...(err.detail ? { detail: err.detail } : {}),
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: '请求参数校验失败',
      requestId,
      details: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    });
    return;
  }

  console.error(`[ERROR] Unhandled error:`, err);
  res.status(500).json({
    error: 'INTERNAL_ERROR',
    message: '服务暂时不可用，请稍后重试',
    requestId,
  });
}
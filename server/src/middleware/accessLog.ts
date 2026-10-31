import type { Request, Response, NextFunction } from 'express';

export function accessLogMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const { method, path, ip } = req;
  const requestId = req.requestId ?? '-';

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    const level = statusCode >= 500 ? 'ERROR' : statusCode >= 400 ? 'WARN' : 'INFO';
    console.log(`[${level}] ${method} ${path} ${statusCode} ${duration}ms ip=${ip} rid=${requestId}`);
  });

  next();
}
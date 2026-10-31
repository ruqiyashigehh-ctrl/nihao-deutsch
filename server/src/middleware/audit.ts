import type { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../dal/driver';
import { nowIso } from '../dal/types';

export function auditMiddleware(action: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const originalJson = res.json.bind(res);

    res.json = (body: unknown) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        writeAuditLog(req, res, action).catch((err) => {
          console.error('[audit] Failed to write audit log:', err);
        });
      }
      return originalJson(body);
    };

    next();
  };
}

async function writeAuditLog(req: Request, res: Response, action: string): Promise<void> {
  try {
    const db = await getDatabase();
    const target = req.params.id ?? req.params.type ?? null;
    await db.run(
      `INSERT INTO audit_logs (log_id, user_id, action, target, detail, ip, request_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        uuidv4(),
        req.user?.userId ?? null,
        action,
        target,
        JSON.stringify(req.body).slice(0, 2000),
        req.ip ?? null,
        req.requestId ?? null,
        nowIso(),
      ],
    );
  } catch (err) {
    console.error('[audit] Error:', err);
  }
}
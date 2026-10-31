import { z } from 'zod';

export const CheckpointItemSchema = z.object({
  checkpointId: z.string().uuid(),
  name: z.string(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radius: z.number().positive('半径必须大于0'),
  requireScan: z.boolean(),
});

export const CheckWindowSchema = z.object({
  windowId: z.string().uuid(),
  checkpointId: z.string().uuid(),
  startTime: z.string(),
  endTime: z.string(),
  weekdays: z.array(z.number().int().min(0).max(6)),
});

export const CheckinRequestSchema = z.object({
  checkpointId: z.string().uuid(),
  windowId: z.string().uuid(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().nonnegative(),
  scannedValue: z.string().nullable().optional(),
});

export const CheckinResponseSchema = z.object({
  recordId: z.string().uuid(),
  checkpointName: z.string(),
  checkedAt: z.string(),
  message: z.string(),
});

export const CheckRecordSchema = z.object({
  recordId: z.string().uuid(),
  checkpointId: z.string().uuid(),
  checkpointName: z.string(),
  windowId: z.string().uuid(),
  latitude: z.number(),
  longitude: z.number(),
  scannedValue: z.string().nullable(),
  checkedAt: z.string(),
});

export const CheckpointImportSchema = z.object({
  name: z.string().min(1, '打卡点名称不能为空'),
  latitude: z.number().min(-90, '纬度范围 -90~90').max(90, '纬度范围 -90~90'),
  longitude: z.number().min(-180, '经度范围 -180~180').max(180, '经度范围 -180~180'),
  radius: z.number().positive('半径必须大于0'),
  requireScan: z.boolean().default(false),
  externalId: z.string().optional(),
  isActive: z.boolean().optional(),
  remark: z.string().nullable().optional(),
});

export const WindowImportSchema = z.object({
  checkpointId: z.string().uuid(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, '时间格式 HH:mm'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, '时间格式 HH:mm'),
  weekdays: z.array(z.number().int().min(0).max(6)).default([0, 1, 2, 3, 4, 5, 6]),
  earliestTime: z.string().nullable().optional(),
  latestTime: z.string().nullable().optional(),
  allowLate: z.boolean().optional(),
  weekendEnabled: z.boolean().optional(),
  holidayEnabled: z.boolean().optional(),
}).refine((data) => data.endTime > data.startTime, {
  message: '结束时间必须晚于开始时间',
});

export type CheckpointItem = z.infer<typeof CheckpointItemSchema>;
export type CheckWindow = z.infer<typeof CheckWindowSchema>;
export type CheckinRequest = z.infer<typeof CheckinRequestSchema>;
export type CheckinResponse = z.infer<typeof CheckinResponseSchema>;
export type CheckRecord = z.infer<typeof CheckRecordSchema>;
export type CheckpointImport = z.infer<typeof CheckpointImportSchema>;
export type WindowImport = z.infer<typeof WindowImportSchema>;
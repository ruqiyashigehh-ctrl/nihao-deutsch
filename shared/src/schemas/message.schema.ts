import { z } from 'zod';

export const MessageItemSchema = z.object({
  messageId: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string(),
  content: z.string(),
  isRead: z.boolean(),
  createdAt: z.string(),
});

export const MessageListQuerySchema = z.object({
  isRead: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
});

export const BroadcastRequestSchema = z.object({
  classId: z.string().uuid(),
  title: z.string().min(1, '标题不能为空'),
  content: z.string().min(1, '内容不能为空'),
});

export const PushTemplateSchema = z.object({
  templateId: z.string().uuid(),
  code: z.string().min(1),
  title: z.string(),
  body: z.string(),
  variables: z.array(z.string()),
  createdAt: z.string(),
});

export const CreateTemplateSchema = z.object({
  code: z.string().min(1, '模板编码不能为空'),
  title: z.string().min(1, '标题不能为空'),
  body: z.string().min(1, '模板正文不能为空'),
  variables: z.array(z.string()).default([]),
}).refine(
  (data) => {
    const placeholders = data.body.match(/\{\{(\w+)\}\}/g)?.map((m) => m.slice(2, -2)) ?? [];
    return placeholders.every((p) => data.variables.includes(p));
  },
  { message: '模板正文中的变量占位符必须在 variables 列表中定义' },
);

export const UpdateTemplateSchema = z.object({
  title: z.string().min(1, '标题不能为空'),
  body: z.string().min(1, '模板正文不能为空'),
  variables: z.array(z.string()).default([]),
}).refine(
  (data) => {
    const placeholders = data.body.match(/\{\{(\w+)\}\}/g)?.map((m) => m.slice(2, -2)) ?? [];
    return placeholders.every((p) => data.variables.includes(p));
  },
  { message: '模板正文中的变量占位符必须在 variables 列表中定义' },
);

export const RenderTemplateSchema = z.object({
  code: z.string().min(1, '模板编码不能为空'),
  data: z.record(z.string(), z.string()).default({}),
});

export type MessageItem = z.infer<typeof MessageItemSchema>;
export type MessageListQuery = z.infer<typeof MessageListQuerySchema>;
export type BroadcastRequest = z.infer<typeof BroadcastRequestSchema>;
export type PushTemplate = z.infer<typeof PushTemplateSchema>;
export type CreateTemplate = z.infer<typeof CreateTemplateSchema>;
export type UpdateTemplate = z.infer<typeof UpdateTemplateSchema>;
export type RenderTemplate = z.infer<typeof RenderTemplateSchema>;
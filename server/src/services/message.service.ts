import { v4 as uuidv4 } from 'uuid';
import { messageRepository } from '../repositories/message.repository';
import { AppError } from '../middleware/errorHandler';
import { nowIso, toBool } from '../dal/types';

export class MessageService {
  async getList(userId: string, isRead?: boolean) {
    const rows = await messageRepository.findByUser(userId, isRead);
    return rows.map((m: any) => ({
      messageId: m.message_id, userId: m.user_id, title: m.title, content: m.content,
      isRead: toBool(m.is_read), createdAt: m.created_at,
    }));
  }
  async markRead(messageId: string) {
    await messageRepository.markRead(messageId);
  }
  async broadcast(classId: string, title: string, content: string) {
    const students = await messageRepository.findClassStudents(classId);
    if (students.length === 0) throw new AppError(404, '班级无学生', 'NO_STUDENTS');
    const createdAt = nowIso();
    for (const s of students) {
      await messageRepository.insert({ messageId: uuidv4(), userId: s.user_id, title, content, createdAt });
    }
    return { sent: students.length };
  }
  async getUnreadCount(userId: string) {
    return messageRepository.countUnread(userId);
  }
}
export const messageService = new MessageService();
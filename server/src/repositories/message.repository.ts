import { getDatabase } from '../dal/driver';

export class MessageRepository {
  async findByUser(userId: string, isRead?: boolean) {
    const db = await getDatabase();
    if (isRead !== undefined) {
      return db.query('SELECT * FROM messages WHERE user_id = ? AND is_read = ? ORDER BY created_at DESC', [userId, isRead ? 1 : 0]);
    }
    return db.query('SELECT * FROM messages WHERE user_id = ? ORDER BY created_at DESC', [userId]);
  }
  async insert(msg: { messageId: string; userId: string; title: string; content: string; createdAt: string }) {
    const db = await getDatabase();
    await db.run('INSERT INTO messages (message_id, user_id, title, content, is_read, created_at) VALUES (?, ?, ?, ?, 0, ?)', [msg.messageId, msg.userId, msg.title, msg.content, msg.createdAt]);
  }
  async markRead(messageId: string) {
    const db = await getDatabase();
    await db.run('UPDATE messages SET is_read = 1 WHERE message_id = ?', [messageId]);
  }
  async findClassStudents(classId: string) {
    const db = await getDatabase();
    return db.query<{ user_id: string }>('SELECT user_id FROM users WHERE class_id = ? AND status = ?', [classId, 'active']);
  }
  async countUnread(userId: string) {
    const db = await getDatabase();
    const rows = await db.query<{ cnt: number }>('SELECT COUNT(*) as cnt FROM messages WHERE user_id = ? AND is_read = 0', [userId]);
    return rows[0]?.cnt ?? 0;
  }
}
export const messageRepository = new MessageRepository();
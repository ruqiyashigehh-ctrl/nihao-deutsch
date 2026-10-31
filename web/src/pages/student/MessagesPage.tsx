import React, { useState, useEffect } from 'react';
import { PageContainer } from '../../components/PageContainer';
import { EmptyState } from '../../components/EmptyState';
import { Loading } from '../../components/Loading';
import { apiGet, apiPatch } from '../../api/client';
import { useMessageStore } from '../../store/messageStore';
import type { MessageItem } from '@nihao-deutsch/shared';

export const MessagesPage: React.FC = () => {
  const [items, setItems] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { setUnreadCount, decrement } = useMessageStore();

  const fetch = () => {
    setLoading(true);
    apiGet<MessageItem[]>('/messages').then((data) => {
      setItems(data);
      setUnreadCount(data.filter((m) => !m.isRead).length);
      setLoading(false);
    }).catch(() => setLoading(false));
  };
  useEffect(fetch, []);

  const handleRead = async (id: string) => {
    await apiPatch(`/messages/${id}/read`);
    setItems((prev) => prev.map((m) => m.messageId === id ? { ...m, isRead: true } : m));
    decrement();
  };

  return (
    <PageContainer title="消息中心">
      {loading ? <Loading /> : items.length === 0 ? <EmptyState messageKey="message.listEmpty" /> :
        items.map((m) => (
          <div key={m.messageId} onClick={() => !m.isRead && handleRead(m.messageId)} style={{ padding: 12, background: m.isRead ? '#faf7ef' : '#e2e7d7', borderRadius: 8, marginBottom: 8, cursor: m.isRead ? 'default' : 'pointer' }}>
            <div style={{ fontWeight: 600 }}>{m.title}{!m.isRead && <span style={{ color: '#33583f', fontSize: 12, marginLeft: 8 }}>未读</span>}</div>
            <div style={{ color: '#606b5a', fontSize: 14, marginTop: 4 }}>{m.content}</div>
            <div style={{ fontSize: 12, color: '#707866', marginTop: 2 }}>{new Date(m.createdAt).toLocaleString('zh-CN', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}</div>
          </div>
        ))
      }
    </PageContainer>
  );
};
export default MessagesPage;
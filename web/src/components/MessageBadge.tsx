import React from 'react';

interface MessageBadgeProps {
  unreadCount: number;
}

export const MessageBadge: React.FC<MessageBadgeProps> = ({ unreadCount }) => {
  if (unreadCount <= 0) return null;
  return (
    <span
      style={{
        display: 'inline-block',
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: '#a34334',
        marginLeft: 4,
      }}
    />
  );
};

export default MessageBadge;
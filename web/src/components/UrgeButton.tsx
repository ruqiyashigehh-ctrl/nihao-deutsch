import React, { useRef } from 'react';
import { Button, message } from 'antd';

interface UrgeButtonProps {
  studentId: string;
  context: string;
  onUrge: (studentId: string, context: string) => Promise<{ success: boolean; message: string }>;
}

export const UrgeButton: React.FC<UrgeButtonProps> = ({ studentId, context, onUrge }) => {
  const lastUrgeAt = useRef(0);

  const handleClick = async () => {
    const now = Date.now();
    if (now - lastUrgeAt.current < 5000) {
      message.warning('操作过于频繁，请稍后重试');
      return;
    }
    lastUrgeAt.current = now;
    const result = await onUrge(studentId, context);
    if (result.success) message.success(result.message);
    else message.error(result.message);
  };

  return (
    <Button size="small" type="link" danger onClick={handleClick}>
      一键催交
    </Button>
  );
};

export default UrgeButton;
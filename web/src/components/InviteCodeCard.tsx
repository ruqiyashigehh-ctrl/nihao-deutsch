import React from 'react';
import { Card, Statistic, Button, message } from 'antd';
import type { ClassInviteCode } from '../types/domain';

interface InviteCodeCardProps {
  inviteCodes: ClassInviteCode[];
}

export const InviteCodeCard: React.FC<InviteCodeCardProps> = ({ inviteCodes }) => {
  const handleCopy = (code: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).then(() => message.success('复制成功'));
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      message.success('复制成功');
    }
  };

  if (inviteCodes.length === 0) {
    return <Card title="班级邀请码"><div style={{ textAlign: 'center', color: '#707866', padding: 20 }}>暂无任教班级</div></Card>;
  }

  return (
    <Card title="班级邀请码">
      {inviteCodes.map((item) => (
        <div key={item.classId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 14, color: '#606b5a' }}>{item.className}</div>
            <Statistic value={item.inviteCode} valueStyle={{ fontSize: 32, fontWeight: 700, color: '#33583f', letterSpacing: 4 }} />
          </div>
          <Button type="primary" onClick={() => handleCopy(item.inviteCode)}>复制</Button>
        </div>
      ))}
    </Card>
  );
};

export default InviteCodeCard;
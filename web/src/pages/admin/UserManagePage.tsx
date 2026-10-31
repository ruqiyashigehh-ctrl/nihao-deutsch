import React, { useEffect, useState } from 'react';
import { Card, Tabs, Table, Button, Select, Modal, message } from 'antd';
import { useAdminStore } from '../../store/adminStore';

export const UserManagePage: React.FC = () => {
  const {
    classesWithTeacher, studentsWithClass,
    loadClassesWithTeacher, loadStudentsWithClass,
    bindTeacher, resetPassword,
  } = useAdminStore();
  const [bindModalOpen, setBindModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string>('');

  useEffect(() => {
    loadClassesWithTeacher();
    loadStudentsWithClass();
  }, [loadClassesWithTeacher, loadStudentsWithClass]);

  const handleBind = async (teacherId: string) => {
    await bindTeacher(selectedClassId, teacherId);
    message.success('绑定成功');
    setBindModalOpen(false);
    loadClassesWithTeacher();
  };

  const handleReset = (userId: string) => {
    Modal.confirm({
      title: '确认重置密码？',
      content: '重置后密码将恢复为默认值',
      onOk: async () => {
        await resetPassword(userId);
        message.success('重置成功');
      },
    });
  };

  const classColumns = [
    { title: '班级名称', dataIndex: 'className', key: 'className' },
    { title: '邀请码', dataIndex: 'inviteCode', key: 'inviteCode' },
    { title: '任课教师', dataIndex: 'teacherName', key: 'teacherName', render: (name: string | null) => name ?? '未绑定' },
    {
      title: '操作', key: 'action',
      render: (_: unknown, record: { classId: string }) => (
        <Button size="small" onClick={() => { setSelectedClassId(record.classId); setBindModalOpen(true); }}>绑定/更换老师</Button>
      ),
    },
  ];

  const studentColumns = [
    { title: '学号', dataIndex: 'studentNo', key: 'studentNo' },
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '所属班级', dataIndex: 'className', key: 'className', render: (name: string | null) => name ?? '未分班' },
    {
      title: '操作', key: 'action',
      render: (_: unknown, record: { userId: string }) => (
        <Button size="small" danger onClick={() => handleReset(record.userId)}>重置密码</Button>
      ),
    },
  ];

  return (
    <Card>
      <Tabs
        items={[
          {
            key: 'classes', label: '班级列表', children: (
              <Table dataSource={classesWithTeacher.map((c) => ({ ...c, key: c.classId }))} columns={classColumns} pagination={false} scroll={{ x: true }} />
            ),
          },
          {
            key: 'students', label: '学生列表', children: (
              <Table dataSource={studentsWithClass.map((s) => ({ ...s, key: s.userId }))} columns={studentColumns} pagination={{ pageSize: 20 }} scroll={{ x: true }} />
            ),
          },
        ]}
      />
      <Modal title="选择教师" open={bindModalOpen} onCancel={() => setBindModalOpen(false)} footer={null}>
        <Select
          style={{ width: '100%' }}
          placeholder="选择教师"
          options={[
            { value: 't001', label: '李老师' },
            { value: 't002', label: '王老师' },
            { value: 't003', label: '赵老师' },
          ]}
          onChange={handleBind}
        />
      </Modal>
    </Card>
  );
};

export default UserManagePage;
import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, InputNumber, Switch, message } from 'antd';
import { useAdminStore } from '../../store/adminStore';
import type { CheckinPointItem } from '../../types/domain';

export const CheckinPointPage: React.FC = () => {
  const { checkinPoints, checkinLoading, loadCheckinPoints, createCheckinPoint, toggleCheckinPoint } = useAdminStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadCheckinPoints();
  }, [loadCheckinPoints]);

  const handleCreate = async () => {
    const values = await form.validateFields();
    const result = await createCheckinPoint({
      name: values.name,
      latitude: values.latitude,
      longitude: values.longitude,
      radius: values.radius ?? 500,
      status: 'enabled',
    });
    if (result.success) {
      message.success(result.message);
      setModalOpen(false);
      form.resetFields();
    } else {
      message.error(result.message);
    }
  };

  const handleToggle = async (id: string, checked: boolean) => {
    await toggleCheckinPoint(id, checked ? 'enabled' : 'disabled');
    message.success(checked ? '已启用' : '已禁用');
  };

  const columns = [
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '经度', dataIndex: 'longitude', key: 'longitude' },
    { title: '纬度', dataIndex: 'latitude', key: 'latitude' },
    { title: '半径（米）', dataIndex: 'radius', key: 'radius' },
    {
      title: '状态', dataIndex: 'status', key: 'status',
      render: (status: string, record: CheckinPointItem) => (
        <Switch
          checked={status === 'enabled'}
          onChange={(checked) => handleToggle(record.checkpointId, checked)}
        />
      ),
    },
  ];

  return (
    <Card title="打卡点管理" extra={<Button type="primary" onClick={() => setModalOpen(true)}>新增打卡点</Button>}>
      <Table
        dataSource={checkinPoints.map((p) => ({ ...p, key: p.checkpointId }))}
        columns={columns}
        loading={checkinLoading}
        pagination={false}
        scroll={{ x: true }}
      />
      <Modal title="新增打卡点" open={modalOpen} onOk={handleCreate} onCancel={() => setModalOpen(false)}>
        <Form form={form} layout="vertical" initialValues={{ radius: 500 }}>
          <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="如：教学楼A" />
          </Form.Item>
          <Form.Item name="longitude" label="经度" rules={[{ required: true, message: '请输入经度' }]}>
            <InputNumber style={{ width: '100%' }} min={-180} max={180} placeholder="-180 ~ 180" />
          </Form.Item>
          <Form.Item name="latitude" label="纬度" rules={[{ required: true, message: '请输入纬度' }]}>
            <InputNumber style={{ width: '100%' }} min={-90} max={90} placeholder="-90 ~ 90" />
          </Form.Item>
          <Form.Item name="radius" label="半径（米）">
            <InputNumber style={{ width: '100%' }} min={1} placeholder="默认 500" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default CheckinPointPage;
import React, { useState } from 'react';
import { Form, Select, DatePicker, Radio, InputNumber, Button, Card, message } from 'antd';
import dayjs from 'dayjs';
import { useTeacherStore } from '../../store/teacherStore';
import type { PublishHomeworkPayload, QuizType, QuestionCount } from '../../types/domain';

export const PublishHomeworkPage: React.FC = () => {
  const { publishHomework } = useTeacherStore();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: {
    classIds: string[];
    lektionRange: number[];
    quizType: QuizType;
    questionCount: QuestionCount;
    deadline: dayjs.Dayjs;
  }) => {
    if (values.deadline.isBefore(dayjs())) {
      message.error('截止时间不能早于当前时间');
      return;
    }
    setSubmitting(true);
    const payload: PublishHomeworkPayload = {
      classIds: values.classIds,
      lektionRange: values.lektionRange,
      quizType: values.quizType,
      questionCount: values.questionCount,
      deadline: values.deadline.format('YYYY-MM-DD HH:mm'),
    };
    const result = await publishHomework(payload);
    setSubmitting(false);
    if (result.success) {
      message.success(result.message);
      form.resetFields();
    } else {
      message.error(result.message);
    }
  };

  return (
    <Card title="发布作业">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ quizType: 'vocab', questionCount: 10 }}
      >
        <Form.Item name="classIds" label="班级" rules={[{ required: true, message: '请选择至少一个班级' }]}>
          <Select mode="multiple" placeholder="选择班级（可多选）" options={[
            { value: 'c001', label: '德语A2班' },
            { value: 'c002', label: '德语B1班' },
            { value: 'c003', label: '德语A1班' },
            { value: 'c004', label: '德语B2班' },
          ]} />
        </Form.Item>

        <Form.Item name="lektionRange" label="Lektion 范围" rules={[{ required: true, message: '请选择 Lektion 范围' }]}>
          <Select mode="multiple" placeholder="选择 Lektion（可多选）" options={
            Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `L${i + 1}` }))
          } />
        </Form.Item>

        <Form.Item name="quizType" label="题型" rules={[{ required: true }]}>
          <Radio.Group>
            <Radio value="vocab">词汇测验</Radio>
            <Radio value="grammar">语法测验</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item name="questionCount" label="题量" rules={[{ required: true }]}>
          <Radio.Group>
            <Radio value={10}>10 题</Radio>
            <Radio value={20}>20 题</Radio>
            <Radio value={30}>30 题</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item name="deadline" label="截止时间" rules={[{ required: true, message: '请选择截止时间' }]}>
          <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting} block>
            发布并通知
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default PublishHomeworkPage;
import React, { useState } from 'react';
import { Card, Tabs, Table, Button, Select, Modal, Form, Input, Upload, message } from 'antd';
import { useAdminStore } from '../../store/adminStore';
import type { GrammarPointInput, GrammarExerciseInput } from '../../types/domain';

export const ResourceManagePage: React.FC = () => {
  const { saveGrammarPoint } = useAdminStore();
  const [lektion, setLektion] = useState(1);
  const [grammarModalOpen, setGrammarModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleSaveGrammar = async () => {
    const values = await form.validateFields();
    const input: GrammarPointInput = {
      title: values.title,
      ruleText: values.ruleText,
      exercises: values.exercises || [],
    };
    const result = await saveGrammarPoint(input);
    if (result.success) {
      message.success(result.message);
      setGrammarModalOpen(false);
      form.resetFields();
    } else {
      message.error(result.message);
    }
  };

  const wordColumns = [
    { title: '单词', dataIndex: 'lemma', key: 'lemma' },
    { title: '词性', dataIndex: 'pos', key: 'pos' },
    { title: '释义', dataIndex: 'meaning', key: 'meaning' },
    { title: '课程', dataIndex: 'course', key: 'course' },
  ];

  return (
    <Card>
      <Tabs
        items={[
          {
            key: 'words', label: '词库管理', children: (
              <div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <Select
                    value={lektion}
                    onChange={setLektion}
                    options={Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `L${i + 1}` }))}
                    style={{ width: 120 }}
                  />
                  <Upload showUploadList={false} beforeUpload={() => { message.success('导入成功'); return false; }}>
                    <Button>批量导入</Button>
                  </Upload>
                  <Button type="primary">新增单词</Button>
                </div>
                <Table dataSource={[]} columns={wordColumns} pagination={{ pageSize: 20 }} scroll={{ x: true }} />
              </div>
            ),
          },
          {
            key: 'grammar', label: '语法题库', children: (
              <div>
                <Button type="primary" onClick={() => setGrammarModalOpen(true)} style={{ marginBottom: 12 }}>录入语法点</Button>
                <Table dataSource={[]} columns={[
                  { title: '语法点', dataIndex: 'title', key: 'title' },
                  { title: '题目数', dataIndex: 'exerciseCount', key: 'exerciseCount' },
                ]} pagination={false} />
              </div>
            ),
          },
        ]}
      />
      <Modal title="录入语法点" open={grammarModalOpen} onOk={handleSaveGrammar} onCancel={() => setGrammarModalOpen(false)} width={700}>
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="语法点名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="如：动词变位" />
          </Form.Item>
          <Form.Item name="ruleText" label="讲解正文" rules={[{ required: true, message: '请填写讲解正文' }]}>
            <Input.TextArea rows={4} placeholder="语法讲解内容" />
          </Form.Item>
          <Form.Item label="题目集合（至少 10 道，含 G1 填空和 G2 改错）">
            <div style={{ color: '#707866', fontSize: 13 }}>请在下方逐题录入，题型选择 G1（填空）或 G2（改错）</div>
          </Form.Item>
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <Form.Item name={['exercises', i, 'type']} initialValue="G1" noStyle>
                <Select style={{ width: 80 }} options={[{ value: 'G1', label: 'G1' }, { value: 'G2', label: 'G2' }]} />
              </Form.Item>
              <Form.Item name={['exercises', i, 'question']} noStyle>
                <Input placeholder="题目" style={{ flex: 1 }} />
              </Form.Item>
              <Form.Item name={['exercises', i, 'answer']} noStyle>
                <Input placeholder="答案" style={{ flex: 1 }} />
              </Form.Item>
            </div>
          ))}
        </Form>
      </Modal>
    </Card>
  );
};

export default ResourceManagePage;
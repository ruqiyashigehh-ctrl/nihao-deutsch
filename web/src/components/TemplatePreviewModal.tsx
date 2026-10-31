import React, { useState, useMemo } from 'react';
import { Modal, Input, Typography, Alert } from 'antd';
import type { PushTemplate } from '@nihao-deutsch/shared';
import { renderTemplate } from '../utils/renderTemplate';

interface TemplatePreviewModalProps {
  open: boolean;
  template: PushTemplate | null;
  onClose: () => void;
}

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({ open, template, onClose }) => {
  const [jsonInput, setJsonInput] = useState('{\n  "studentName": "张三"\n}');

  const { renderedTitle, renderedBody, missing, jsonError } = useMemo(() => {
    if (!template) return { renderedTitle: '', renderedBody: '', missing: [], jsonError: null };
    let variables: Record<string, string | number>;
    try {
      variables = JSON.parse(jsonInput);
    } catch {
      return { renderedTitle: template.title, renderedBody: template.body, missing: [], jsonError: '模拟变量格式不正确，请输入合法 JSON' };
    }
    const titleResult = renderTemplate(template.title, variables);
    const bodyResult = renderTemplate(template.body, variables);
    return {
      renderedTitle: titleResult.rendered,
      renderedBody: bodyResult.rendered,
      missing: [...new Set([...titleResult.missing, ...bodyResult.missing])],
      jsonError: null as string | null,
    };
  }, [template, jsonInput]);

  return (
    <Modal title="模板预览" open={open} onCancel={onClose} footer={null} width={600}>
      {template && (
        <div>
          <div style={{ marginBottom: 12 }}>
            <Typography.Text strong>模拟变量（JSON 格式）：</Typography.Text>
            <Input.TextArea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              rows={4}
              style={{ marginTop: 4 }}
              placeholder='{"studentName":"张三","className":"德语A2班"}'
            />
          </div>

          {jsonError && <Alert type="error" message={jsonError} style={{ marginBottom: 12 }} />}

          {missing.length > 0 && (
            <Alert
              type="warning"
              message={`以下变量未提供：${missing.map((m) => `{{${m}}}`).join(', ')}`}
              style={{ marginBottom: 12 }}
            />
          )}

          <div style={{ background: '#f0eee3', borderRadius: 8, padding: 16 }}>
            <Typography.Text strong>渲染结果：</Typography.Text>
            <div style={{ marginTop: 8, fontSize: 16, fontWeight: 600 }}>{renderedTitle}</div>
            <div style={{ marginTop: 4, whiteSpace: 'pre-wrap', color: '#606b5a' }}>{renderedBody}</div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default TemplatePreviewModal;
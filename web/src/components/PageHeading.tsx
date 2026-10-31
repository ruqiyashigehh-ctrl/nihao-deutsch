import React from 'react';
interface PageHeadingProps { title: string; eyebrow?: string; description?: string; action?: React.ReactNode; }
export const PageHeading: React.FC<PageHeadingProps> = ({ title, eyebrow = '你好德语 · 学习空间', description, action }) => (
  <header className="paper-heading">
    <div><p className="paper-eyebrow">{eyebrow}</p><h1>{title}</h1>{description && <p className="paper-description">{description}</p>}</div>
    {action && <div className="paper-heading__action">{action}</div>}
  </header>
);

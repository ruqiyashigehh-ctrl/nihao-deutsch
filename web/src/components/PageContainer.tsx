import React from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { PageHeading } from './PageHeading';
interface PageContainerProps { title?: string; showBack?: boolean; onBack?: () => void; children: React.ReactNode; footer?: React.ReactNode; }
export const PageContainer: React.FC<PageContainerProps> = ({ title, showBack, onBack, children, footer }) => {
  const { pathname } = useLocation();
  const workspace = pathname.startsWith('/teacher') || pathname.startsWith('/admin');
  return (
    <section className="paper-page">
      {title && (!workspace || showBack) && <div className="paper-page__header">
        {showBack && <button className="paper-icon-button" onClick={onBack} aria-label="返回上一页"><ArrowLeftOutlined /></button>}
        <PageHeading title={title} eyebrow={workspace ? '教学工作台' : '你好德语 · 学习空间'} />
      </div>}
      <div className="paper-page__body">{children}</div>
      {footer && <footer className="paper-page__footer">{footer}</footer>}
    </section>
  );
};
export default PageContainer;

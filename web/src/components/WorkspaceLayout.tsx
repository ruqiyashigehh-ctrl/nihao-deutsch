import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PageHeading } from './PageHeading';
export interface WorkspaceMenuItem { key: string; label: string; icon: React.ReactNode; description?: string; }
interface WorkspaceLayoutProps { roleLabel: string; items: WorkspaceMenuItem[]; children: React.ReactNode; }
export const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = ({ roleLabel, items, children }) => {
  const { pathname } = useLocation();
  const current = [...items].sort((a,b) => b.key.length-a.key.length).find(item => pathname === item.key || pathname.startsWith(item.key+'/')) ?? items[0];
  return <div className="paper-workspace">
    <aside className="paper-workspace__sidebar">
      <div className="paper-workspace__brand"><span lang="de">Sprung.</span><small>你好德语 · {roleLabel}</small></div>
      <nav aria-label={roleLabel+'导航'} className="paper-workspace__nav">{items.map(item => <Link key={item.key} to={item.key} aria-current={current.key===item.key?'page':undefined}><span aria-hidden="true">{item.icon}</span><span>{item.label}</span></Link>)}</nav>
      <p className="paper-workspace__motto">让教学有据可循。<br /><span>让学习慢慢发生。</span></p>
    </aside>
    <main className="paper-workspace__main"><PageHeading title={current.label} eyebrow={'SPRUNG / '+roleLabel} description={current.description} /><div className="paper-workspace__body">{children}</div></main>
  </div>;
};

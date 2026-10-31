import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { HomeOutlined, BookOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import { STUDENT_TABS, FULLSCREEN_PATHS } from './studentTabs';
const icons = [<HomeOutlined />, <BookOutlined />, <TeamOutlined />, <UserOutlined />];
export const StudentLayout: React.FC = () => {
  const { pathname } = useLocation();
  const isFullscreen = FULLSCREEN_PATHS.some(p=>pathname.startsWith(p));
  const isStudyPage = pathname.startsWith('/student/words/study');
  return <div className={'paper-student'+(isStudyPage?' paper-student--study':'')+(isFullscreen?' paper-student--fullscreen':'')+(pathname==='/student/class'?' paper-student--class':'')}>
    {!isFullscreen && <div className="paper-brandbar"><span lang="de">Sprung.</span><small>你好德语 · 每日一点进步</small></div>}
    <main className="paper-student__main"><Outlet /></main>
    {!isFullscreen && <nav className="paper-bottom-nav" aria-label="学生导航"><div>{STUDENT_TABS.map((item,i)=>{
      const active = pathname.startsWith(item.path);
      return <Link key={item.path} to={item.path} aria-current={active?'page':undefined}><span className="paper-bottom-nav__icon" aria-hidden="true">{icons[i]}</span><span>{item.label}</span></Link>;
    })}</div></nav>}
  </div>;
};
export default StudentLayout;

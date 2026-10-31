import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Row, Col } from 'antd';
import { HomeOutlined, EditOutlined, BarChartOutlined, TeamOutlined, BellOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { WorkspaceLayout, type WorkspaceMenuItem } from '../../components/WorkspaceLayout';
import { useTeacherStore } from '../../store/teacherStore';
import { InviteCodeCard } from '../../components/InviteCodeCard';
const MENU_ITEMS:WorkspaceMenuItem[]=[
 {key:'/teacher',label:'教学首页',icon:<HomeOutlined />,description:'从一份作业、一堂早读，了解班级的每一点进步。'},
 {key:'/teacher/publish',label:'发布作业',icon:<EditOutlined />,description:'为班级安排合适的练习，把学习进度连接起来。'},
 {key:'/teacher/analytics',label:'数据看板',icon:<BarChartOutlined />,description:'查看掌握情况与早读出勤，让教学更有依据。'},
 {key:'/teacher/students',label:'学生管理',icon:<TeamOutlined />,description:'了解每位同学的学习记录与当前状态。'},
 {key:'/teacher/notify',label:'通知发送',icon:<BellOutlined />,description:'把重要的学习安排，清楚地传达给同学。'},
];
export const TeacherLayout:React.FC=()=>{
 const navigate=useNavigate();const {pathname}=useLocation();const {inviteCodes,loadInviteCodes}=useTeacherStore();
 useEffect(()=>{loadInviteCodes();},[loadInviteCodes]);
 const home=pathname==='/teacher'||pathname==='/teacher/';
 const entries=[{title:'发布作业',note:'安排下一次练习',icon:<EditOutlined />,path:'/teacher/publish'},{title:'班级正确率',note:'了解知识掌握情况',icon:<BarChartOutlined />,path:'/teacher/analytics'},{title:'早读考勤',note:'看见每天的坚持',icon:<EnvironmentOutlined />,path:'/teacher/analytics'},{title:'学生管理',note:'关注每一位同学',icon:<TeamOutlined />,path:'/teacher/students'}];
 return <WorkspaceLayout roleLabel="教师工作台" items={MENU_ITEMS}>{home?<><Row gutter={[16,16]} style={{marginBottom:20}}>{entries.map(entry=><Col xs={12} md={12} xl={6} key={entry.title}><button className="paper-workspace-entry" onClick={()=>navigate(entry.path)}>{entry.icon}<strong>{entry.title}</strong><small>{entry.note}</small></button></Col>)}</Row><InviteCodeCard inviteCodes={inviteCodes} /></>:<Outlet />}</WorkspaceLayout>;
};
export default TeacherLayout;

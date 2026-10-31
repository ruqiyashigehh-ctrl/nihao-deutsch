import React from 'react';
import { Outlet } from 'react-router-dom';
import { DashboardOutlined, EnvironmentOutlined, TeamOutlined, BookOutlined, ImportOutlined, FileTextOutlined } from '@ant-design/icons';
import { WorkspaceLayout, type WorkspaceMenuItem } from '../../components/WorkspaceLayout';
const MENU_ITEMS:WorkspaceMenuItem[]=[
 {key:'/admin/dashboard',label:'数据大盘',icon:<DashboardOutlined />,description:'在一处查看平台使用情况与近期学习趋势。'},
 {key:'/admin/checkin-points',label:'打卡点管理',icon:<EnvironmentOutlined />,description:'维护教学区域的打卡地点与使用状态。'},
 {key:'/admin/users',label:'账号班级管理',icon:<TeamOutlined />,description:'管理班级、教师关系与学生账号。'},
 {key:'/admin/resources',label:'教学资源管理',icon:<BookOutlined />,description:'整理词库与语法题库，让学习内容持续更新。'},
 {key:'/admin/import',label:'数据导入',icon:<ImportOutlined />,description:'按模板导入教学资料，并核对每一步处理结果。'},
 {key:'/admin/templates',label:'模板管理',icon:<FileTextOutlined />,description:'维护学习提醒、作业通知和周报的消息模板。'},
];
export const AdminLayout:React.FC=()=><WorkspaceLayout roleLabel="管理工作台" items={MENU_ITEMS}><Outlet /></WorkspaceLayout>;
export default AdminLayout;

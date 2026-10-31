import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageOutlined, LineChartOutlined, SettingOutlined, RightOutlined } from '@ant-design/icons';
import { useProfileStore } from '../../store/profileStore';
import { useMessageStore } from '../../store/messageStore';
import { StudyStatsCard } from '../../components/StudyStatsCard';
import { CalendarHeatmap } from '../../components/CalendarHeatmap';
import { MessageBadge } from '../../components/MessageBadge';
import { Loading } from '../../components/Loading';
import { PageHeading } from '../../components/PageHeading';
export const ProfilePage: React.FC = () => {
  const navigate=useNavigate();
  const {userProfile,studyStats,heatmap,loading,loadProfile}=useProfileStore();
  const unreadCount=useMessageStore(s=>s.unreadCount);
  useEffect(()=>{loadProfile();},[loadProfile]);
  if(loading&&!userProfile)return <Loading />;
  const menus=[{label:'消息中心',icon:<MessageOutlined />,path:'/student/messages',badge:true},{label:'学习报告',icon:<LineChartOutlined />,path:'/student/profile/report',badge:false},{label:'设置',icon:<SettingOutlined />,path:'/student/profile/settings',badge:false}];
  return <section>
    <PageHeading title="我的学习" eyebrow="学习足迹 / MY JOURNEY" description="那些微小的积累，正在成为你的底气。" />
    <div className="paper-card paper-profile-card"><div className="paper-profile-avatar" aria-hidden="true">{userProfile?.name?.[0]??'我'}</div><div><h2>{userProfile?.name??'学习者'}</h2><p>{userProfile?.className??'未分班'}</p></div></div>
    <StudyStatsCard totalWords={studyStats?.totalWords??0} masteredWords={studyStats?.masteredWords??0} weeklyCheckinDays={studyStats?.weeklyCheckinDays??0} loading={loading} />
    <CalendarHeatmap data={heatmap} />
    <div className="paper-card paper-menu-list">{menus.map(menu=><button className="paper-native-button" key={menu.path} onClick={()=>navigate(menu.path)}><span>{menu.icon}<span>{menu.label}</span>{menu.badge&&<MessageBadge unreadCount={unreadCount} />}</span><RightOutlined aria-hidden="true" /></button>)}</div>
  </section>;
};
export default ProfilePage;

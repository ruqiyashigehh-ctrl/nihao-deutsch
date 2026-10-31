import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightOutlined, BookOutlined, EditOutlined, ReadOutlined, MessageOutlined, FormOutlined } from '@ant-design/icons';
import { useMessageStore } from '../../store/messageStore';
import { useHomeworkStore } from '../../store/homeworkStore';
import { MessageBadge } from '../../components/MessageBadge';
import { TeacherHomeworkCard } from '../../components/TeacherHomeworkCard';
import { PageHeading } from '../../components/PageHeading';
export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const unreadCount = useMessageStore(s=>s.unreadCount);
  const { pendingList, loadPending } = useHomeworkStore();
  useEffect(()=>{loadPending();},[loadPending]);
  const entries = [
    { label:'词汇测验', note:'检验所学', icon:<EditOutlined />, path:'/student/quiz' },
    { label:'词库浏览', note:'慢慢积累', icon:<BookOutlined />, path:'/student/words' },
    { label:'语法学习', note:'理解规律', icon:<FormOutlined />, path:'/student/grammar' },
  ];
  return <section className="paper-home">
    <PageHeading title="你好，继续向前。" eyebrow="每日学习 / DAILY PRACTICE" description="把每天的一点时间，留给德语。" action={<button className="paper-icon-button" onClick={()=>navigate('/student/messages')} aria-label="消息中心"><MessageOutlined /><MessageBadge unreadCount={unreadCount} /></button>} />
    <button className="paper-home-hero" onClick={()=>navigate('/student/words/study')}>
      <span className="paper-home-hero__top"><small>DEUTSCH · 每日背词</small><ReadOutlined aria-hidden="true" /></span>
      <h2>一点进步，<br />每天发生。</h2><p>回想、聆听，再认识一个词。</p>
      <span className="paper-home-hero__bottom"><span>开始背词</span><ArrowRightOutlined aria-hidden="true" /></span>
    </button>
    <div className="paper-entry-grid">{entries.map(item=><button className="paper-entry" key={item.path} onClick={()=>navigate(item.path)}>{item.icon}<b>{item.label}</b><small>{item.note}</small></button>)}</div>
    <div className="paper-section-label"><h2>老师的作业</h2><span>{pendingList.length>0?pendingList.length+' 项待完成':'今日暂无待办'}</span></div>
    {pendingList.length>0 ? pendingList.map(hw=><TeacherHomeworkCard key={hw.homeworkId} homework={hw} onClick={id=>navigate(`/student/quiz/answer?homeworkId=${id}`)} />) : <div className="paper-card"><p className="paper-description">暂时没有待完成的作业，可以按自己的节奏继续学习。</p></div>}
    <div className="paper-home-note"><ReadOutlined aria-hidden="true" /><span>每一次认真练习，都在积累。</span></div>
  </section>;
};
export default HomePage;

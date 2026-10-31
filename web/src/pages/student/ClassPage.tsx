import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TeamOutlined, EnvironmentOutlined, BankOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useClassStore } from '../../store/classStore';
import { Loading } from '../../components/Loading';
import { EmptyState } from '../../components/EmptyState';
import { PageHeading } from '../../components/PageHeading';
import { RankTabs } from '../../components/RankTabs';
import { RankList } from '../../components/RankList';
import { MyRankFloatingBar } from '../../components/MyRankFloatingBar';
import { DeskMatePairingModal } from '../../components/DeskMatePairingModal';
import type { RankType } from '../../types/domain';
export const ClassPage: React.FC = () => {
  const navigate=useNavigate();
  const {classes,loading,loadClasses,rankType,rankList,myRank,rankLoading,loadRank,setRankType,classmates,classmatesLoading,loadClassmates,pair}=useClassStore();
  const [pairingOpen,setPairingOpen]=useState(false);
  useEffect(()=>{loadClasses();loadRank('reading');},[loadClasses,loadRank]);
  const handleTabChange=(type:RankType)=>{setRankType(type);loadRank(type);};
  const openPairing=()=>{loadClassmates();setPairingOpen(true);};
  return <section className="paper-class">
    <PageHeading title="我的班级" eyebrow="一起进步 / TOGETHER" description="和同学一起，把坚持变成日常。" action={<button className="paper-button paper-button--quiet" onClick={openPairing}><TeamOutlined aria-hidden="true" />同桌组队</button>} />
    {loading?<Loading />:classes.length===0?<EmptyState message="暂无班级信息" />:classes.map(c=><div className="paper-card paper-class-card" key={c.classId}><BankOutlined aria-hidden="true" /><div><strong>{c.className}</strong><p>同一间课堂，不同的一点进步。</p></div></div>)}
    <button className="paper-button paper-button--primary paper-button--wide" onClick={()=>navigate('/student/checkin')}><EnvironmentOutlined aria-hidden="true" />去打卡<ArrowRightOutlined aria-hidden="true" /></button>
    <div className="paper-section-label"><h2>班级学习榜</h2><span>每一步坚持，都算数</span></div>
    <RankTabs type={rankType} onChange={handleTabChange} /><RankList items={rankList} loading={rankLoading} type={rankType} /><MyRankFloatingBar myRank={myRank} type={rankType} />
    <DeskMatePairingModal open={pairingOpen} classmates={classmates} loading={classmatesLoading} onClose={()=>setPairingOpen(false)} onPair={pair} />
  </section>;
};
export default ClassPage;

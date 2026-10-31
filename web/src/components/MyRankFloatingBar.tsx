import React from 'react';
import type { MyRank,RankType } from '../types/domain';
interface MyRankFloatingBarProps {myRank:MyRank|null;type:RankType;}
export const MyRankFloatingBar:React.FC<MyRankFloatingBarProps>=({myRank,type})=>{
 if(!myRank||myRank.rank==='unranked')return null;
 return <div className="paper-my-rank" aria-label="我的排名"><span><small>我的排名</small><b>{String(myRank.rank).padStart(2,'0')}</b></span><span>{myRank.value}<small> {type==='reading'?'天早读':'个单词'}</small></span></div>;
};
export default MyRankFloatingBar;

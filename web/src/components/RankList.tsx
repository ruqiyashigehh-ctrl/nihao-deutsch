import React from 'react';
import type { RankItem,RankType } from '../types/domain';
import { Loading } from './Loading';
import { EmptyState } from './EmptyState';
interface RankListProps {items:RankItem[];loading:boolean;type:RankType;}
export const RankList:React.FC<RankListProps>=({items,loading,type})=>{
 if(loading)return <Loading />;if(items.length===0)return <EmptyState message="暂无排行数据" />;
 return <div className="paper-rank-list"><div className="paper-rank-list__header"><span>排名</span><span>同学</span><span>{type==='reading'?'早读打卡':'学习词汇'}</span></div>{items.map(item=><div key={item.studentId} className={'paper-rank-row'+(item.isMe?' paper-rank-row--me':'')}><span className={'paper-rank-row__number'+(item.rank<=3?' paper-rank-row__number--top':'')}>{String(item.rank).padStart(2,'0')}</span><span>{item.name}{item.isMe&&'（我）'}</span><span className="paper-rank-row__value"><b>{item.value}</b>{type==='reading'?'天':'词'}</span></div>)}</div>;
};
export default RankList;

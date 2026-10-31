import React from 'react';
import type { RankType } from '../types/domain';
interface RankTabsProps {type:RankType;onChange:(type:RankType)=>void;}
export const RankTabs:React.FC<RankTabsProps>=({type,onChange})=><div className="paper-segments" aria-label="排行榜类型">{([{key:'reading',label:'早读榜'},{key:'vocab',label:'单词榜'}] as const).map(tab=><button className="paper-native-button" key={tab.key} aria-pressed={type===tab.key} onClick={()=>onChange(tab.key)}>{tab.label}</button>)}</div>;
export default RankTabs;

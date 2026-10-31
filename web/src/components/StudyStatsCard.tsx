import React from 'react';
interface StudyStatsCardProps {totalWords:number;masteredWords:number;weeklyCheckinDays:number;loading?:boolean;}
export const StudyStatsCard:React.FC<StudyStatsCardProps>=({totalWords,masteredWords,weeklyCheckinDays,loading})=><div className="paper-stats">{[{label:'累计背词',value:totalWords},{label:'已掌握',value:masteredWords},{label:'本周打卡',value:weeklyCheckinDays}].map((card,i)=><div key={card.label}><strong className={i===2?'paper-stats__warm':undefined}>{loading?'—':card.value}</strong><span>{card.label}</span></div>)}</div>;
export default StudyStatsCard;

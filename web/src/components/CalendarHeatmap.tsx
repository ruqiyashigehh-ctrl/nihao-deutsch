import React from 'react';
import type { HeatmapData,HeatmapLevel } from '../types/domain';
interface CalendarHeatmapProps {data:HeatmapData[];weeks?:number;}
const LEVEL_COLORS:Record<HeatmapLevel,string>={0:'#e4e7da',1:'#c4d1b6',2:'#97b080',3:'#668357',4:'#33583f'};
export const CalendarHeatmap:React.FC<CalendarHeatmapProps>=({data,weeks=12})=>{
 const display=data.slice(-weeks*7);const columns:HeatmapData[][]=[];for(let i=0;i<display.length;i+=7)columns.push(display.slice(i,i+7));
 return <section className="paper-card paper-calendar" aria-label="近期打卡记录"><div className="paper-calendar__heading"><h3>学习留下的痕迹</h3><span>近 {weeks} 周</span></div>{data.length===0?<p className="paper-description">还没有打卡记录，从今天开始吧。</p>:<div className="paper-calendar__grid">{columns.map((week,i)=><div className="paper-calendar__week" key={i}>{week.map(day=><div className="paper-calendar__day" key={day.date} title={day.date+' · 活跃程度 '+day.level+'/4'} role="img" aria-label={day.date+'，活跃程度 '+day.level+'/4'} style={{background:LEVEL_COLORS[day.level]}} />)}</div>)}</div>}<div className="paper-calendar__legend"><span>少</span>{([0,1,2,3,4] as HeatmapLevel[]).map(l=><i key={l} style={{background:LEVEL_COLORS[l]}} aria-hidden="true" />)}<span>多</span></div></section>;
};
export default CalendarHeatmap;

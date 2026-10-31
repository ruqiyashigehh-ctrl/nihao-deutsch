import React,{useRef,useEffect} from 'react';
import * as echarts from 'echarts/core';
import {LineChart} from 'echarts/charts';
import {GridComponent,TooltipComponent,TitleComponent} from 'echarts/components';
import {CanvasRenderer} from 'echarts/renderers';
import {EmptyState} from './EmptyState';
echarts.use([LineChart,GridComponent,TooltipComponent,TitleComponent,CanvasRenderer]);
interface EChartLineProps {xAxis:string[];series:{name:string;data:number[]}[];height?:number;}
export const EChartLine:React.FC<EChartLineProps>=React.memo(({xAxis,series,height=300})=>{
 const ref=useRef<HTMLDivElement>(null);const chartRef=useRef<echarts.ECharts|null>(null);
 const hasData=series.some(s=>s.data.some(d=>d!==0));
 useEffect(()=>{if(!hasData||!ref.current)return;const chart=echarts.init(ref.current);chartRef.current=chart;const resize=new ResizeObserver(()=>chart.resize());resize.observe(ref.current);return()=>{resize.disconnect();chart.dispose();chartRef.current=null;};},[hasData]);
 useEffect(()=>{if(!chartRef.current||!hasData)return;chartRef.current.setOption({color:['#43654e','#9d5f3f','#a3752d'],textStyle:{color:'#606b5a',fontFamily:'sans-serif'},grid:{left:36,right:16,top:24,bottom:30,containLabel:true},tooltip:{trigger:'axis',backgroundColor:'#faf7ef',borderColor:'#cbd1bd',textStyle:{color:'#263c32'}},xAxis:{type:'category',data:xAxis,axisLine:{lineStyle:{color:'#cbd1bd'}},axisTick:{show:false}},yAxis:{type:'value',splitLine:{lineStyle:{color:'#e0e3d5'}}},series:series.map(s=>({...s,type:'line',smooth:true,symbolSize:7,lineStyle:{width:2.5}}))});},[xAxis,series,hasData]);
 if(!hasData)return <EmptyState message="暂无数据" />;
 return <div ref={ref} style={{width:'100%',height,minWidth:0}} role="img" aria-label="近期数据趋势折线图" />;
});
export default EChartLine;

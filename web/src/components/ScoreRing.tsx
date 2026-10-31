import React from 'react';
interface ScoreRingProps {score:number;size?:number;suffix?:string;}
export const ScoreRing:React.FC<ScoreRingProps>=({score,size=120,suffix=''})=>{
 const value=Math.max(0,Math.min(100,score));const strokeWidth=6;const radius=(size-strokeWidth)/2;const length=2*Math.PI*radius;const half=size/2;
 return <div style={{position:'relative',width:size,height:size,flexShrink:0,margin:'0 auto'}} role="img" aria-label={score+suffix}><svg width={size} height={size} aria-hidden="true"><circle cx={half} cy={half} r={radius} fill="none" stroke="#dce1d0" strokeWidth={strokeWidth} /><circle cx={half} cy={half} r={radius} fill="none" stroke="#43654e" strokeWidth={strokeWidth} strokeDasharray={length} strokeDashoffset={length-value/100*length} strokeLinecap="round" transform={'rotate(-90 '+half+' '+half+')'} style={{transition:'stroke-dashoffset .35s'}} /></svg><div className="paper-score-number" style={{position:'absolute',inset:0,display:'flex',justifyContent:'center',alignItems:'center',fontSize:size*.32,color:'#33583f'}}>{score}{suffix&&<span style={{fontSize:size*.13,marginLeft:2}}>{suffix}</span>}</div></div>;
};
export default ScoreRing;

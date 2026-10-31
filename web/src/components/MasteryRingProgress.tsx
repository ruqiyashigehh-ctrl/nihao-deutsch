import React from 'react';
import type { LektionMastery } from '../types/domain';
import { ScoreRing } from './ScoreRing';
interface MasteryRingProgressProps { mastery:LektionMastery;size?:number; }
export const MasteryRingProgress=React.memo<MasteryRingProgressProps>(({mastery,size=88})=>{
  const percent=mastery.total>0?Math.round(mastery.mastered/mastery.total*100):0;
  return <div aria-label={'掌握度 '+percent+'%'}><ScoreRing score={percent} size={size} suffix="%" /></div>;
});
export default MasteryRingProgress;

import React from 'react';
import { StarOutlined, StarFilled } from '@ant-design/icons';
interface VocabNotebookButtonProps {wordId:string;added:boolean;onToggle:(wordId:string)=>void;}
export const VocabNotebookButton:React.FC<VocabNotebookButtonProps>=({wordId,added,onToggle})=><button className="paper-notebook" aria-label={added?'移出生词本':'加入生词本'} aria-pressed={added} onClick={e=>{e.stopPropagation();onToggle(wordId);}}>{added?<StarFilled aria-hidden="true" />:<StarOutlined aria-hidden="true" />}<span>{added?'已收藏':'生词本'}</span></button>;
export default VocabNotebookButton;

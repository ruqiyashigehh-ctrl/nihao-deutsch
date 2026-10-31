import React from 'react';
import { FileTextOutlined, RightOutlined } from '@ant-design/icons';
import type { HomeworkCardData } from '../types/domain';
interface TeacherHomeworkCardProps { homework: HomeworkCardData; onClick: (homeworkId: string) => void; }
function deadlineLabel(value:string):string { const d=new Date(value);return Number.isNaN(d.getTime())?value:new Intl.DateTimeFormat('zh-CN',{month:'long',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false}).format(d); }
export const TeacherHomeworkCard=React.memo<TeacherHomeworkCardProps>(({homework,onClick})=><button className="paper-homework" onClick={()=>onClick(homework.homeworkId)}><span className="paper-homework__icon" aria-hidden="true"><FileTextOutlined /></span><span className="paper-homework__body"><strong>{homework.quizName}</strong><time dateTime={homework.deadline}>{deadlineLabel(homework.deadline)} 截止</time></span><RightOutlined className="paper-homework__arrow" aria-hidden="true" /></button>);
export default TeacherHomeworkCard;

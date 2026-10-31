import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SettingOutlined } from '@ant-design/icons';
import { PageContainer } from './PageContainer';
interface PagePlaceholderProps {title:string;}
export const PagePlaceholder:React.FC<PagePlaceholderProps>=({title})=>{
 const navigate=useNavigate();
 return <PageContainer title={title} showBack onBack={()=>navigate(-1)}><div className="paper-card paper-empty"><SettingOutlined className="paper-empty__icon" aria-hidden="true" /><h2 style={{fontWeight:500,fontSize:18}}>更多个性化选项，正在准备中。</h2><p>你可以先返回，继续今天的学习。</p><button className="paper-button" onClick={()=>navigate(-1)}>返回上一页</button></div></PageContainer>;
};
export default PagePlaceholder;

import React from 'react';
import { ReadOutlined } from '@ant-design/icons';
import { t,type CopywritingKey } from '@nihao-deutsch/shared';
interface EmptyStateProps {messageKey?:CopywritingKey;message?:string;action?:React.ReactNode;}
export const EmptyState:React.FC<EmptyStateProps>=({messageKey,message,action})=><div className="paper-empty"><ReadOutlined className="paper-empty__icon" aria-hidden="true" /><p>{message??(messageKey?t(messageKey):'暂无数据')}</p>{action}</div>;
export default EmptyState;

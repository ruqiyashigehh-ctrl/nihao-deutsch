import React from 'react';
export const Loading:React.FC<{message?:string}>=({message='加载中…'})=><div className="paper-loading" role="status">{message}</div>;
export default Loading;

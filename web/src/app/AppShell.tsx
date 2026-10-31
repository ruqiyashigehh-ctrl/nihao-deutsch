import React from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { AdapterProvider } from './adapterProvider';
import { paperTheme } from '../styles/paperTheme';
import '../styles/paper.css';
interface AppShellProps { children: React.ReactNode; }
export const AppShell: React.FC<AppShellProps> = ({ children }) => (
  <ConfigProvider theme={paperTheme} locale={zhCN}><AdapterProvider><div className="app-shell paper-app">{children}</div></AdapterProvider></ConfigProvider>
);
export default AppShell;

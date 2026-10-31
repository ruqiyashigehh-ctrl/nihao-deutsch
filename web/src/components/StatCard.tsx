import React from 'react';
import { Card, Statistic } from 'antd';

interface StatCardProps {
  title: string;
  value: number;
  suffix?: string;
  icon?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, suffix, icon }) => (
  <Card>
    <Statistic title={title} value={value} suffix={suffix} prefix={icon} />
  </Card>
);

export default StatCard;
import React, { useEffect } from 'react';
import { Row, Col, Button, Spin } from 'antd';
import { UserOutlined, CheckCircleOutlined, BookOutlined, FileTextOutlined } from '@ant-design/icons';
import { useAdminStore } from '../../store/adminStore';
import { StatCard } from '../../components/StatCard';
import { EChartLine } from '../../components/EChartLine';

export const AdminDashboardPage: React.FC = () => {
  const { stats, trend, loadStats, loadTrend } = useAdminStore();

  useEffect(() => {
    Promise.all([loadStats(), loadTrend()]);
  }, [loadStats, loadTrend]);

  if (!stats) {
    return <div style={{ textAlign: 'center', padding: 40 }}><Spin size="large" /></div>;
  }

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={12} md={6}>
          <StatCard title="总注册人数" value={stats.totalUsers} icon={<UserOutlined />} />
        </Col>
        <Col xs={12} sm={12} md={6}>
          <StatCard title="今日打卡率" value={stats.todayCheckinRate} suffix="%" icon={<CheckCircleOutlined />} />
        </Col>
        <Col xs={12} sm={12} md={6}>
          <StatCard title="今日人均背词量" value={stats.todayAvgWords} icon={<BookOutlined />} />
        </Col>
        <Col xs={12} sm={12} md={6}>
          <StatCard title="今日测验总数" value={stats.todayQuizCount} icon={<FileTextOutlined />} />
        </Col>
      </Row>
      <div className="paper-panel" style={{ background: '#faf7ef', borderRadius: 8, padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>近 7 天打卡人数趋势</h3>
          <Button onClick={() => { loadStats(); loadTrend(); }}>刷新</Button>
        </div>
        {trend && (
          <EChartLine
            xAxis={trend.dates.map((d) => d.slice(5))}
            series={[{ name: '打卡人数', data: trend.counts }]}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/PageContainer';
import { StudyTrendChart } from '../../components/StudyTrendChart';
import { useProfileStore } from '../../store/profileStore';

const cardStyle: React.CSSProperties = { background: '#faf7ef', borderRadius: 8, padding: 16, marginTop: 12 };
const cardTitleStyle: React.CSSProperties = { fontWeight: 600, color: '#33583f', marginBottom: 12, fontSize: 16 };

export const StudyReportPage: React.FC = () => {
  const navigate = useNavigate();
  const { reportData, reportDetail, loadReport, loadReportDetail } = useProfileStore();

  useEffect(() => {
    loadReport();
    loadReportDetail();
  }, [loadReport, loadReportDetail]);

  const weakGrammars = reportDetail?.weakGrammars ?? [];
  const wrongQuestions = reportDetail?.wrongQuestions ?? [];
  const wrongCount = reportDetail?.wrongCount ?? 0;

  return (
    <PageContainer title="学习报告" showBack onBack={() => navigate('/student/profile')}>
      <StudyTrendChart data={reportData} />

      <div className="paper-panel" style={cardStyle}>
        <div style={cardTitleStyle}>需加强的语法</div>
        {weakGrammars.length === 0 ? (
          <div style={{ color: '#707866', fontSize: 14 }}>暂无明显薄弱语法，继续保持！</div>
        ) : (
          weakGrammars.map((g) => (
            <div key={g.grammarId} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: '#263c32' }}>
                  {g.title}
                  {g.lektion != null && (
                    <span style={{ color: '#707866', fontSize: 12 }}>（第 {g.lektion} 单元）</span>
                  )}
                </span>
                <span style={{ color: g.accuracy < 50 ? '#a34334' : '#9d5f3f', fontWeight: 600 }}>{g.accuracy}%</span>
              </div>
              <div style={{ height: 6, background: '#e4e7da', borderRadius: 3, marginTop: 6 }}>
                <div
                  style={{
                    height: '100%',
                    width: `${g.accuracy}%`,
                    background: g.accuracy < 50 ? '#a34334' : '#9d5f3f',
                    borderRadius: 3,
                  }}
                />
              </div>
              <div style={{ fontSize: 12, color: '#707866', marginTop: 4 }}>共 {g.total} 次作答，错 {g.wrong} 次</div>
            </div>
          ))
        )}
      </div>

      <div className="paper-panel" style={cardStyle}>
        <div style={cardTitleStyle}>
          错题本
          <span style={{ color: '#707866', fontWeight: 400, fontSize: 12, marginLeft: 8 }}>累计 {wrongCount} 题</span>
        </div>
        {wrongQuestions.length === 0 ? (
          <div style={{ color: '#707866', fontSize: 14 }}>暂无错题记录</div>
        ) : (
          wrongQuestions.map((w, i) => (
            <div
              key={`${w.source}-${i}`}
              style={{
                borderTop: i === 0 ? 'none' : '1px solid #e4e7da',
                paddingTop: i === 0 ? 0 : 10,
                marginTop: i === 0 ? 0 : 10,
              }}
            >
              <div style={{ fontSize: 14, color: '#263c32', lineHeight: 1.5 }}>{w.question}</div>
              <div style={{ fontSize: 13, marginTop: 6 }}>
                <span style={{ color: '#a34334' }}>你的答案：{w.userAnswer}</span>
                <span style={{ color: '#43654e', marginLeft: 12 }}>正确答案：{w.correctAnswer}</span>
              </div>
              <div style={{ fontSize: 12, color: '#707866', marginTop: 4 }}>
                {w.source === 'quiz' ? '刷题' : '课后练习'}
                {w.grammarTitle ? ` · ${w.grammarTitle}` : ''}
                {w.lektion != null ? ` · 第 ${w.lektion} 单元` : ''}
                {w.createdAt ? ` · ${w.createdAt.slice(0, 10)}` : ''}
              </div>
            </div>
          ))
        )}
      </div>
    </PageContainer>
  );
};

export default StudyReportPage;
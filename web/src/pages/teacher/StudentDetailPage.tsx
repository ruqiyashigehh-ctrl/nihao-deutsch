import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/PageContainer';
import { EmptyState } from '../../components/EmptyState';
import { Loading } from '../../components/Loading';
import { apiGet } from '../../api/client';
import { t } from '@nihao-deutsch/shared';
import type { ReportDetailData } from '../../types/domain';

interface StudentDetail {
  userId: string;
  studentNo: string;
  name: string;
  classId: string | null;
  className: string | null;
  status: 'active' | 'disabled';
  createdAt: string;
}

interface CheckinRecord {
  recordId: string;
  checkpointId: string;
  checkpointName: string;
  windowId: string;
  latitude: number;
  longitude: number;
  scannedValue: string | null;
  checkedAt: string;
}

interface ExerciseRecord {
  recordId: string;
  exerciseId: string;
  grammarId: string;
  grammarTitle: string;
  type: string;
  question: string;
  answer: string;
  userAnswer: string;
  isCorrect: boolean;
  submittedAt: string;
}

type Tab = 'report' | 'checkin' | 'exercise';

export const StudentDetailPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<StudentDetail | null>(null);
  const [checkinRecords, setCheckinRecords] = useState<CheckinRecord[]>([]);
  const [exerciseRecords, setExerciseRecords] = useState<ExerciseRecord[]>([]);
  const [reportDetail, setReportDetail] = useState<ReportDetailData | null>(null);
  const [tab, setTab] = useState<Tab>('report');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    Promise.all([
      apiGet<StudentDetail>(`/teacher/students/${userId}`),
      apiGet<CheckinRecord[]>(`/teacher/students/${userId}/checkin-records`),
      apiGet<ExerciseRecord[]>(`/teacher/students/${userId}/exercise-records`),
      apiGet<ReportDetailData>(`/teacher/students/${userId}/report`).catch(() => null),
    ])
      .then(([d, c, e, r]) => {
        setDetail(d); setCheckinRecords(c); setExerciseRecords(e); setReportDetail(r); setLoading(false);
      })
      .catch(() => { setError(t('teacher.loadFailed')); setLoading(false); });
  }, [userId]);

  if (loading) return <PageContainer title="学生详情" showBack onBack={() => navigate(-1)}><Loading /></PageContainer>;
  if (error) return <PageContainer title="学生详情" showBack onBack={() => navigate(-1)}><EmptyState message={error} /></PageContainer>;
  if (!detail) return <PageContainer title="学生详情" showBack onBack={() => navigate(-1)}><EmptyState messageKey="teacher.studentDetailEmpty" /></PageContainer>;

  const exerciseAccuracy = exerciseRecords.length > 0
    ? Math.round((exerciseRecords.filter((r) => r.isCorrect).length / exerciseRecords.length) * 100)
    : 0;
  const weakGrammars = reportDetail?.weakGrammars ?? [];
  const wrongQuestions = reportDetail?.wrongQuestions ?? [];

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: 8, border: 'none', borderRadius: 6, cursor: 'pointer',
    background: active ? '#33583f' : '#e4e7da', color: active ? '#faf7ef' : '#263c32',
  });

  return (
    <PageContainer title={`${detail.name}（${detail.studentNo}）`} showBack onBack={() => navigate(-1)}>
      <div className="paper-panel" style={{ background: '#faf7ef', borderRadius: 8, padding: 16, marginBottom: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 14 }}>
          <div>班级: {detail.className ?? '未分班'}</div>
          <div>状态: <span style={{ color: detail.status === 'active' ? '#43654e' : '#a34334' }}>{detail.status === 'active' ? '正常' : '禁用'}</span></div>
          <div>打卡次数: {checkinRecords.length}</div>
          <div>练习题数: {exerciseRecords.length}（正确率 {exerciseAccuracy}%）</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button className="paper-native-button" onClick={() => setTab('report')} style={tabStyle(tab === 'report')}>学习报告</button>
        <button className="paper-native-button" onClick={() => setTab('checkin')} style={tabStyle(tab === 'checkin')}>打卡记录</button>
        <button className="paper-native-button" onClick={() => setTab('exercise')} style={tabStyle(tab === 'exercise')}>练习记录</button>
      </div>

      {tab === 'report' && (
        <>
          <div className="paper-panel" style={{ background: '#faf7ef', borderRadius: 8, padding: 16, marginBottom: 12 }}>
            <div style={{ fontWeight: 600, color: '#33583f', marginBottom: 12 }}>需加强的语法</div>
            {weakGrammars.length === 0 ? (
              <div style={{ color: '#707866', fontSize: 14 }}>暂无明显薄弱语法</div>
            ) : (
              weakGrammars.map((g) => (
                <div key={g.grammarId} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                    <span style={{ color: '#263c32' }}>
                      {g.title}
                      {g.lektion != null && <span style={{ color: '#707866', fontSize: 12 }}>（第 {g.lektion} 单元）</span>}
                    </span>
                    <span style={{ color: g.accuracy < 50 ? '#a34334' : '#9d5f3f', fontWeight: 600 }}>{g.accuracy}%</span>
                  </div>
                  <div style={{ height: 6, background: '#e4e7da', borderRadius: 3, marginTop: 6 }}>
                    <div style={{ height: '100%', width: `${g.accuracy}%`, background: g.accuracy < 50 ? '#a34334' : '#9d5f3f', borderRadius: 3 }} />
                  </div>
                  <div style={{ fontSize: 12, color: '#707866', marginTop: 4 }}>共 {g.total} 次作答，错 {g.wrong} 次</div>
                </div>
              ))
            )}
          </div>

          <div className="paper-panel" style={{ background: '#faf7ef', borderRadius: 8, padding: 16 }}>
            <div style={{ fontWeight: 600, color: '#33583f', marginBottom: 12 }}>
              错题本
              <span style={{ color: '#707866', fontWeight: 400, fontSize: 12, marginLeft: 8 }}>累计 {reportDetail?.wrongCount ?? 0} 题</span>
            </div>
            {wrongQuestions.length === 0 ? (
              <div style={{ color: '#707866', fontSize: 14 }}>暂无错题记录</div>
            ) : (
              wrongQuestions.map((w, i) => (
                <div
                  key={`${w.source}-${i}`}
                  style={{ borderTop: i === 0 ? 'none' : '1px solid #e4e7da', paddingTop: i === 0 ? 0 : 10, marginTop: i === 0 ? 0 : 10 }}
                >
                  <div style={{ fontSize: 14, color: '#263c32', lineHeight: 1.5 }}>{w.question}</div>
                  <div style={{ fontSize: 13, marginTop: 6 }}>
                    <span style={{ color: '#a34334' }}>学生答案：{w.userAnswer}</span>
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
        </>
      )}

      {tab === 'checkin' && (
        checkinRecords.length === 0 ? <EmptyState messageKey="teacher.checkinRecordsEmpty" /> :
        checkinRecords.map((r) => (
          <div className="paper-panel" key={r.recordId} style={{ background: '#faf7ef', borderRadius: 8, padding: 12, marginBottom: 8 }}>
            <div style={{ fontWeight: 600 }}>{r.checkpointName}</div>
            <div style={{ fontSize: 12, color: '#707866', marginTop: 4 }}>
              时间: {r.checkedAt} · 坐标: ({r.latitude.toFixed(6)}, {r.longitude.toFixed(6)})
            </div>
            {r.scannedValue && <div style={{ fontSize: 12, color: '#606b5a', marginTop: 2 }}>扫码: {r.scannedValue}</div>}
          </div>
        ))
      )}

      {tab === 'exercise' && (
        exerciseRecords.length === 0 ? <EmptyState messageKey="teacher.exerciseRecordsEmpty" /> :
        exerciseRecords.map((r) => (
          <div className="paper-panel" key={r.recordId} style={{ background: '#faf7ef', borderRadius: 8, padding: 12, marginBottom: 8 }}>
            <div style={{ fontWeight: 600 }}>{r.grammarTitle} · {r.type}</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>题目: {r.question}</div>
            <div style={{ fontSize: 13, marginTop: 2 }}>作答: {r.userAnswer} · 正确答案: {r.answer}</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>
              <span style={{ color: r.isCorrect ? '#43654e' : '#a34334' }}>{r.isCorrect ? '✓ 正确' : '✗ 错误'}</span>
              <span style={{ color: '#707866', marginLeft: 8 }}>{r.submittedAt}</span>
            </div>
          </div>
        ))
      )}
    </PageContainer>
  );
};

export default StudentDetailPage;
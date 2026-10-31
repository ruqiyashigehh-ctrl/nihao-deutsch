import React, { useEffect, useState } from 'react';
import { Card, Spin } from 'antd';
import { useTeacherStore } from '../../store/teacherStore';
import { AccuracyHeatmap } from '../../components/AccuracyHeatmap';
import { AttendanceMatrix } from '../../components/AttendanceMatrix';
import { apiGet } from '../../api/client';

interface ClassOption {
  class_id: string;
  class_name: string;
}

function accuracyColor(accuracy: number): string {
  if (accuracy >= 80) return '#43654e';
  if (accuracy >= 60) return '#9eb48b';
  if (accuracy >= 40) return '#a3752d';
  return '#a34334';
}

export const ClassAnalyticsPage: React.FC = () => {
  const { accuracyMatrix, attendance, grammarStats, analyticsLoading, loadAnalytics, patchAttendance, urge } = useTeacherStore();
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [classId, setClassId] = useState<string | null>(null);

  useEffect(() => {
    apiGet<ClassOption[]>('/teacher/classes')
      .then((data) => {
        setClasses(data);
        const first = data[0]?.class_id ?? null;
        setClassId(first);
        if (first) void loadAnalytics(first);
      })
      .catch(() => undefined);
  }, [loadAnalytics]);

  const handleClassChange = (id: string) => {
    setClassId(id);
    void loadAnalytics(id);
  };

  if (analyticsLoading && !attendance) {
    return <div style={{ textAlign: 'center', padding: 40 }}><Spin size="large" /></div>;
  }

  const overall = grammarStats?.overall;
  const byLektion = grammarStats?.byLektion ?? [];
  const weakGrammars = grammarStats?.weakGrammars ?? [];

  return (
    <div>
      {classes.length > 1 && (
        <div style={{ marginBottom: 12 }}>
          <select className="paper-input"
            value={classId ?? ''}
            onChange={(e) => handleClassChange(e.target.value)}
            style={{ padding: '6px 10px', border: '1px solid #cbd1bd', borderRadius: 6 }}
          >
            {classes.map((c) => (
              <option key={c.class_id} value={c.class_id}>{c.class_name}</option>
            ))}
          </select>
        </div>
      )}

      <Card title="语法掌握情况" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 24, marginBottom: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 12, color: '#707866' }}>班级平均正确率</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: accuracyColor(overall?.accuracy ?? 0) }}>
              {overall ? `${overall.accuracy}%` : '-'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#707866' }}>参与练习学生</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#33583f' }}>
              {overall ? `${overall.participants}/${overall.studentCount}` : '-'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#707866' }}>累计答题量</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#33583f' }}>
              {overall ? overall.totalAnswers : '-'}
            </div>
          </div>
        </div>

        <div style={{ fontWeight: 600, marginBottom: 8, color: '#263c32' }}>薄弱语法点（建议课堂重点讲解）</div>
        {weakGrammars.length === 0 ? (
          <div style={{ color: '#707866', fontSize: 14, marginBottom: 12 }}>暂无语法练习数据</div>
        ) : (
          weakGrammars.map((g) => (
            <div key={g.grammarId} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: '#263c32' }}>
                  {g.title}
                  {g.lektion != null && <span style={{ color: '#707866', fontSize: 12 }}>（第 {g.lektion} 单元）</span>}
                </span>
                <span style={{ color: accuracyColor(g.accuracy), fontWeight: 600 }}>{g.accuracy}%</span>
              </div>
              <div style={{ height: 6, background: '#e4e7da', borderRadius: 3, marginTop: 6 }}>
                <div style={{ height: '100%', width: `${g.accuracy}%`, background: accuracyColor(g.accuracy), borderRadius: 3 }} />
              </div>
              <div style={{ fontSize: 12, color: '#707866', marginTop: 4 }}>
                {g.participants} 名学生作答 · 共 {g.total} 题 · 错 {g.wrong} 题
              </div>
            </div>
          ))
        )}

        <div style={{ fontWeight: 600, margin: '16px 0 8px', color: '#263c32' }}>各单元正确率</div>
        {byLektion.length === 0 ? (
          <div style={{ color: '#707866', fontSize: 14 }}>暂无数据</div>
        ) : (
          byLektion.map((l) => (
            <div key={l.lektion} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span style={{ width: 70, fontSize: 13, color: '#606b5a' }}>第 {l.lektion} 单元</span>
              <div style={{ flex: 1, height: 18, background: '#f0eee3', borderRadius: 4, position: 'relative' }}>
                <div style={{ height: '100%', width: `${l.accuracy}%`, background: accuracyColor(l.accuracy), borderRadius: 4 }} />
              </div>
              <span style={{ width: 92, fontSize: 12, color: '#606b5a', textAlign: 'right' }}>
                {l.accuracy}% · {l.answers}题
              </span>
            </div>
          ))
        )}
      </Card>

      <Card title="正确率热力表" style={{ marginBottom: 16 }}>
        <AccuracyHeatmap cells={accuracyMatrix} />
      </Card>

      <Card title="早读考勤">
        <AttendanceMatrix
          matrix={attendance}
          onPatchCell={patchAttendance}
          onUrge={urge}
        />
      </Card>
    </div>
  );
};

export default ClassAnalyticsPage;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/PageContainer';
import { EmptyState } from '../../components/EmptyState';
import { Loading } from '../../components/Loading';
import { apiGet } from '../../api/client';
import { t } from '@nihao-deutsch/shared';

interface StudentSummary {
  userId: string;
  studentNo: string;
  name: string;
  classId: string | null;
  className: string | null;
  status: 'active' | 'disabled';
  checkinCount: number;
  exerciseCount: number;
  correctCount: number;
  accuracy: number;
}

export const StudentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    apiGet<StudentSummary[]>('/teacher/students')
      .then((data) => { setStudents(data); setLoading(false); })
      .catch(() => { setError(t('teacher.loadFailed')); setLoading(false); });
  }, []);

  return (
    <PageContainer title="学生管理">
      {loading ? <Loading /> : error ? <EmptyState message={error} /> :
       students.length === 0 ? <EmptyState messageKey="teacher.studentsEmpty" /> :
        <div>
          {students.map((s) => (
            <button className="paper-panel paper-student-row"
              key={s.userId}
              onClick={() => navigate(`/teacher/students/${s.userId}`)}
              style={{
                background: '#faf7ef', borderRadius: 8, padding: 16, marginBottom: 10, cursor: 'pointer', width: '100%', textAlign: 'left',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{s.name}（{s.studentNo}）</div>
                <div style={{ fontSize: 12, color: '#707866', marginTop: 4 }}>
                  {s.className ?? '未分班'} · 打卡{s.checkinCount}次 · 练习{s.exerciseCount}题 · 正确率{s.accuracy}%
                </div>
              </div>
              <span style={{ color: s.status === 'active' ? '#43654e' : '#a34334', fontSize: 12 }}>
                {s.status === 'active' ? '正常' : '禁用'}
              </span>
            </button>
          ))}
        </div>
      }
    </PageContainer>
  );
};
export default StudentsPage;
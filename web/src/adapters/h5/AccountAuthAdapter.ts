import type { AuthAdapter, AuthResult } from '@nihao-deutsch/shared';
import { USE_MOCK } from '../../app/env';
import { apiPost } from '../../api/client';
import { setToken, clearToken } from '../../api/client';

export class AccountAuthAdapter implements AuthAdapter {
  async login(studentNo: string, password: string): Promise<AuthResult> {
    if (USE_MOCK) {
      const demos: Record<string, Omit<AuthResult, 'token'>> = {
        '20240001': { userId: 'demo-student', studentNo: '20240001', name: '演示学生', classId: 'c001', role: 'student', isFirstBind: false },
        T0001: { userId: 'demo-teacher', studentNo: 'T0001', name: '演示教师', classId: 'c001', role: 'teacher', isFirstBind: false },
        admin: { userId: 'demo-admin', studentNo: 'admin', name: '演示管理员', classId: null, role: 'admin', isFirstBind: false },
      };
      const demo = demos[studentNo];
      const expectedPassword = studentNo === 'admin' ? 'admin123456' : 'demo123456';
      if (!demo || password !== expectedPassword) {
        const error = new Error('学号或密码错误') as Error & { response: { status: number } };
        error.response = { status: 401 };
        throw error;
      }
      const result: AuthResult = { ...demo, token: `demo-${demo.role}-token` };
      setToken(result.token);
      return result;
    }
    const result = await apiPost<AuthResult>('/auth/login', { studentNo, password });
    setToken(result.token);
    return result;
  }

  async logout(): Promise<void> {
    if (USE_MOCK) {
      clearToken();
      return;
    }
    try {
      await apiPost('/auth/logout');
    } finally {
      clearToken();
    }
  }
}

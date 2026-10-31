import type { AuthAdapter, AuthResult } from '@nihao-deutsch/shared';
import { apiPost } from '../../api/client';
import { setToken, clearToken } from '../../api/client';

export class AccountAuthAdapter implements AuthAdapter {
  async login(studentNo: string, password: string): Promise<AuthResult> {
    const result = await apiPost<AuthResult>('/auth/login', { studentNo, password });
    setToken(result.token);
    return result;
  }

  async logout(): Promise<void> {
    try {
      await apiPost('/auth/logout');
    } finally {
      clearToken();
    }
  }
}
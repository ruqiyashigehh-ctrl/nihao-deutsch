import type { AuthAdapter, AuthResult } from '@nihao-deutsch/shared';

export class WeLinkAuthAdapter implements AuthAdapter {
  async login(_studentNo: string, _password: string): Promise<AuthResult> {
    throw new Error('WeLink 认证适配待实现');
  }
  async logout(): Promise<void> {
    throw new Error('WeLink 登出适配待实现');
  }
}
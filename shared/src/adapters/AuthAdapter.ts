import type { Role } from '../types';

export interface AuthResult {
  userId: string;
  studentNo: string;
  name: string;
  classId: string | null;
  role: Role;
  isFirstBind: boolean;
  token: string;
}

export interface AuthAdapter {
  login(studentNo: string, password: string): Promise<AuthResult>;
  logout(): Promise<void>;
}
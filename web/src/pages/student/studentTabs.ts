export interface StudentTab {
  path: string;
  label: string;
  icon: string;
}

export const STUDENT_TABS: StudentTab[] = [
  { path: '/student/home', label: '首页', icon: '🏠' },
  { path: '/student/words', label: '词库', icon: '📚' },
  { path: '/student/class', label: '班级', icon: '🏫' },
  { path: '/student/profile', label: '我的', icon: '👤' },
];

export const FULLSCREEN_PATHS: string[] = [
  '/student/words/study',
  '/student/quiz/answer',
];
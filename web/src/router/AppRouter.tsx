import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { RequireAuth, RequireBound, RequireRole } from './guards';

import { LoginPage } from '../pages/auth/LoginPage';
import { BindPage } from '../pages/auth/BindPage';
import { StudentLayout } from '../pages/student/StudentLayout';
import { HomePage } from '../pages/student/HomePage';
import { WordsPage } from '../pages/student/WordsPage';
import { WordDetailPage } from '../pages/student/WordDetailPage';
import { StudyPage } from '../pages/student/StudyPage';
import { GrammarPage } from '../pages/student/GrammarPage';
import { GrammarDetailPage } from '../pages/student/GrammarDetailPage';
import { PracticePage } from '../pages/student/PracticePage';
import { CheckinPage } from '../pages/student/CheckinPage';
import { MessagesPage } from '../pages/student/MessagesPage';
import { ClassPage } from '../pages/student/ClassPage';
import { QuizSetupPage } from '../pages/student/QuizSetupPage';
import { QuizAnswerPage } from '../pages/student/QuizAnswerPage';
import { QuizResultPage } from '../pages/student/QuizResultPage';
import { ProfilePage } from '../pages/student/ProfilePage';
import { StudyReportPage } from '../pages/student/StudyReportPage';
import { SettingsPage } from '../pages/student/SettingsPage';
import { TeacherLayout } from '../pages/teacher/TeacherLayout';
import { StudentsPage } from '../pages/teacher/StudentsPage';
import { StudentDetailPage } from '../pages/teacher/StudentDetailPage';
import { NotifyPage } from '../pages/teacher/NotifyPage';
import { PublishHomeworkPage } from '../pages/teacher/PublishHomeworkPage';
import { ClassAnalyticsPage } from '../pages/teacher/ClassAnalyticsPage';
import { AdminLayout } from '../pages/admin/AdminLayout';
import { ImportPage } from '../pages/admin/ImportPage';
import { TemplatesPage } from '../pages/admin/TemplatesPage';
import { CheckinPointPage } from '../pages/admin/CheckinPointPage';
import { UserManagePage } from '../pages/admin/UserManagePage';
import { ResourceManagePage } from '../pages/admin/ResourceManagePage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';

export const AppRouter: React.FC = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/bind" element={<BindPage />} />

    <Route path="/student" element={
      <RequireAuth>
        <RequireBound>
          <RequireRole roles={['student']}>
            <StudentLayout />
          </RequireRole>
        </RequireBound>
      </RequireAuth>
    }>
      <Route index element={<Navigate to="home" replace />} />
      <Route path="home" element={<HomePage />} />
      <Route path="words" element={<WordsPage />} />
      <Route path="words/study" element={<StudyPage />} />
      <Route path="words/:wordId" element={<WordDetailPage />} />
      <Route path="grammar" element={<GrammarPage />} />
      <Route path="grammar/:grammarId" element={<GrammarDetailPage />} />
      <Route path="practice/:grammarId" element={<PracticePage />} />
      <Route path="checkin" element={<CheckinPage />} />
      <Route path="messages" element={<MessagesPage />} />
      <Route path="class" element={<ClassPage />} />
      <Route path="quiz" element={<QuizSetupPage />} />
      <Route path="quiz/answer" element={<QuizAnswerPage />} />
      <Route path="quiz/result" element={<QuizResultPage />} />
      <Route path="profile" element={<ProfilePage />} />
      <Route path="profile/report" element={<StudyReportPage />} />
      <Route path="profile/settings" element={<SettingsPage />} />
      <Route path="*" element={<Navigate to="home" replace />} />
    </Route>

    <Route path="/teacher" element={
      <RequireAuth>
        <RequireRole roles={['teacher']}>
          <TeacherLayout />
        </RequireRole>
      </RequireAuth>
    }>
      <Route index element={null} />
      <Route path="publish" element={<PublishHomeworkPage />} />
      <Route path="analytics" element={<ClassAnalyticsPage />} />
      <Route path="students" element={<StudentsPage />} />
      <Route path="students/:userId" element={<StudentDetailPage />} />
      <Route path="notify" element={<NotifyPage />} />
      <Route path="*" element={<Navigate to="" replace />} />
    </Route>

    <Route path="/admin" element={
      <RequireAuth>
        <RequireRole roles={['admin']}>
          <AdminLayout />
        </RequireRole>
      </RequireAuth>
    }>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<AdminDashboardPage />} />
      <Route path="checkin-points" element={<CheckinPointPage />} />
      <Route path="users" element={<UserManagePage />} />
      <Route path="resources" element={<ResourceManagePage />} />
      <Route path="import" element={<ImportPage />} />
      <Route path="templates" element={<TemplatesPage />} />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Route>

    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);

export default AppRouter;
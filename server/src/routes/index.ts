import { Router } from 'express';
import authRoutes from './auth.routes';
import wordRoutes from './word.routes';
import grammarRoutes from './grammar.routes';
import exerciseRoutes from './exercise.routes';
import checkinRoutes from './checkin.routes';
import messageRoutes from './message.routes';
import importRoutes from './import.routes';
import teacherRoutes from './teacher.routes';
import templateRoutes from './template.routes';
import studyRoutes from './study.routes';
import quizRoutes from './quiz.routes';
import studentRoutes from './student.routes';
import profileRoutes from './profile.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ service: 'nihao-deutsch-server', version: 'v1' });
});

router.use('/auth', authRoutes);
router.use('/words', wordRoutes);
router.use('/grammar', grammarRoutes);
router.use('/exercises', exerciseRoutes);
router.use('/checkin', checkinRoutes);
router.use('/messages', messageRoutes);
router.use('/admin/import', importRoutes);
router.use('/admin/templates', templateRoutes);
router.use('/teacher', teacherRoutes);
router.use('/study', studyRoutes);
router.use('/quiz', quizRoutes);
router.use('/student', studentRoutes);
router.use('/profile', profileRoutes);
router.use('/admin', adminRoutes);

export default router;
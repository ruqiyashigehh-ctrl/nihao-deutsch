import { Router } from 'express';
import { teacherController } from '../controllers/teacher.controller';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/permission';
import { validateBody } from '../middleware/zodValidate';
import { auditMiddleware } from '../middleware/audit';
import { PublishHomeworkRequestSchema, AttendanceCellPatchSchema } from '@nihao-deutsch/shared';

const router = Router();
router.use(authMiddleware);
router.use(requireRole(['teacher']));

router.get('/classes', teacherController.listClasses.bind(teacherController));
router.get('/students', teacherController.listStudents.bind(teacherController));
router.get('/students/:userId', teacherController.getStudentDetail.bind(teacherController));
router.get('/students/:userId/checkin-records', teacherController.getStudentCheckinRecords.bind(teacherController));
router.get('/students/:userId/exercise-records', teacherController.getStudentExerciseRecords.bind(teacherController));
router.get('/students/:userId/report', teacherController.getStudentReport.bind(teacherController));

router.get('/invite-codes', teacherController.getInviteCodes.bind(teacherController));
router.post('/homework', validateBody(PublishHomeworkRequestSchema), auditMiddleware('publishHomework'), teacherController.publishHomework.bind(teacherController));
router.get('/analytics/accuracy', teacherController.getAccuracy.bind(teacherController));
router.get('/analytics/grammar', teacherController.getGrammarAnalytics.bind(teacherController));
router.get('/analytics/attendance', teacherController.getAttendance.bind(teacherController));
router.patch('/analytics/attendance/cell', validateBody(AttendanceCellPatchSchema), teacherController.patchAttendance.bind(teacherController));

export default router;
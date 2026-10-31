import { v4 as uuidv4 } from 'uuid';
import { exerciseRepository } from '../repositories/exercise.repository';
import { AppError } from '../middleware/errorHandler';
import { nowIso, fromBool } from '../dal/types';

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

export class ExerciseService {
  async getList(grammarId: string, type?: string) {
    const rows = await exerciseRepository.findByGrammar(grammarId, type);
    return rows.map((e: any) => ({
      exerciseId: e.exercise_id, grammarId: e.grammar_id, type: e.type,
      question: e.question, difficulty: e.difficulty,
    }));
  }

  async submit(userId: string, exerciseId: string, userAnswer: string) {
    const exercise = await exerciseRepository.findById(exerciseId);
    if (!exercise) throw new AppError(404, '题目不存在', 'NOT_FOUND');

    const existing = await exerciseRepository.findRecord(userId, exerciseId);
    if (existing) throw new AppError(409, '该题已作答', 'ALREADY_ANSWERED');

    const isCorrect = normalize(userAnswer) === normalize(exercise.answer) ? 1 : 0;
    const recordId = uuidv4();
    const submittedAt = nowIso();

    await exerciseRepository.insertRecord({
      recordId, userId, exerciseId, userAnswer, isCorrect, submittedAt,
    });

    return {
      recordId, exerciseId, isCorrect: isCorrect === 1,
      correctAnswer: exercise.answer, explanation: exercise.explanation, submittedAt,
    };
  }

  async getRecords(userId: string) {
    const rows = await exerciseRepository.findRecordsByUser(userId);
    return rows.map((r: any) => ({
      recordId: r.record_id, userId: r.user_id, exerciseId: r.exercise_id,
      userAnswer: r.user_answer, isCorrect: r.is_correct === 1, submittedAt: r.submitted_at,
      question: r.question, correctAnswer: r.answer, type: r.type, grammarId: r.grammar_id,
    }));
  }
}

export const exerciseService = new ExerciseService();
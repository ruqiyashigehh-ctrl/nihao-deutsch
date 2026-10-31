import { studentRepository } from '../repositories/student.repository';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../dal/driver';
import { nowIso } from '../dal/types';

interface RawWord {
  word_id: string;
  lemma: string;
  pos: string;
  meaning: string;
  lektion: number | null;
}

interface RawExercise {
  exercise_id: string;
  type: string;
  question: string;
  answer: string;
  error_options: string | null;
  grammar_id: string;
  lektion: number | null;
}

export interface QuizQuestionOut {
  questionId: string;
  type: 'choice' | 'fill';
  question: string;
  options?: string[];
  correctAnswer: string;
  lektion?: number | null;
  grammarId?: string | null;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const MAX_DISTRACTOR_REUSE = 2;

export class QuizService {
  async getQuestions(type: 'vocab' | 'grammar', count: number, lektionRange?: number[]): Promise<QuizQuestionOut[]> {
    if (type === 'vocab') return this.buildVocabQuestions(count, lektionRange);
    return this.buildGrammarQuestions(count, lektionRange);
  }

  private async buildVocabQuestions(count: number, lektionRange?: number[]): Promise<QuizQuestionOut[]> {
    const pool = (await studentRepository.findQuizWords(Math.max(count * 4, count), lektionRange)) as RawWord[];
    if (pool.length === 0) return [];

    const questions: QuizQuestionOut[] = [];
    const targets = pool.slice(0, Math.min(count, pool.length));
    const reuseCount = new Map<string, number>();

    for (const word of targets) {
      const distractors = this.pickWordDistractors(pool, word, 3, reuseCount);
      if (distractors.length >= 3) {
        const options = shuffle([word.lemma, ...distractors]);
        questions.push({
          questionId: uuidv4(),
          type: 'choice',
          question: `“${word.meaning}”的德语是？`,
          options,
          correctAnswer: String(options.indexOf(word.lemma)),
          lektion: word.lektion ?? null,
        });
      } else {
        questions.push({
          questionId: uuidv4(),
          type: 'fill',
          question: `“${word.meaning}”的德语是？`,
          correctAnswer: word.lemma,
          lektion: word.lektion ?? null,
        });
      }
    }
    return questions;
  }

  private pickWordDistractors(
    pool: RawWord[],
    target: RawWord,
    need: number,
    reuseCount: Map<string, number>,
  ): string[] {
    const samePos = pool.filter((w) => w.word_id !== target.word_id && w.pos === target.pos);
    const otherPos = pool.filter((w) => w.word_id !== target.word_id && w.pos !== target.pos);
    const picked: string[] = [];

    const tryPick = (candidates: RawWord[], respectLimit: boolean) => {
      for (const c of shuffle(candidates)) {
        if (picked.length >= need) return;
        if (c.lemma === target.lemma || picked.includes(c.lemma)) continue;
        if (respectLimit && (reuseCount.get(c.lemma) ?? 0) >= MAX_DISTRACTOR_REUSE) continue;
        picked.push(c.lemma);
        reuseCount.set(c.lemma, (reuseCount.get(c.lemma) ?? 0) + 1);
      }
    };

    tryPick(samePos, true);
    if (picked.length < need) tryPick(otherPos, true);
    if (picked.length < need) tryPick([...samePos, ...otherPos], false);
    return picked;
  }

  private async buildGrammarQuestions(count: number, lektionRange?: number[]): Promise<QuizQuestionOut[]> {
    const exercises = (await studentRepository.findQuizExercises(count, lektionRange)) as RawExercise[];
    if (exercises.length === 0) return [];

    const questions: QuizQuestionOut[] = [];
    const answerPool = exercises.map((e) => e.answer);
    const reuseCount = new Map<string, number>();

    for (const ex of exercises) {
      let options: string[] | null = null;

      const wrongOptions = this.parseErrorOptions(ex.error_options, ex.answer);
      if (wrongOptions.length >= 2) {
        options = shuffle([ex.answer, ...wrongOptions.slice(0, 3)]);
      } else {
        const distractors: string[] = [];
        for (const candidate of shuffle(answerPool)) {
          if (distractors.length >= 3) break;
          if (candidate === ex.answer || distractors.includes(candidate)) continue;
          if ((reuseCount.get(candidate) ?? 0) >= MAX_DISTRACTOR_REUSE) continue;
          distractors.push(candidate);
          reuseCount.set(candidate, (reuseCount.get(candidate) ?? 0) + 1);
        }
        if (distractors.length >= 3) options = shuffle([ex.answer, ...distractors]);
      }

      if (options) {
        questions.push({
          questionId: uuidv4(),
          type: 'choice',
          question: ex.question,
          options,
          correctAnswer: String(options.indexOf(ex.answer)),
          lektion: ex.lektion ?? null,
          grammarId: ex.grammar_id,
        });
      } else {
        questions.push({
          questionId: uuidv4(),
          type: 'fill',
          question: ex.question,
          correctAnswer: ex.answer,
          lektion: ex.lektion ?? null,
          grammarId: ex.grammar_id,
        });
      }
    }
    return questions;
  }

  private parseErrorOptions(raw: string | null, answer: string): string[] {
    if (!raw) return [];
    let parts: string[] = [];
    if (raw.includes('\\|')) {
      parts = raw.split('\\|');
    } else if (raw.trim().startsWith('[')) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) parts = parsed.map(String);
      } catch {
        parts = [];
      }
    } else if (raw.includes('|')) {
      parts = raw.split('|');
    }
    return parts.map((s) => s.trim()).filter((s) => s && s !== answer);
  }

  async recordQuizResult(
    userId: string,
    type: 'vocab' | 'grammar',
    score: number,
    correctCount: number,
    totalCount: number,
    details?: {
      questionId: string;
      question: string;
      questionKind: 'choice' | 'fill';
      userAnswer: string;
      correctAnswer: string;
      isCorrect: boolean;
      lektion?: number | null;
      grammarId?: string | null;
    }[],
  ) {
    const db = await getDatabase();
    const recordId = uuidv4();
    await db.run(
      `INSERT INTO quiz_records (record_id, user_id, quiz_type, score, correct_count, total_count, submitted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [recordId, userId, type, score, correctCount, totalCount, nowIso()],
    );

    if (details && details.length > 0) {
      for (const d of details) {
        await db.run(
          `INSERT INTO quiz_answers (answer_id, record_id, user_id, quiz_type, question_id, question, question_kind,
                                     user_answer, correct_answer, is_correct, lektion, grammar_point_id, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            uuidv4(), recordId, userId, type, d.questionId, d.question, d.questionKind,
            d.userAnswer, d.correctAnswer, d.isCorrect ? 1 : 0, d.lektion ?? null, d.grammarId ?? null, nowIso(),
          ],
        );
      }
    }
    return { recordId };
  }
}

export const quizService = new QuizService();
import { studentRepository } from '../repositories/student.repository';
import { AppError } from '../middleware/errorHandler';

function levelOf(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count >= 20) return 4;
  if (count >= 10) return 3;
  if (count >= 5) return 2;
  if (count >= 1) return 1;
  return 0;
}

export class ProfileService {
  async getUser(userId: string) {
    const user = await studentRepository.findUser(userId);
    if (!user) throw new AppError(404, '用户不存在', 'NOT_FOUND');
    return {
      userId: user.user_id,
      name: user.name,
      avatar: null,
      className: user.class_name ?? '未分班',
    };
  }

  async getStats(userId: string) {
    const [totalWords, masteredWords, weeklyCheckinDays] = await Promise.all([
      studentRepository.countStudyDistinct(userId),
      studentRepository.countMastered(userId),
      studentRepository.countWeeklyCheckins(userId),
    ]);
    return { totalWords, masteredWords, weeklyCheckinDays };
  }

  async getHeatmap(userId: string) {
    const rows = await studentRepository.findStudyDates(userId, 84);
    const countMap = new Map<string, number>();
    for (const r of rows) countMap.set(r.d, r.c);

    const points: { date: string; level: 0 | 1 | 2 | 3 | 4 }[] = [];
    for (let i = 83; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      points.push({ date: dateStr, level: levelOf(countMap.get(dateStr) ?? 0) });
    }
    return points;
  }

  async getReport(userId: string) {
    const [studyRows, masteryRows] = await Promise.all([
      studentRepository.findStudyDates(userId, 28),
      studentRepository.findMasteredTimeline(userId, 28),
    ]);

    const now = new Date();
    const weeks: { weekLabel: string; cumulativeWords: number; masteredWords: number }[] = [];
    let cumTotal = 0;
    let cumMastered = 0;

    for (let w = 3; w >= 0; w--) {
      const start = new Date(now);
      start.setDate(start.getDate() - (w + 1) * 7 + 1);
      const end = new Date(now);
      end.setDate(end.getDate() - w * 7);

      const inRange = (d: string) => {
        const t = new Date(d + 'T00:00:00Z').getTime();
        return t >= start.setHours(0, 0, 0, 0) && t <= end.setHours(23, 59, 59, 999);
      };

      const studied = studyRows.filter((r) => inRange(r.d)).reduce((s, r) => s + r.c, 0);
      const mastered = masteryRows.filter((r) => inRange(r.d)).reduce((s, r) => s + r.c, 0);
      cumTotal += studied;
      cumMastered += mastered;

      weeks.push({
        weekLabel: `第${4 - w}周`,
        cumulativeWords: cumTotal,
        masteredWords: cumMastered,
      });
    }
    return weeks;
  }

  async getReportDetail(userId: string) {
    const MIN_ATTEMPTS = 3;
    const ACCURACY_THRESHOLD = 70;

    const [fromExercises, fromQuiz] = await Promise.all([
      studentRepository.findWeakGrammarsFromExercises(userId, MIN_ATTEMPTS),
      studentRepository.findWeakGrammarsFromQuiz(userId, MIN_ATTEMPTS),
    ]);

    const merged = new Map<string, { grammarId: string; title: string; lektion: number | null; total: number; wrong: number }>();
    for (const row of [...fromExercises, ...fromQuiz]) {
      const cur = merged.get(row.grammar_id);
      if (cur) {
        cur.total += row.total;
        cur.wrong += row.wrong;
      } else {
        merged.set(row.grammar_id, {
          grammarId: row.grammar_id,
          title: row.title,
          lektion: row.lektion ?? null,
          total: row.total,
          wrong: row.wrong,
        });
      }
    }

    const weakGrammars = [...merged.values()]
      .map((g) => ({
        ...g,
        accuracy: g.total > 0 ? Math.round(((g.total - g.wrong) / g.total) * 100) : 100,
      }))
      .filter((g) => g.accuracy < ACCURACY_THRESHOLD)
      .sort((a, b) => a.accuracy - b.accuracy || b.wrong - a.wrong)
      .slice(0, 10);

    const [wrongQuiz, wrongEx] = await Promise.all([
      studentRepository.findWrongFromQuiz(userId, 20),
      studentRepository.findWrongFromExercises(userId, 20),
    ]);

    const wrongQuestions = [
      ...wrongQuiz.map((r) => ({
        source: 'quiz' as const,
        question: r.question,
        userAnswer: r.user_answer,
        correctAnswer: r.correct_answer,
        grammarTitle: r.grammar_title ?? null,
        lektion: r.lektion ?? null,
        createdAt: r.created_at,
      })),
      ...wrongEx.map((r) => ({
        source: 'exercise' as const,
        question: r.question,
        userAnswer: r.user_answer,
        correctAnswer: r.correct_answer,
        grammarTitle: r.grammar_title ?? null,
        lektion: r.lektion ?? null,
        createdAt: r.created_at,
      })),
    ]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 30);

    const wrongCount = await studentRepository.countWrongQuestions(userId);

    return { weakGrammars, wrongQuestions, wrongCount };
  }
}

export const profileService = new ProfileService();
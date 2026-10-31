import type { QuizConfig, QuizQuestionData } from '../../types/domain';

const VOCAB_QUESTIONS: Omit<QuizQuestionData, 'questionId'>[] = [
  { type: 'choice', question: '“苹果”的德语是？', options: ['der Apfel', 'die Birne', 'die Orange', 'die Traube'], correctAnswer: '0' },
  { type: 'choice', question: '“学校”的德语是？', options: ['die Bibliothek', 'die Schule', 'die Universität', 'das Gymnasium'], correctAnswer: '1' },
  { type: 'fill', question: 'Ich ___ Deutsch.（我学习德语。）', correctAnswer: 'lerne' },
  { type: 'choice', question: '“美丽的”的德语是？', options: ['hässlich', 'groß', 'schön', 'klein'], correctAnswer: '2' },
  { type: 'fill', question: 'Das ___ ist groß.（房子很大。das Haus）', correctAnswer: 'Haus' },
  { type: 'choice', question: '“时间”的德语是？', options: ['die Uhr', 'die Zeit', 'der Tag', 'das Jahr'], correctAnswer: '1' },
  { type: 'choice', question: '“说话”的德语是？', options: ['hören', 'sehen', 'sprechen', 'schreiben'], correctAnswer: '2' },
  { type: 'fill', question: 'Wir ___ nach Hause.（我们回家。gehen）', correctAnswer: 'gehen' },
  { type: 'choice', question: '“好的”的德语是？', options: ['schlecht', 'gut', 'neu', 'alt'], correctAnswer: '1' },
  { type: 'choice', question: '“城市”的德语是？', options: ['das Dorf', 'die Stadt', 'das Land', 'die Region'], correctAnswer: '1' },
];

const GRAMMAR_QUESTIONS: Omit<QuizQuestionData, 'questionId'>[] = [
  { type: 'choice', question: '动词 sein 的第一人称单数形式是？', options: ['bist', 'ist', 'bin', 'sind'], correctAnswer: '2' },
  { type: 'choice', question: '动词 haben 的第二人称单数形式是？', options: ['habe', 'hat', 'habt', 'hast'], correctAnswer: '3' },
  { type: 'fill', question: 'Ich ___ Student.（我是学生。sein）', correctAnswer: 'bin' },
  { type: 'choice', question: '定冠词 der 的复数形式是？', options: ['die', 'das', 'den', 'dem'], correctAnswer: '0' },
  { type: 'fill', question: 'Du ___ ein Buch.（你有一本书。haben）', correctAnswer: 'hast' },
  { type: 'choice', question: '情态动词 können 的第一人称单数是？', options: ['kannst', 'kann', 'könnt', 'können'], correctAnswer: '1' },
  { type: 'choice', question: '介词 in 支配第几格表示位置？', options: ['第一格', '第二格', '第三格', '第四格'], correctAnswer: '2' },
  { type: 'fill', question: 'Wir ___ Deutsch sprechen.（我们会说德语。können）', correctAnswer: 'können' },
  { type: 'choice', question: '动词走 gehen 的过去分词是？', options: ['gegangen', 'geht', 'ging', 'gegangen sein'], correctAnswer: '0' },
  { type: 'choice', question: '“我和你”的正确表达是？', options: ['ich und du', 'du und ich', 'wir beide', 'me und you'], correctAnswer: '1' },
];

export function getQuizQuestions(config: QuizConfig): QuizQuestionData[] {
  const pool = config.type === 'vocab' ? VOCAB_QUESTIONS : GRAMMAR_QUESTIONS;
  const count = Math.min(config.questionCount, pool.length);
  const questions: QuizQuestionData[] = [];
  for (let i = 0; i < count; i++) {
    const q = pool[i % pool.length];
    questions.push({ ...q, questionId: `q${i + 1}` });
  }
  return questions;
}
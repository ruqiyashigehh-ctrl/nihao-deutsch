import type { KnowledgeBaseReport, KnowledgeBaseStep, ImportReport } from '@nihao-deutsch/shared';
import { handleGrammarExcel } from './handlers/grammarExcel.handler';
import { handleExerciseExcel } from './handlers/exerciseExcel.handler';
import { handleCheckpointExcel } from './handlers/checkpointExcel.handler';
import { handleWindowExcel } from './handlers/windowExcel.handler';
import { handleCopywritingExcel } from './handlers/copywritingExcel.handler';

export interface KnowledgeBaseFiles {
  grammar?: Buffer;
  exercises?: Buffer;
  checkpoints?: Buffer;
  windows?: Buffer;
  copywriting?: Buffer;
}

export async function orchestrateKnowledgeBase(
  files: KnowledgeBaseFiles,
): Promise<KnowledgeBaseReport> {
  const startTime = Date.now();
  const steps: KnowledgeBaseStep[] = [];

  const stepDefs: { type: string; buffer?: Buffer; fn: (b: Buffer) => Promise<ImportReport> }[] = [
    { type: 'grammarPoints', buffer: files.grammar, fn: handleGrammarExcel },
    { type: 'exercises', buffer: files.exercises, fn: handleExerciseExcel },
    { type: 'checkpoints', buffer: files.checkpoints, fn: handleCheckpointExcel },
    { type: 'windows', buffer: files.windows, fn: handleWindowExcel },
    { type: 'copywriting', buffer: files.copywriting, fn: handleCopywritingExcel },
  ];

  for (const step of stepDefs) {
    if (!step.buffer) {
      steps.push({ type: step.type, status: 'skipped', error: '未提供文件' });
      continue;
    }
    try {
      const report = await step.fn(step.buffer);
      steps.push({ type: step.type, status: report.failed > 0 ? 'failed' : 'success', report, error: report.failed > 0 ? `${report.failed} 条失败` : null });
    } catch (err: any) {
      steps.push({ type: step.type, status: 'failed', error: err?.message ?? String(err) });
    }
  }

  const overallSuccess = steps.every((s) => s.status === 'success' || s.status === 'skipped');

  return {
    steps,
    totalDurationMs: Date.now() - startTime,
    overallSuccess,
  };
}
import type { UserProfileData, StudyStatsData, HeatmapData, ReportWeekData } from '../../types/domain';

const MOCK_USER_PROFILE: UserProfileData = {
  userId: 'u001',
  name: '张同学',
  avatar: undefined,
  className: '德语A2班',
};

const MOCK_STUDY_STATS: StudyStatsData = {
  totalWords: 1280,
  masteredWords: 856,
  weeklyCheckinDays: 5,
};

function generateHeatmap(): HeatmapData[] {
  const data: HeatmapData[] = [];
  const today = new Date();
  for (let i = 83; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const level = Math.random() < 0.4 ? 0 : (Math.floor(Math.random() * 4) + 1) as HeatmapData['level'];
    data.push({ date: dateStr, level });
  }
  return data;
}

const MOCK_HEATMAP: HeatmapData[] = generateHeatmap();

const MOCK_REPORT: ReportWeekData[] = [
  { weekLabel: '第1周', cumulativeWords: 180, masteredWords: 120 },
  { weekLabel: '第2周', cumulativeWords: 420, masteredWords: 280 },
  { weekLabel: '第3周', cumulativeWords: 680, masteredWords: 450 },
  { weekLabel: '第4周', cumulativeWords: 950, masteredWords: 640 },
];

export function getUserProfile(): UserProfileData {
  return MOCK_USER_PROFILE;
}

export function getStudyStats(): StudyStatsData {
  return MOCK_STUDY_STATS;
}

export function getHeatmap(): HeatmapData[] {
  return MOCK_HEATMAP;
}

export function getReportData(): ReportWeekData[] {
  return MOCK_REPORT;
}
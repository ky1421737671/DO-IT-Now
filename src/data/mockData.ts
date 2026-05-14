import type {
  DailyTodo,
  DailyTodoCompletion,
  ExamPlan,
  HabitReminder,
  Memo,
  StudyTask,
  WeightEntry,
  WeightProfile,
} from '../types';
import { addDays, getWeekStart, todayISO, tomorrowISO } from '../utils/date';

const today = todayISO();
const tomorrow = tomorrowISO();
const weekStart = getWeekStart();

export const initialTasks: StudyTask[] = [
  {
    id: 'task-math-review',
    title: '数学：完成高数极限与连续性错题回看',
    priority: 'high',
    estimatedMinutes: 90,
    dueDate: today,
    dueTime: '10:30',
    completed: false,
    autoRollOver: true,
    createdAt: today,
    source: 'manual',
    subjectId: 'subject-math',
  },
  {
    id: 'task-english-reading',
    title: '英语：精读 2 篇阅读并整理长难句',
    priority: 'medium',
    estimatedMinutes: 70,
    dueDate: today,
    dueTime: '15:00',
    completed: false,
    autoRollOver: true,
    createdAt: today,
    source: 'manual',
    subjectId: 'subject-english',
  },
  {
    id: 'task-politics-audio',
    title: '政治：听完马原导论课并写 5 条关键词',
    priority: 'low',
    estimatedMinutes: 45,
    dueDate: today,
    dueTime: '20:30',
    completed: true,
    autoRollOver: true,
    createdAt: today,
    source: 'manual',
    subjectId: 'subject-politics',
  },
  {
    id: 'task-tomorrow-preview',
    title: '专业课：整理第二章框架',
    priority: 'medium',
    estimatedMinutes: 60,
    dueDate: tomorrow,
    dueTime: '09:30',
    completed: false,
    autoRollOver: true,
    createdAt: today,
    source: 'weekly-plan',
    subjectId: 'subject-major',
  },
];

export const initialPlan: ExamPlan = {
  examDate: '2026-12-20',
  subjects: [
    {
      id: 'subject-politics',
      name: '政治',
      longGoal: '完成基础概念框架，强化阶段开始刷选择题，冲刺阶段集中背诵主观题材料。',
      weeklyFocus: '本周完成马原第一轮导论和唯物论。',
    },
    {
      id: 'subject-english',
      name: '英语',
      longGoal: '保持每日阅读和单词，逐步形成真题阅读、翻译、作文三条复习线。',
      weeklyFocus: '本周完成 8 篇阅读精读和 2 次作文素材整理。',
    },
    {
      id: 'subject-math',
      name: '数学',
      longGoal: '先稳定基础概念和典型题，再进入专题强化与套卷节奏。',
      weeklyFocus: '本周复盘极限、连续、导数三块错题。',
    },
    {
      id: 'subject-major',
      name: '专业课',
      longGoal: '建立章节框架，完成核心教材两轮复习，并形成可背诵的答题模板。',
      weeklyFocus: '本周整理第一、二章框架和高频问答。',
    },
  ],
  stages: [
    {
      id: 'stage-foundation',
      name: '基础阶段',
      startDate: today,
      endDate: addDays(today, 70),
      focus: '补齐基础概念，每天形成稳定学习节奏。',
    },
    {
      id: 'stage-strengthen',
      name: '强化阶段',
      startDate: addDays(today, 71),
      endDate: addDays(today, 150),
      focus: '专题训练、真题拆解、错题回炉。',
    },
    {
      id: 'stage-sprint',
      name: '冲刺阶段',
      startDate: addDays(today, 151),
      endDate: '2026-12-19',
      focus: '模拟套卷、背诵压缩、查漏补缺。',
    },
  ],
  weeklyPlans: [
    {
      id: 'week-math',
      subjectId: 'subject-math',
      title: '数学基础题复盘',
      weekStart,
      days: ['周一：极限错题', '周三：导数计算', '周五：小测复盘'],
    },
    {
      id: 'week-english',
      subjectId: 'subject-english',
      title: '英语阅读稳定练习',
      weekStart,
      days: ['周二：阅读 2 篇', '周四：长难句整理', '周六：复盘生词'],
    },
  ],
};

export const initialHabits: HabitReminder[] = [
  { id: 'habit-words', title: '背单词', time: '08:10', enabled: true },
  { id: 'habit-question', title: '刷题', time: '14:00', enabled: true },
  { id: 'habit-review', title: '晚间复盘', time: '22:00', enabled: true },
];

export const initialMemos: Memo[] = [
  {
    id: 'memo-1',
    content: '英语阅读不要只追求速度，精读时要标出题干定位词。',
    createdAt: today,
  },
  {
    id: 'memo-2',
    content: '专业课第二章容易混淆的概念需要单独做一页对比。',
    createdAt: today,
  },
];

export const initialDailyTodos: DailyTodo[] = [
  {
    id: 'todo-print-materials',
    title: '打印专业课资料',
    createdAt: today,
  },
  {
    id: 'todo-clean-desk',
    title: '整理书桌和明天要用的书',
    createdAt: today,
  },
];

export const initialDailyTodoCompletions: DailyTodoCompletion[] = [];

export const initialWeightProfile: WeightProfile = {
  heightCm: 170,
  targetWeightKg: 65,
};

export const initialWeightEntries: WeightEntry[] = [
  {
    id: 'weight-today',
    date: today,
    time: '07:30',
    weightKg: 68.2,
    note: '早起空腹记录',
  },
  {
    id: 'weight-yesterday',
    date: addDays(today, -1),
    time: '07:40',
    weightKg: 68.5,
    note: '',
  },
  {
    id: 'weight-week-start',
    date: addDays(today, -6),
    time: '08:00',
    weightKg: 69.1,
    note: '',
  },
];

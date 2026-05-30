export type Priority = 'high' | 'medium' | 'low';

export type PageKey =
  | 'home'
  | 'goals'
  | 'todos'
  | 'rewards'
  | 'plan'
  | 'reminders'
  | 'memos'
  | 'weight'
  | 'coreTraining'
  | 'dataTransfer';
export type ConfigurablePageKey = Exclude<PageKey, 'home'>;

export interface NavModulePreference {
  key: ConfigurablePageKey;
  visible: boolean;
}

export interface StudyTask {
  id: string;
  title: string;
  priority: Priority;
  estimatedMinutes: number;
  dueDate: string;
  dueTime: string;
  completed: boolean;
  autoRollOver: boolean;
  createdAt: string;
  source?: 'manual' | 'weekly-plan' | 'memo' | 'habit';
  subjectId?: string;
  rolledFrom?: string;
}

export interface SubjectPlan {
  id: string;
  name: string;
  longGoal: string;
  weeklyFocus: string;
}

export interface StagePlan {
  id: string;
  name: '基础阶段' | '强化阶段' | '冲刺阶段';
  startDate: string;
  endDate: string;
  focus: string;
}

export interface WeeklyPlan {
  id: string;
  subjectId: string;
  title: string;
  weekStart: string;
  days: string[];
}

export interface ExamPlan {
  examDate: string;
  subjects: SubjectPlan[];
  stages: StagePlan[];
  weeklyPlans: WeeklyPlan[];
}

export interface HabitReminder {
  id: string;
  title: string;
  time: string;
  enabled: boolean;
}

export interface Memo {
  id: string;
  content: string;
  createdAt: string;
}

export interface DailyTodo {
  id: string;
  title: string;
  createdAt: string;
  recurringKey?: string;
}

export interface DailyTodoTemplate {
  id: string;
  title: string;
  createdAt: string;
  enabled: boolean;
}

export interface DailyTodoCompletion {
  id: string;
  title: string;
  completedDate: string;
  completedAt: string;
  recurringKey?: string;
}

export interface LongTermGoal {
  id: string;
  title: string;
  targetDate: string;
  stage: string;
  note: string;
  completed: boolean;
  createdAt: string;
}

export interface RewardRecord {
  id: string;
  title: string;
  source: '今日任务' | '每日待办' | '长期目标';
  points: number;
  createdAt: string;
  date: string;
  time: string;
}

export interface WeightProfile {
  heightCm: number;
  targetWeightKg: number;
}

export interface WeightEntry {
  id: string;
  date: string;
  time?: string;
  weightKg: number;
  note: string;
}

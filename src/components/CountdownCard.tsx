import { CalendarDays, Target } from 'lucide-react';
import type { ExamPlan } from '../types';
import { getDaysBetween, todayISO } from '../utils/date';

interface CountdownCardProps {
  plan: ExamPlan;
}

function CountdownCard({ plan }: CountdownCardProps) {
  const daysLeft = getDaysBetween(todayISO(), plan.examDate);
  const currentStage =
    plan.stages.find((stage) => stage.startDate <= todayISO() && stage.endDate >= todayISO()) ?? plan.stages[0];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-teal-100 bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-700">
            <CalendarDays className="h-4 w-4" />
            目标考试日期 {plan.examDate}
          </div>
          <h3 className="text-3xl font-semibold text-slate-950 sm:text-4xl">
            {daysLeft >= 0 ? `${daysLeft} 天` : '考试日已过'}
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            当前阶段：{currentStage?.name ?? '未设置'}。{currentStage?.focus ?? '先把每日任务稳定下来。'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:min-w-72">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-500">考试科目</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{plan.subjects.length}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-500">阶段计划</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{plan.stages.length}</p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {plan.subjects.map((subject) => (
          <span
            key={subject.id}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700"
          >
            <Target className="h-3.5 w-3.5 text-teal-600" />
            {subject.name}
          </span>
        ))}
      </div>
    </section>
  );
}

export default CountdownCard;

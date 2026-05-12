import type { Dispatch, FormEvent, SetStateAction } from 'react';
import { useEffect, useState } from 'react';
import { CalendarPlus, ListPlus, Plus, Trash2 } from 'lucide-react';
import type { ExamPlan, StagePlan, StudyTask, SubjectPlan, WeeklyPlan } from '../types';
import { addDays, getWeekStart, todayISO } from '../utils/date';
import { createId } from '../utils/id';

interface PlanPageProps {
  plan: ExamPlan;
  setPlan: Dispatch<SetStateAction<ExamPlan>>;
  setTasks: Dispatch<SetStateAction<StudyTask[]>>;
}

const getDayIndex = (text: string, fallbackIndex: number) => {
  const weekMap: Record<string, number> = {
    一: 0,
    二: 1,
    三: 2,
    四: 3,
    五: 4,
    六: 5,
    日: 6,
    天: 6,
  };
  const match = text.match(/周([一二三四五六日天])/);
  return match ? weekMap[match[1]] : fallbackIndex;
};

const cleanDayText = (text: string) => text.replace(/^周[一二三四五六日天]\s*[：:]\s*/, '').trim();

function PlanPage({ plan, setPlan, setTasks }: PlanPageProps) {
  const [subjectName, setSubjectName] = useState('');
  const [subjectGoal, setSubjectGoal] = useState('');
  const [subjectWeeklyFocus, setSubjectWeeklyFocus] = useState('');
  const [weeklySubjectId, setWeeklySubjectId] = useState(plan.subjects[0]?.id ?? '');
  const [weeklyTitle, setWeeklyTitle] = useState('');
  const [weeklyStart, setWeeklyStart] = useState(getWeekStart());
  const [weeklyDays, setWeeklyDays] = useState('周一：\n周三：\n周五：');

  useEffect(() => {
    const selectedSubjectExists = plan.subjects.some((subject) => subject.id === weeklySubjectId);

    if (!selectedSubjectExists) {
      setWeeklySubjectId(plan.subjects[0]?.id ?? '');
    }
  }, [plan.subjects, weeklySubjectId]);

  const updateSubject = (subjectId: string, patch: Partial<SubjectPlan>) => {
    setPlan((currentPlan) => ({
      ...currentPlan,
      subjects: currentPlan.subjects.map((subject) =>
        subject.id === subjectId ? { ...subject, ...patch } : subject,
      ),
    }));
  };

  const updateStage = (stageId: string, patch: Partial<StagePlan>) => {
    setPlan((currentPlan) => ({
      ...currentPlan,
      stages: currentPlan.stages.map((stage) => (stage.id === stageId ? { ...stage, ...patch } : stage)),
    }));
  };

  const addSubject = (event: FormEvent) => {
    event.preventDefault();
    if (!subjectName.trim()) {
      return;
    }

    const nextSubject: SubjectPlan = {
      id: createId('subject'),
      name: subjectName.trim(),
      longGoal: subjectGoal.trim() || '补充长期目标。',
      weeklyFocus: subjectWeeklyFocus.trim() || '补充本周重点。',
    };

    setPlan((currentPlan) => ({
      ...currentPlan,
      subjects: [...currentPlan.subjects, nextSubject],
    }));

    setWeeklySubjectId((current) => current || nextSubject.id);
    setSubjectName('');
    setSubjectGoal('');
    setSubjectWeeklyFocus('');
  };

  const removeSubject = (subjectId: string) => {
    setPlan((currentPlan) => ({
      ...currentPlan,
      subjects: currentPlan.subjects.filter((subject) => subject.id !== subjectId),
      weeklyPlans: currentPlan.weeklyPlans.filter((weeklyPlan) => weeklyPlan.subjectId !== subjectId),
    }));
  };

  const addWeeklyPlan = (event: FormEvent) => {
    event.preventDefault();
    if (!weeklySubjectId || !weeklyTitle.trim()) {
      return;
    }

    const days = weeklyDays
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const nextWeeklyPlan: WeeklyPlan = {
      id: createId('week'),
      subjectId: weeklySubjectId,
      title: weeklyTitle.trim(),
      weekStart: weeklyStart,
      days,
    };

    setPlan((currentPlan) => ({
      ...currentPlan,
      weeklyPlans: [nextWeeklyPlan, ...currentPlan.weeklyPlans],
    }));

    setWeeklyTitle('');
    setWeeklyDays('周一：\n周三：\n周五：');
  };

  const removeWeeklyPlan = (weeklyPlanId: string) => {
    setPlan((currentPlan) => ({
      ...currentPlan,
      weeklyPlans: currentPlan.weeklyPlans.filter((weeklyPlan) => weeklyPlan.id !== weeklyPlanId),
    }));
  };

  const generateDailyTasks = (weeklyPlan: WeeklyPlan) => {
    const subject = plan.subjects.find((item) => item.id === weeklyPlan.subjectId);
    const generatedTasks = weeklyPlan.days.map((dayText, index): StudyTask => {
      const dayIndex = getDayIndex(dayText, index);

      return {
        id: createId('task-week'),
        title: `${subject?.name ?? '复习'}：${cleanDayText(dayText) || weeklyPlan.title}`,
        priority: 'medium',
        estimatedMinutes: 60,
        dueDate: addDays(weeklyPlan.weekStart, dayIndex),
        dueTime: '09:00',
        completed: false,
        autoRollOver: true,
        createdAt: todayISO(),
        source: 'weekly-plan',
        subjectId: weeklyPlan.subjectId,
      };
    });

    setTasks((currentTasks) => [...generatedTasks, ...currentTasks]);
  };

  return (
    <div className="grid gap-5">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
        <div className="grid gap-4 md:grid-cols-[1fr_240px] md:items-end">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">考研计划</h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">用目标日期、阶段和周计划把长期复习拆成每天能执行的安排。</p>
          </div>
          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            目标考试日期
            <input
              type="date"
              value={plan.examDate}
              onChange={(event) => setPlan((currentPlan) => ({ ...currentPlan, examDate: event.target.value }))}
              className="focus-ring min-h-11 rounded-lg border border-slate-200 px-3 text-sm"
            />
          </label>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
          <h3 className="text-base font-semibold text-slate-950">考试科目与长期目标</h3>
          <div className="mt-4 grid gap-4">
            {plan.subjects.map((subject) => (
              <article key={subject.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <input
                    value={subject.name}
                    onChange={(event) => updateSubject(subject.id, { name: event.target.value })}
                    className="focus-ring min-h-10 max-w-48 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-950"
                  />
                  <button
                    type="button"
                    onClick={() => removeSubject(subject.id)}
                    className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-700"
                    aria-label="删除科目"
                    title="删除科目"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <label className="grid gap-1.5 text-sm font-medium text-slate-700">
                    长期目标
                    <textarea
                      value={subject.longGoal}
                      onChange={(event) => updateSubject(subject.id, { longGoal: event.target.value })}
                      rows={4}
                      className="focus-ring resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm leading-6"
                    />
                  </label>
                  <label className="grid gap-1.5 text-sm font-medium text-slate-700">
                    本周重点
                    <textarea
                      value={subject.weeklyFocus}
                      onChange={(event) => updateSubject(subject.id, { weeklyFocus: event.target.value })}
                      rows={4}
                      className="focus-ring resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm leading-6"
                    />
                  </label>
                </div>
              </article>
            ))}
          </div>
        </div>

        <form onSubmit={addSubject} className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-slate-950">添加科目</h3>
            <button
              type="submit"
              className="focus-ring inline-flex min-h-9 items-center gap-2 rounded-lg bg-teal-600 px-3 text-sm font-medium text-white hover:bg-teal-700"
            >
              <Plus className="h-4 w-4" />
              添加
            </button>
          </div>
          <div className="mt-4 grid gap-3">
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              科目名称
              <input
                value={subjectName}
                onChange={(event) => setSubjectName(event.target.value)}
                placeholder="例如：专业课二"
                className="focus-ring min-h-11 rounded-lg border border-slate-200 px-3 text-sm"
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              长期目标
              <textarea
                value={subjectGoal}
                onChange={(event) => setSubjectGoal(event.target.value)}
                rows={4}
                className="focus-ring resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm leading-6"
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              本周重点
              <textarea
                value={subjectWeeklyFocus}
                onChange={(event) => setSubjectWeeklyFocus(event.target.value)}
                rows={3}
                className="focus-ring resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm leading-6"
              />
            </label>
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
        <h3 className="text-base font-semibold text-slate-950">阶段计划</h3>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {plan.stages.map((stage) => (
            <article key={stage.id} className="rounded-lg border border-slate-200 p-4">
              <h4 className="font-semibold text-slate-950">{stage.name}</h4>
              <div className="mt-3 grid gap-3">
                <label className="grid gap-1.5 text-sm font-medium text-slate-700">
                  开始
                  <input
                    type="date"
                    value={stage.startDate}
                    onChange={(event) => updateStage(stage.id, { startDate: event.target.value })}
                    className="focus-ring min-h-10 rounded-lg border border-slate-200 px-3 text-sm"
                  />
                </label>
                <label className="grid gap-1.5 text-sm font-medium text-slate-700">
                  结束
                  <input
                    type="date"
                    value={stage.endDate}
                    onChange={(event) => updateStage(stage.id, { endDate: event.target.value })}
                    className="focus-ring min-h-10 rounded-lg border border-slate-200 px-3 text-sm"
                  />
                </label>
                <label className="grid gap-1.5 text-sm font-medium text-slate-700">
                  阶段重点
                  <textarea
                    value={stage.focus}
                    onChange={(event) => updateStage(stage.id, { focus: event.target.value })}
                    rows={4}
                    className="focus-ring resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm leading-6"
                  />
                </label>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
        <form onSubmit={addWeeklyPlan} className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-slate-950">添加周计划</h3>
            <button
              type="submit"
              className="focus-ring inline-flex min-h-9 items-center gap-2 rounded-lg bg-teal-600 px-3 text-sm font-medium text-white hover:bg-teal-700"
            >
              <ListPlus className="h-4 w-4" />
              保存
            </button>
          </div>
          <div className="mt-4 grid gap-3">
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              科目
              <select
                value={weeklySubjectId}
                onChange={(event) => setWeeklySubjectId(event.target.value)}
                className="focus-ring min-h-11 rounded-lg border border-slate-200 px-3 text-sm"
              >
                {plan.subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              周计划名称
              <input
                value={weeklyTitle}
                onChange={(event) => setWeeklyTitle(event.target.value)}
                placeholder="例如：数学强化专题"
                className="focus-ring min-h-11 rounded-lg border border-slate-200 px-3 text-sm"
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              周起始日
              <input
                type="date"
                value={weeklyStart}
                onChange={(event) => setWeeklyStart(event.target.value)}
                className="focus-ring min-h-11 rounded-lg border border-slate-200 px-3 text-sm"
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              拆分到每日
              <textarea
                value={weeklyDays}
                onChange={(event) => setWeeklyDays(event.target.value)}
                rows={6}
                className="focus-ring resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm leading-6"
              />
            </label>
          </div>
        </form>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
          <h3 className="text-base font-semibold text-slate-950">每周任务</h3>
          <div className="mt-4 grid gap-4">
            {plan.weeklyPlans.length === 0 && (
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                暂无周计划。
              </div>
            )}
            {plan.weeklyPlans.map((weeklyPlan) => {
              const subject = plan.subjects.find((item) => item.id === weeklyPlan.subjectId);
              return (
                <article key={weeklyPlan.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm text-slate-500">{subject?.name ?? '未绑定科目'} · {weeklyPlan.weekStart}</p>
                      <h4 className="mt-1 font-semibold text-slate-950">{weeklyPlan.title}</h4>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => generateDailyTasks(weeklyPlan)}
                        className="focus-ring inline-flex min-h-9 items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 text-sm font-medium text-teal-700 hover:bg-teal-100"
                      >
                        <CalendarPlus className="h-4 w-4" />
                        生成每日任务
                      </button>
                      <button
                        type="button"
                        onClick={() => removeWeeklyPlan(weeklyPlan.id)}
                        className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-700"
                        aria-label="删除周计划"
                        title="删除周计划"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {weeklyPlan.days.map((day, index) => (
                      <p key={`${weeklyPlan.id}-${index}`} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                        {day}
                      </p>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

export default PlanPage;

import { Award, Gift, Sparkles } from 'lucide-react';
import type { RewardRecord } from '../types';
import { todayISO } from '../utils/date';

interface RewardsPageProps {
  records: RewardRecord[];
}

const sourceClassNames: Record<RewardRecord['source'], string> = {
  今日任务: 'border-sky-100 bg-sky-50 text-sky-700',
  每日待办: 'border-teal-100 bg-teal-50 text-teal-700',
  长期目标: 'border-amber-100 bg-amber-50 text-amber-700',
};

function RewardsPage({ records }: RewardsPageProps) {
  const today = todayISO();
  const todayRecords = records.filter((record) => record.date === today);
  const totalPoints = records.reduce((sum, record) => sum + record.points, 0);
  const todayPoints = todayRecords.reduce((sum, record) => sum + record.points, 0);
  const latestRecords = records.slice(0, 12);

  return (
    <div className="grid gap-5">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
        <div className="grid gap-4 lg:grid-cols-[1fr_180px_180px_180px]">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">奖励中心</h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              每次完成任务都会记录一次奖励反馈，用积分把每天的完成感留下来。
            </p>
          </div>

          <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
            <p className="text-sm text-slate-500">今日积分</p>
            <p className="mt-2 text-3xl font-black text-teal-800">{todayPoints}</p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">总积分</p>
            <p className="mt-2 text-3xl font-black text-slate-950">{totalPoints}</p>
          </div>

          <div className="rounded-lg border border-amber-100 bg-amber-50 p-4">
            <p className="text-sm text-slate-500">完成次数</p>
            <p className="mt-2 text-3xl font-black text-amber-800">{records.length}</p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-950">今日奖励</h3>
            <p className="mt-1 text-sm text-slate-500">{todayRecords.length} 次完成反馈</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-lg border border-teal-100 bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-700">
            <Sparkles className="h-4 w-4" />
            +{todayPoints}
          </span>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {todayRecords.length === 0 && (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              今天还没有奖励记录。
            </div>
          )}

          {todayRecords.map((record) => (
            <article key={record.id} className="rounded-lg border border-teal-100 bg-teal-50 p-4">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-teal-700">
                  <Gift className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="break-words text-sm font-semibold leading-6 text-slate-950">{record.title}</p>
                  <p className="mt-1 text-xs text-teal-700">{record.time} · +{record.points} 分</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
        <h3 className="text-base font-semibold text-slate-950">最近奖励记录</h3>
        <div className="mt-4 grid gap-3">
          {latestRecords.length === 0 && (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              完成任务后会在这里生成奖励记录。
            </div>
          )}

          {latestRecords.map((record) => (
            <article
              key={record.id}
              className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-700">
                  <Award className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="break-words text-sm font-semibold leading-6 text-slate-950">{record.title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {record.date} {record.time}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-lg border px-2.5 py-1 text-xs font-medium ${sourceClassNames[record.source]}`}>
                  {record.source}
                </span>
                <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-700">
                  +{record.points}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default RewardsPage;

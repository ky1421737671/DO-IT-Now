import { Activity, CheckCircle2, Dumbbell, Footprints, ShieldCheck } from 'lucide-react';

const phases = [
  {
    title: '第 1-2 周：核心唤醒',
    goal: '学会收紧腹部，不靠脖子和腰硬撑。',
    rounds: '每次 2 轮',
    items: ['死虫 8 次/侧', '平板支撑 15-25 秒', '仰卧屈膝卷腹 10-12 次', '臀桥 12-15 次', '侧平板 10-15 秒/侧'],
  },
  {
    title: '第 3-4 周：稳定性提升',
    goal: '增加支撑时间，加入下腹部控制。',
    rounds: '每次 3 轮',
    items: ['死虫 10 次/侧', '平板支撑 25-35 秒', '卷腹 12-15 次', '反向卷腹 10-12 次', '侧平板 15-25 秒/侧'],
  },
  {
    title: '第 5-8 周：强化腹肌线条',
    goal: '提高训练密度，开始强化腹直肌和腹斜肌。',
    rounds: '每次 3-4 轮',
    items: ['平板支撑 35-50 秒', '反向卷腹 12-15 次', '自行车卷腹 12 次/侧', '仰卧举腿 8-12 次', '侧平板 25-40 秒/侧'],
  },
];

const weeklySchedule = ['周一：腹肌训练', '周三：腹肌训练', '周五：腹肌训练', '其余天：快走 20-40 分钟或休息'];

const techniqueNotes = [
  '腰不要塌，腹部始终收紧。',
  '卷腹时不要用手拽脖子。',
  '举腿时如果腰离地，就减少幅度或改成屈膝举腿。',
  '宁愿慢一点，也不要甩身体完成动作。',
];

const supportHabits = ['每天走路 7000-10000 步', '每餐保证蛋白质', '少喝含糖饮料，少吃夜宵和油炸'];

function CoreTrainingPage() {
  return (
    <div className="grid gap-5">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
        <div className="grid gap-4 lg:grid-cols-[1fr_220px_220px]">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">新手腹肌训练计划</h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              从零开始的 8 周核心训练。先建立腹部控制，再逐步增加强度，避免一开始练过量。
            </p>
          </div>
          <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
            <p className="text-sm text-slate-500">训练频率</p>
            <p className="mt-2 text-2xl font-black text-teal-800">每周 3 次</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">单次时长</p>
            <p className="mt-2 text-2xl font-black text-slate-950">15-25 分钟</p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="grid content-start gap-5">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-teal-700" />
              <h3 className="text-base font-semibold text-slate-950">每周安排</h3>
            </div>
            <div className="mt-4 grid gap-3">
              {weeklySchedule.map((item) => (
                <p key={item} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  {item}
                </p>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
            <div className="flex items-center gap-2">
              <Footprints className="h-5 w-5 text-teal-700" />
              <h3 className="text-base font-semibold text-slate-950">配合习惯</h3>
            </div>
            <div className="mt-4 grid gap-3">
              {supportHabits.map((habit) => (
                <div key={habit} className="flex items-start gap-2 rounded-lg border border-teal-100 bg-teal-50 px-3 py-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />
                  <p className="text-sm leading-6 text-slate-700">{habit}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-teal-700" />
            <h3 className="text-base font-semibold text-slate-950">8 周训练阶段</h3>
          </div>
          <div className="mt-4 grid gap-4">
            {phases.map((phase) => (
              <article key={phase.title} className="rounded-lg border border-slate-200 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-950">{phase.title}</h4>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{phase.goal}</p>
                  </div>
                  <span className="rounded-lg border border-teal-100 bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-700">
                    {phase.rounds}
                  </span>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {phase.items.map((item) => (
                    <p key={item} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                      {item}
                    </p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-teal-700" />
          <h3 className="text-base font-semibold text-slate-950">动作要求</h3>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {techniqueNotes.map((note) => (
            <p key={note} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700">
              {note}
            </p>
          ))}
        </div>
      </section>
    </div>
  );
}

export default CoreTrainingPage;

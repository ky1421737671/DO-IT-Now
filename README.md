# DO-IT-Now

DO-IT-Now（即做）是一款面向考研与个人执行管理的轻量级 Web 应用。它把今日任务、长期目标、每日待办、复习计划、提醒、备忘、体重记录和核心训练集中在一个界面中，数据默认保存在当前浏览器本地，无需注册账号。

![DO-IT-Now 截图](https://github.com/user-attachments/assets/6766e70c-f7fc-4d37-937a-46af3c16b2df)

## 功能

- **今日任务**：记录科目、优先级、预计用时、截止日期和时间，支持完成、删除与未完成任务自动顺延。
- **长期目标**：管理目标日期、阶段说明和完成状态。
- **每日待办**：维护每日事项和周期模板，记录每天的完成情况。
- **奖励中心**：完成任务后生成积分与奖励记录，保留近期完成反馈。
- **考研计划**：设置考试日期、科目目标、复习阶段和每周计划。
- **提醒**：集中查看今日任务、逾期任务和习惯提醒。
- **备忘**：快速记录复习事项，并可将备忘转为任务。
- **轻体记录**：保存身高、目标体重和体重变化，计算 BMI 并展示趋势。
- **核心训练**：提供从零开始的 8 周核心训练安排。
- **模块管理**：控制侧边栏模块的显示状态，并通过拖拽调整顺序。
- **数据迁移**：将浏览器本地数据导出为 JSON，或通过文件、文本导入到其他设备。

## 技术栈

- React 18
- TypeScript 5
- Vite 5
- Tailwind CSS 3
- Lucide React
- Browser Local Storage

## 快速开始

需要 Node.js 18 或更高版本，以及 npm。

```bash
git clone https://github.com/ky1421737671/DO-IT-Now.git
cd DO-IT-Now
npm install
npm run vite:dev
```

开发服务器默认运行在 [http://127.0.0.1:5173/](http://127.0.0.1:5173/)，支持热更新。

## 构建与预览

生成生产构建：

```bash
npm run build
```

构建产物位于 `dist/`。构建完成后可启动本地静态服务器：

```bash
npm run preview
```

也可以使用以下命令一次完成构建并启动静态服务器：

```bash
npm run dev
```

默认服务地址为 `http://127.0.0.1:5173/`。可通过 `HOST` 和 `PORT` 环境变量调整监听地址与端口。

## 数据存储

应用数据保存在当前浏览器的 `localStorage` 中，不会自动上传到服务器。更换浏览器、清理站点数据或重装系统前，请先在“数据迁移”页面导出 JSON 备份。

导入备份会覆盖当前浏览器中同名的本地数据，操作前建议先导出当前数据。

## 项目结构

```text
DO-IT-Now/
├─ public/              静态资源
├─ scripts/             本地静态服务器脚本
├─ src/
│  ├─ components/       通用界面组件
│  ├─ data/             初始示例数据
│  ├─ hooks/            本地存储 Hook
│  ├─ pages/            各功能页面
│  ├─ utils/            日期与 ID 工具
│  ├─ App.tsx           应用状态与页面入口
│  └─ main.tsx          React 挂载入口
├─ netlify.toml         Netlify 构建与路由配置
├─ package.json         依赖与运行脚本
└─ LICENSE              MIT 许可证
```

## 部署

项目是纯前端应用，可将 `npm run build` 生成的 `dist/` 部署到任意静态托管平台。

仓库已经包含 `netlify.toml`：Netlify 会执行 `npm run build`，发布 `dist/`，并将所有路径回退到 `index.html`。

## 贡献

1. Fork 本仓库。
2. 创建功能分支：`git checkout -b feature/your-feature`。
3. 提交改动：`git commit -m "Describe your change"`。
4. 推送分支并创建 Pull Request。

提交 Pull Request 时，请说明改动目的、验证方式，以及涉及界面变化时的截图。

## 许可证

本项目采用 [MIT License](LICENSE)。允许使用、复制、修改、合并、发布、分发、再许可和销售软件副本，但须保留原版权声明和许可声明。

## 联系

- [项目仓库](https://github.com/ky1421737671/DO-IT-Now)
- [作者主页](https://github.com/ky1421737671)

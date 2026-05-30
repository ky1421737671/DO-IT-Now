import { type ChangeEvent, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Clipboard, Download, Upload } from 'lucide-react';

const DATA_PREFIX = 'kaoyan.';

interface BackupPayload {
  app?: string;
  version?: number;
  exportedAt?: string;
  data?: Record<string, unknown>;
}

interface StatusMessage {
  type: 'success' | 'error' | 'info';
  text: string;
}

const getLocalStorage = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const readPlannerData = () => {
  const storage = getLocalStorage();
  const data: Record<string, unknown> = {};

  if (!storage) {
    return data;
  }

  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);

    if (!key?.startsWith(DATA_PREFIX)) {
      continue;
    }

    try {
      data[key] = JSON.parse(storage.getItem(key) ?? 'null');
    } catch {
      data[key] = storage.getItem(key);
    }
  }

  return data;
};

const createBackupText = () => {
  const payload: BackupPayload = {
    app: 'jizuo',
    version: 1,
    exportedAt: new Date().toISOString(),
    data: readPlannerData(),
  };

  return JSON.stringify(payload, null, 2);
};

const getBackupFileName = () => {
  const stamp = new Date().toISOString().slice(0, 10);
  return `jizuo-backup-${stamp}.json`;
};

const getDataEntryCount = (data: Record<string, unknown>) => {
  return Object.values(data).reduce<number>((total, value) => {
    if (Array.isArray(value)) {
      return total + value.length;
    }

    return total + 1;
  }, 0);
};

const parseImportText = (text: string) => {
  const parsed = JSON.parse(text) as BackupPayload | Record<string, unknown>;
  const candidateData =
    parsed && typeof parsed === 'object' && 'data' in parsed && parsed.data && typeof parsed.data === 'object'
      ? parsed.data
      : parsed;

  if (!candidateData || typeof candidateData !== 'object') {
    throw new Error('备份文件格式不正确。');
  }

  const entries = Object.entries(candidateData).filter(([key]) => key.startsWith(DATA_PREFIX));

  if (entries.length === 0) {
    throw new Error('没有找到可导入的即做数据。');
  }

  return entries;
};

function DataTransferPage() {
  const [exportText, setExportText] = useState('');
  const [importText, setImportText] = useState('');
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [summary, setSummary] = useState({ keyCount: 0, itemCount: 0 });

  const statusClassName = useMemo(() => {
    if (status?.type === 'success') {
      return 'border-teal-100 bg-teal-50 text-teal-800';
    }

    if (status?.type === 'error') {
      return 'border-rose-100 bg-rose-50 text-rose-800';
    }

    return 'border-slate-200 bg-slate-50 text-slate-700';
  }, [status?.type]);

  const refreshSummary = () => {
    const data = readPlannerData();
    setSummary({
      keyCount: Object.keys(data).length,
      itemCount: getDataEntryCount(data),
    });
  };

  useEffect(() => {
    refreshSummary();
  }, []);

  const exportBackup = () => {
    const backupText = createBackupText();
    const blob = new Blob([backupText], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = getBackupFileName();
    link.click();
    URL.revokeObjectURL(url);
    setExportText(backupText);
    setStatus({ type: 'success', text: '已生成备份文件。把这个 JSON 文件发送到手机后，在手机端导入即可。' });
    refreshSummary();
  };

  const copyBackup = async () => {
    const backupText = exportText || createBackupText();
    setExportText(backupText);

    try {
      await navigator.clipboard.writeText(backupText);
      setStatus({ type: 'success', text: '备份内容已复制。可以粘贴到手机端的导入文本框。' });
    } catch {
      setStatus({ type: 'info', text: '浏览器没有允许自动复制。下方备份内容已生成，可以手动复制。' });
    }
  };

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];

    if (!file) {
      return;
    }

    const text = await file.text();
    setImportText(text);
    setStatus({ type: 'info', text: '备份文件已读取。确认内容无误后点击导入。' });
  };

  const importBackup = () => {
    const storage = getLocalStorage();

    if (!storage) {
      setStatus({ type: 'error', text: '当前浏览器不支持 localStorage，无法导入。' });
      return;
    }

    try {
      const entries = parseImportText(importText);

      entries.forEach(([key, value]) => {
        storage.setItem(key, JSON.stringify(value));
      });

      setStatus({ type: 'success', text: `已导入 ${entries.length} 类数据，页面即将刷新。` });
      window.setTimeout(() => window.location.reload(), 800);
    } catch (error) {
      setStatus({
        type: 'error',
        text: error instanceof Error ? error.message : '导入失败，请检查 JSON 内容。',
      });
    }
  };

  return (
    <div className="grid gap-5">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
        <div className="grid gap-4 lg:grid-cols-[1fr_180px_180px]">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">数据迁移</h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              把当前浏览器里的本地记录导出成 JSON，再在手机端导入。导入会覆盖同名本地数据。
            </p>
          </div>
          <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
            <p className="text-sm text-slate-500">数据类别</p>
            <p className="mt-2 text-3xl font-black text-teal-800">{summary.keyCount}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">记录估算</p>
            <p className="mt-2 text-3xl font-black text-slate-950">{summary.itemCount}</p>
          </div>
        </div>
      </section>

      {status && (
        <div className={`rounded-lg border px-4 py-3 text-sm ${statusClassName}`}>
          <div className="flex items-start gap-2">
            {status.type === 'error' ? (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <p className="leading-6">{status.text}</p>
          </div>
        </div>
      )}

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-slate-950">导出电脑记录</h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={copyBackup}
                className="focus-ring inline-flex min-h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <Clipboard className="h-4 w-4" />
                复制
              </button>
              <button
                type="button"
                onClick={exportBackup}
                className="focus-ring inline-flex min-h-9 items-center gap-2 rounded-lg bg-teal-600 px-3 text-sm font-medium text-white hover:bg-teal-700"
              >
                <Download className="h-4 w-4" />
                导出
              </button>
            </div>
          </div>
          <textarea
            value={exportText}
            readOnly
            rows={12}
            placeholder="点击导出或复制后，这里会显示备份内容。"
            className="mt-4 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs leading-5 text-slate-600"
          />
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-slate-950">导入到当前设备</h3>
            <button
              type="button"
              onClick={importBackup}
              className="focus-ring inline-flex min-h-9 items-center gap-2 rounded-lg bg-teal-600 px-3 text-sm font-medium text-white hover:bg-teal-700"
            >
              <Upload className="h-4 w-4" />
              导入
            </button>
          </div>

          <label className="mt-4 grid gap-1.5 text-sm font-medium text-slate-700">
            选择 JSON 备份文件
            <input
              type="file"
              accept="application/json,.json"
              onChange={handleImportFile}
              className="focus-ring rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>

          <label className="mt-4 grid gap-1.5 text-sm font-medium text-slate-700">
            或粘贴备份内容
            <textarea
              value={importText}
              onChange={(event) => setImportText(event.target.value)}
              rows={10}
              placeholder="把导出的 JSON 内容粘贴到这里。"
              className="resize-none rounded-lg border border-slate-200 px-3 py-2 font-mono text-xs leading-5 text-slate-700"
            />
          </label>
        </div>
      </section>
    </div>
  );
}

export default DataTransferPage;

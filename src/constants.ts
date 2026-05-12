import type { Priority } from './types';

export const priorityMeta: Record<Priority, { label: string; className: string; dot: string }> = {
  high: {
    label: '高',
    className: 'border-rose-200 bg-rose-50 text-rose-700',
    dot: 'bg-rose-500',
  },
  medium: {
    label: '中',
    className: 'border-amber-200 bg-amber-50 text-amber-700',
    dot: 'bg-amber-500',
  },
  low: {
    label: '低',
    className: 'border-sky-200 bg-sky-50 text-sky-700',
    dot: 'bg-sky-500',
  },
};

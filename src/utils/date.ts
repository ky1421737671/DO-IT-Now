const pad = (value: number) => value.toString().padStart(2, '0');

export const toLocalISODate = (date: Date) => {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export const todayISO = () => toLocalISODate(new Date());

export const tomorrowISO = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return toLocalISODate(date);
};

export const addDays = (dateISO: string, days: number) => {
  const date = new Date(`${dateISO}T00:00:00`);
  date.setDate(date.getDate() + days);
  return toLocalISODate(date);
};

export const getDaysBetween = (fromISO: string, toISO: string) => {
  const from = new Date(`${fromISO}T00:00:00`).getTime();
  const to = new Date(`${toISO}T00:00:00`).getTime();
  return Math.ceil((to - from) / (1000 * 60 * 60 * 24));
};

export const formatMinutes = (minutes: number) => {
  if (minutes < 60) {
    return `${minutes} 分钟`;
  }
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} 小时 ${rest} 分钟` : `${hours} 小时`;
};

export const getWeekStart = (dateISO = todayISO()) => {
  const date = new Date(`${dateISO}T00:00:00`);
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - day + 1);
  return toLocalISODate(date);
};

export const isPastDate = (dateISO: string) => dateISO < todayISO();

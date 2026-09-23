const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayDateString(now: Date = new Date()): string {
  return toDateString(now);
}

export function parseDateString(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function isValidDateString(value: string): boolean {
  if (!DATE_PATTERN.test(value)) return false;
  return toDateString(parseDateString(value)) === value;
}

export function addDays(value: string, days: number): string {
  const date = parseDateString(value);
  date.setDate(date.getDate() + days);
  return toDateString(date);
}

export function startOfMonth(value: string): string {
  return `${value.slice(0, 7)}-01`;
}

export function endOfMonth(value: string): string {
  const date = parseDateString(value);
  return toDateString(new Date(date.getFullYear(), date.getMonth() + 1, 0));
}

export function monthDates(month: string): string[] {
  const start = `${month}-01`;
  const end = endOfMonth(start);
  const dates: string[] = [];
  for (let date = start; date <= end; date = addDays(date, 1)) dates.push(date);
  return dates;
}

export function startOfWeek(value: string): string {
  const date = parseDateString(value);
  return addDays(value, -date.getDay());
}

export function weekDates(value: string): string[] {
  const start = startOfWeek(value);
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

export function formatLongDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(parseDateString(value));
}

export function formatMonthLabel(month: string): string {
  return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(
    parseDateString(`${month}-01`),
  );
}

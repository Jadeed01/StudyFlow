export function getMonthGrid(year, month) {
  // month is 0-indexed
  const firstOfMonth = new Date(year, month, 1);
  const startDay = firstOfMonth.getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells = [];

  for (let i = startDay - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, currentMonth: false, date: new Date(year, month - 1, daysInPrevMonth - i) });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, currentMonth: true, date: new Date(year, month, d) });
  }
  while (cells.length % 7 !== 0) {
    const next = cells.length - (startDay + daysInMonth) + 1;
    cells.push({ day: next, currentMonth: false, date: new Date(year, month + 1, next) });
  }

  return cells;
}

export function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function toDateKey(date) {
  return date.toISOString().split("T")[0];
}
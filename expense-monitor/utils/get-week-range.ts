export function getLocalSundayWeekRange(
  week: number,
  month: number,
  year: number
) {
  // Local midnight (NOT UTC)
  const firstDayOfMonth = new Date(
    year,
    month - 1,
    1,
    0,
    0,
    0,
    0
  );

  const firstDayWeekday = firstDayOfMonth.getDay(); // 0 = Sunday

  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(
    1 - firstDayWeekday + (week - 1) * 7
  );
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  endDate.setHours(23, 59, 59, 999);

  return { startDate, endDate };
}

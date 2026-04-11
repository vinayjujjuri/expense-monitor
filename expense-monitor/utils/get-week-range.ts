export function getLocalSundayWeekRange(
  week: number,
  month: number,
  year: number
) {
  // Use UTC-based math to avoid timezone leakage across day boundaries.
  // Treat `month` as 1-based.
  const firstDayOfMonthUtc = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));

  const firstDayWeekday = firstDayOfMonthUtc.getUTCDay(); // 0 = Sunday

  const startDate = new Date(firstDayOfMonthUtc);
  startDate.setUTCDate(1 - firstDayWeekday + (week - 1) * 7);
  startDate.setUTCHours(0, 0, 0, 0);
  // Compute next week's UTC-start, then set endDate to the millisecond before that
  const nextWeekStart = new Date(startDate);
  nextWeekStart.setUTCDate(startDate.getUTCDate() + 7);
  nextWeekStart.setUTCHours(0, 0, 0, 0);

  const endDate = new Date(nextWeekStart.getTime() - 1); // last ms of the current week

  // Cap range to the month boundaries (UTC) so weeks won't include days from adjacent months
  const monthStartUtc = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const monthEndUtc = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

  if (startDate.getTime() < monthStartUtc.getTime()) startDate.setTime(monthStartUtc.getTime());
  if (endDate.getTime() > monthEndUtc.getTime()) endDate.setTime(monthEndUtc.getTime());

  // Ensure endDate is not before startDate (can happen for out-of-range weeks)
  if (endDate.getTime() < startDate.getTime()) endDate.setTime(startDate.getTime());

  // Convert UTC-based start/end to local-date equivalents so formatting in local timezone
  // doesn't shift the visible date into the next/previous day.
  const localStart = new Date(
    startDate.getUTCFullYear(),
    startDate.getUTCMonth(),
    startDate.getUTCDate(),
    0,
    0,
    0,
    0
  );

  const localEnd = new Date(
    endDate.getUTCFullYear(),
    endDate.getUTCMonth(),
    endDate.getUTCDate(),
    23,
    59,
    59,
    999
  );

  return { startDate: localStart, endDate: localEnd };
}

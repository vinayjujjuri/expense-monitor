export function getLocalSundayWeekRange(
  week: number,
  month: number,
  year: number
) {
  const monthIndex = month - 1;

  // 1️⃣ First day of the month
  const firstOfMonth = new Date(year, monthIndex, 1);

  // 2️⃣ Find Sunday on or before the 1st
  const firstSunday = new Date(firstOfMonth);
  firstSunday.setDate(
    firstOfMonth.getDate() - firstOfMonth.getDay()
  );

  // 3️⃣ Calculate week start & end
  const startDate = new Date(firstSunday);
  startDate.setDate(firstSunday.getDate() + (week - 1) * 7);

  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  endDate.setHours(23, 59, 59, 999);

  return {
    startDate,
    endDate,
    label: `${startDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    })} – ${endDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    })}`,
  };
}

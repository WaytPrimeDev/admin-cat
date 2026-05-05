export const getKittenAgeInWeeks = (birthDateString: string) => {
  const now = Date.now();
  if (!birthDateString) return 0;
  const birthDayMs = Date.parse(birthDateString);
  const diffInMs = now - birthDayMs;
  const msInWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.max(0, Math.floor(diffInMs / msInWeek));
};

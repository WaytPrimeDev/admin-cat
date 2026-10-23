// YYYY-MM-DD по локальному времени — формат <input type="date">
export const getTodayDateString = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
};

export const isNotFutureDate = (dateString: string) =>
  !dateString || dateString <= getTodayDateString();

export const getDateByISOString = (isoDate: string): string => {
  return new Date(isoDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const getTimeByISOString = (isoDate: string): string => {
  return new Date(isoDate).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

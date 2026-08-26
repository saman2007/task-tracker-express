import bcrypt from "bcrypt";

export const getFormattedDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const getFormattedTime = (date: Date): string => {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

export const hashPassword = (password: string) => {
  return bcrypt.hash(password, 10);
};

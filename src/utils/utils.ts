import crypto from "crypto";

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

export const hashStr = (password: string) => {
  return bcrypt.hash(password, 10);
};

export const generateToken = (bytes: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(bytes, (err, buff) => {
      if (!err) return resolve(buff.toString("hex"));
      else return reject(err);
    });
  });
};

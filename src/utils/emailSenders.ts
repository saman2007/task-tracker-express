import path from "path";

import pug from "pug";

import { sendEmail } from "./smtp";

export type EmailSender<T extends object | undefined = undefined> = [
  T,
] extends [object]
  ? (to: string, data: T) => void
  : (to: string) => void;

export const sendAccountVerifyLinkEmail: EmailSender<{ token: string }> = (
  to,
  { token },
) => {
  sendEmail({
    fromName: "TaskTracker",
    to,
    subject: "Verify your TaskTracker account",
    html: pug.renderFile(
      path.join(__dirname, "..", "views", "emails", "verify-account.pug"),
      {
        verifyUrl: `${process.env.DEPLOY_URL}/account/verify-account?token=${token}&email=${to}`,
        expiresIn: "24 hours",
      },
    ),
  });
};

export const sendWelcomeEmail: EmailSender<{
  fullname: string;
  token: string;
}> = (to, { fullname, token }) => {
  sendEmail({
    fromName: "TaskTracker",
    to: to,
    subject: "Welcome to Task Tracker! 🎉",
    html: pug.renderFile(
      path.join(__dirname, "..", "views", "emails", "welcome.pug"),
      {
        fullname: fullname,
        verifyUrl: `${process.env.DEPLOY_URL}/account/verify-account?token=${token}&email=${to}`,
        expiresIn: "24 hours",
      },
    ),
  });
};

export const sendChangeEmailLink: EmailSender<{
  token: string;
  fullname: string;
  email: string;
}> = (to, { token, fullname, email }) => {
  sendEmail({
    fromName: "TaskTracker",
    to,
    subject: "Confirm your new email address",
    html: pug.renderFile(
      path.join(__dirname, "..", "views", "emails", "change-email.pug"),
      {
        fullname,
        changeEmailUrl: `${process.env.DEPLOY_URL}/account/change-email?token=${token}&email=${email}`,
        expiresIn: "1 hour",
      },
    ),
  });
};

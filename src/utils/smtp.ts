const EMAILJS_BASE_URL = "https://api.emailjs.com/api/v1.0";

export interface SendEmailData {
  to: string;
  subject: string;
  fromName: string;
  html: string;
}

export async function sendEmail(data: SendEmailData): Promise<Response> {
  const url = EMAILJS_BASE_URL + "/email/send";

  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    method: "POST",
    body: JSON.stringify({
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: "main-template",
      user_id: process.env.EMAILJS_PUBLIC_KEY,
      accessToken: process.env.EMAILJS_PRIVATE_KEY,
      template_params: data,
    }),
  });

  return res;
}
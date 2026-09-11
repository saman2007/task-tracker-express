declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT?: string;
      DB_NAME: string;
      DB_USERNAME: string;
      DB_PASSWORD: string;
      DB_HOST: string;
      DB_PORT: string;
      SESSION_SECRET: string;
      DEPLOY_URL: string;
      EMAILJS_SERVICE_ID: string;
      EMAILJS_PUBLIC_KEY: string;
      EMAILJS_PRIVATE_KEY: string;
    }
  }
}

export {};

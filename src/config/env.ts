import dotenv from "dotenv";
dotenv.config({ path: [".env", ".env.local"] });

export const ENV = {
  // client bot
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.DISCORD_CLIENT_ID,
  // env
  env: process.env.NODE_ENV,
};

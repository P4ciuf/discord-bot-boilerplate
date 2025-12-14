import dotenv from "dotenv";
dotenv.config({ path: [".env", ".env.local"] });

type Env = Record<string, string | undefined>;
export const ENV: Env = {
	TOKEN: process.env.TOKEN,
	CLIENT_ID: process.env.CLIENT_ID,
	MONGODB_URI: process.env.MONGODB_URI,
};

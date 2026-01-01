import { client } from "./core/client";

export async function shutdown() {
  try {
    await client.destroy();
    console.info("Client successfully destroyed");
  } catch (err) {
    console.error("Bot shutdown error: " + err);
  }
}

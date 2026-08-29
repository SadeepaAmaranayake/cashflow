import "dotenv/config";
import mongoose from "mongoose";
import app from "./app.js";
import { connectDatabase } from "./config/database.js";

const host = "0.0.0.0";
const port = Number(process.env.PORT ?? 3000);

async function startServer(): Promise<void> {
  await connectDatabase();

  const server = app.listen(port, host, () => {
    console.log(`Server listening on http://${host}:${port}`);
  });

  let isShuttingDown = false;

  async function shutdown(signal: NodeJS.Signals): Promise<void> {
    if (isShuttingDown) {
      return;
    }

    isShuttingDown = true;
    console.log(`${signal} received. Shutting down...`);

    try {
      await new Promise<void>((resolve, reject) => {
        server.close((error?: Error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      });

      await mongoose.disconnect();
      console.log("Server and MongoDB connection closed");
      process.exit(0);
    } catch (error) {
      console.error("Shutdown failed:", error);
      process.exit(1);
    }
  }

  process.once("SIGINT", () => void shutdown("SIGINT"));
  process.once("SIGTERM", () => void shutdown("SIGTERM"));
}

startServer().catch(async (error) => {
  console.error("Server startup failed:", error);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
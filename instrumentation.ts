export const runtime = "nodejs";
import { rollbar } from "@/rollbar";

export async function register() {
  process.on("unhandledRejection", (reason:string) => {
    rollbar.error("Unhandled promise rejection", reason);
  });

  process.on("uncaughtException", (err) => {
    rollbar.error("Uncaught exception", err);
  });
}

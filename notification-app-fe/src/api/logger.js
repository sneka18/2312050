import axios from "axios";
import { BACKEND_URL } from "../config";

export async function log(stack, level, packageName, message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level}] [${packageName}] ${message}`, stack ? `\nStack: ${stack}` : "");
  
  try {
    await axios.post(`${BACKEND_URL}/logs`, {
      timestamp,
      stack: stack || "N/A",
      level,
      packageName,
      message
    });
  } catch (error) {
    console.error("Failed to send log to server:", error);
  }
}

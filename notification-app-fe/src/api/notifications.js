import axios from "axios";
import { BACKEND_URL } from "../config";
import { log } from "./logger";

export async function fetchNotifications(params = {}) {
  const { page = 1, limit = 10, type = "All" } = params;
  try {
    await log(null, "INFO", "frontend.api", `Fetching notifications: page=${page}, limit=${limit}, type=${type}`);
    
    const queryParams = new URLSearchParams();
    queryParams.append("page", page);
    queryParams.append("limit", limit);
    if (type && type !== "All") {
      queryParams.append("notification_type", type);
    }

    const response = await axios.get(`${BACKEND_URL}/notifications?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    await log(error.stack, "ERROR", "frontend.api", `Error fetching notifications: ${error.message}`);
    throw error;
  }
}

export async function fetchPriorityNotifications(limit = 10) {
  try {
    await log(null, "INFO", "frontend.api", `Fetching priority notifications: limit=${limit}`);
    const response = await axios.get(`${BACKEND_URL}/notifications/priority?limit=${limit}`);
    return response.data;
  } catch (error) {
    await log(error.stack, "ERROR", "frontend.api", `Error fetching priority: ${error.message}`);
    throw error;
  }
}

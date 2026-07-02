const { fetchExternalNotifications } = require("../service/apiService");
const { Log } = require("../utils/logger");

const WEIGHT_MAP = {
  "Placement": 3,
  "Result": 2,
  "Event": 1
};

async function getNotifications(req, res) {
  const { page = 1, limit = 10, notification_type } = req.query;
  try {
    const data = await fetchExternalNotifications({ page, limit, notification_type });
    return res.status(200).json(data);
  } catch (error) {
    Log(error.stack, "ERROR", "backend.notificationController", `Failed to get notifications: ${error.message}`);
    return res.status(500).json({ error: "Failed to fetch notifications" });
  }
}

async function getPriorityNotifications(req, res) {
  const limit = parseInt(req.query.limit) || 10;
  try {
    const data = await fetchExternalNotifications({ page: 1, limit: 100 });
    const list = data.notifications || [];

    const sorted = [...list].sort((a, b) => {
      const weightA = WEIGHT_MAP[a.Type] || 0;
      const weightB = WEIGHT_MAP[b.Type] || 0;
      
      if (weightA !== weightB) {
        return weightB - weightA;
      }
      return new Date(b.Timestamp) - new Date(a.Timestamp);
    });

    const topPriorities = sorted.slice(0, limit);

    return res.status(200).json({
      notifications: topPriorities,
      limit: limit,
      total: topPriorities.length
    });
  } catch (error) {
    Log(error.stack, "ERROR", "backend.notificationController", `Failed to get priority: ${error.message}`);
    return res.status(500).json({ error: "Failed to fetch priority notifications" });
  }
}

module.exports = {
  getNotifications,
  getPriorityNotifications
};

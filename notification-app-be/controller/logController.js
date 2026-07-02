const { Log } = require("../utils/logger");

function createLog(req, res) {
  const { stack, level, packageName, message } = req.body;
  try {
    Log(stack, level, `frontend.${packageName || "app"}`, message);
    return res.status(201).json({ success: true });
  } catch (error) {
    console.error("Error writing frontend log:", error);
    return res.status(500).json({ error: "Failed to write log" });
  }
}

module.exports = { createLog };

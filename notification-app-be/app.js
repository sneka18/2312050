const express = require("express");
const cors = require("cors");
const { loggingMiddleware } = require("./utils/middleware");
const { getNotifications, getPriorityNotifications } = require("./controller/notificationController");
const { createLog } = require("./controller/logController");

const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "OPTIONS"]
}));

app.use(express.json());
app.use(loggingMiddleware);

app.get("/api/notifications", getNotifications);
app.get("/api/notifications/priority", getPriorityNotifications);
app.post("/api/logs", createLog);

app.use((err, req, res, next) => {
  const { Log } = require("./utils/logger");
  Log(err.stack, "ERROR", "backend.app", `Unhandled Exception: ${err.message}`);
  res.status(500).json({ error: "Internal Server Error" });
});

module.exports = app;

const express = require("express");
const cors = require("cors");
const { loggingMiddleware } = require("./utils/middleware");
const notificationRoutes = require("./routes/notificationRoutes");
const logRoutes = require("./routes/logRoutes");

const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "OPTIONS"]
}));

app.use(express.json());
app.use(loggingMiddleware);

// Mount routers
app.use("/api/notifications", notificationRoutes);
app.use("/api/logs", logRoutes);

app.use((err, req, res, next) => {
  const { Log } = require("./utils/logger");
  Log(err.stack, "ERROR", "backend.app", `Unhandled Exception: ${err.message}`);
  res.status(500).json({ error: "Internal Server Error" });
});

module.exports = app;

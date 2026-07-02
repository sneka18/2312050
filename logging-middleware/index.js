const fs = require("fs");
const path = require("path");

// Ensure logs directory exists at the root of the workspace
const logDirectory = path.join(__dirname, "..", "logs");
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

const logFilePath = path.join(logDirectory, "app.log");

async function Log(stack, level, packageName, message) {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] [${level}] [${packageName}] - ${message}${stack ? ` | Stack: ${stack}` : ""}\n`;
  
  // Console logging for local debugging
  console.log(logLine.trim());

  // Log file logging
  fs.appendFile(logFilePath, logLine, (err) => {
    if (err) console.error("Failed to write log to file:", err);
  });

  // Make API call to the Test Server
  try {
    await fetch("http://4.224.186.213/evaluation-service/logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        stack: stack,
        level: level,
        package: packageName,
        message: message
      })
    });
  } catch (err) {
    console.error("Failed to send log to evaluation server:", err.message);
  }
}

function requestLogger(req, res, next) {
  const start = Date.now();
  Log("backend", "INFO", "middleware", `Incoming Request: ${req.method} ${req.originalUrl} from ${req.ip}`);

  res.on("finish", () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 400 ? "ERROR" : "INFO";
    Log(
      res.statusCode >= 500 ? new Error("Server Error").stack : "backend",
      level,
      "middleware",
      `Response: ${req.method} ${req.originalUrl} | Status: ${res.statusCode} | Duration: ${duration}ms`
    );
  });

  next();
}

module.exports = {
  Log,
  requestLogger
};

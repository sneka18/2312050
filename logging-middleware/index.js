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
        "Content-Type": "application/json",
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiIyMzEyMDUwQG5lYy5lZHUuaW4iLCJleHAiOjE3ODI5NzYzMDYsImlhdCI6MTc4Mjk3NTQwNiwiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6IjNlNjc4NTQ5LWM2ZDgtNDJhNy1iOGVhLWUxNTVmN2UzNTNkYSIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6InNuZWthIHIiLCJzdWIiOiI2NTgzNmY0YS1lYmQwLTQwODUtYWVhNC1lM2NiMDYzZTI2MDYifSwiZW1haWwiOiIyMzEyMDUwQG5lYy5lZHUuaW4iLCJuYW1lIjoic25la2EgciIsInJvbGxObyI6IjIzMTIwNTAiLCJhY2Nlc3NDb2RlIjoiRVJ6VXl4IiwiY2xpZW50SUQiOiI2NTgzNmY0YS1lYmQwLTQwODUtYWVhNC1lM2NiMDYzZTI2MDYiLCJjbGllbnRTZWNyZXQiOiJzVlh1dnJrY0dweFVURVpXIn0._QUzWAjbSwC40kiUw6zbeSv9gCKo4E0yL8S1X9ps8M0"
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

// Test execution block for when running `node index.js` directly
if (require.main === module) {
  (async () => {
    console.log("Testing Log function execution...");
    await Log(
      "backend",
      "INFO",
      "handler",
      "Testing the logging middleware"
    );
    console.log("Test log sent successfully!");
  })();
}

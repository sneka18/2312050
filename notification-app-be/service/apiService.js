const axios = require("axios");
const { Log } = require("../utils/logger");

function generateMockNotifications() {
  const types = ["Placement", "Result", "Event"];
  const companies = ["Advanced Micro Devices Inc.", "Google", "Microsoft", "CSX Corporation", "AffordMed", "Nvidia", "Meta"];
  const subjects = ["mid-sem", "project-review", "external-lab", "final-exams", "viva-voce"];
  const events = ["tech-fest", "farewell", "cultural-night", "hacksprint", "sports-meet"];
  
  const list = [];
  const baseTime = new Date("2026-04-22T17:51:30");

  for (let i = 0; i < 100; i++) {
    const type = types[i % 3];
    let message = "";
    
    if (type === "Placement") {
      message = `${companies[(i * 3) % companies.length]} hiring drive for Software Engineers`;
    } else if (type === "Result") {
      message = `${subjects[(i * 7) % subjects.length]} evaluation results published`;
    } else {
      message = `${events[(i * 11) % events.length]} scheduled - register now`;
    }

    const itemTime = new Date(baseTime.getTime() - i * 12000);
    const pad = (num) => String(num).padStart(2, "0");
    const timestampStr = `${itemTime.getFullYear()}-${pad(itemTime.getMonth() + 1)}-${pad(itemTime.getDate())} ${pad(itemTime.getHours())}:${pad(itemTime.getMinutes())}:${pad(itemTime.getSeconds())}`;

    list.push({
      ID: `mock-uuid-${100000000000 + i}`,
      Type: type,
      Message: message,
      Timestamp: timestampStr
    });
  }
  return list;
}

const localMockData = generateMockNotifications();

async function fetchExternalNotifications(params = {}) {
  const { page = 1, limit = 10, notification_type } = params;
  const externalUrl = process.env.NOTIFICATION_API_URL || "http://4.224.186";
  
  try {
    Log(null, "INFO", "backend.apiService", `Fetching from external URL: ${externalUrl} with parameters page=${page}, limit=${limit}, type=${notification_type}`);
    
    const queryParams = {};
    if (page) queryParams.page = page;
    if (limit) queryParams.limit = limit;
    if (notification_type) queryParams.notification_type = notification_type;

    const response = await axios.get(externalUrl, { 
      params: queryParams, 
      timeout: 2000,
      headers: {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiIyMzEyMDUwQG5lYy5lZHUuaW4iLCJleHAiOjE3ODI5NzYxMTUsImlhdCI6MTc4Mjk3NTIxNSwiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6ImZlNGFmZDhjLTMyMWItNGJiNy04MmM0LTEzZGVlMDJhZDE5YyIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6InNuZWthIHIiLCJzdWIiOiI2NTgzNmY0YS1lYmQwLTQwODUtYWVhNC1lM2NiMDYzZTI2MDYifSwiZW1haWwiOiIyMzEyMDUwQG5lYy5lZHUuaW4iLCJuYW1lIjoic25la2EgciIsInJvbGxObyI6IjIzMTIwNTAiLCJhY2Nlc3NDb2RlIjoiRVJ6VXl4IiwiY2xpZW50SUQiOiI2NTgzNmY0YS1lYmQwLTQwODUtYWVhNC1lM2NiMDYzZTI2MDYiLCJjbGllbnRTZWNyZXQiOiJzVlh1dnJrY0dweFVURVpXIn0.hnk2IqMWhyqpAFHjcszuR1MgciRrbdaI3GcH633Jq28"
      }
    });
    return response.data;
  } catch (error) {
    Log(
      error.stack,
      "WARNING",
      "backend.apiService",
      `External API failed or is unreachable (${error.message}). Falling back to local data source.`
    );
    
    let filteredList = [...localMockData];
    if (notification_type) {
      filteredList = filteredList.filter(n => n.Type === notification_type);
    }
    
    filteredList.sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp));
    
    const startIndex = (page - 1) * limit;
    const paginatedList = filteredList.slice(startIndex, startIndex + parseInt(limit));
    const totalPages = Math.ceil(filteredList.length / limit);

    return {
      notifications: paginatedList,
      total: filteredList.length,
      totalPages: totalPages
    };
  }
}

module.exports = { fetchExternalNotifications };

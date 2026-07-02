import { useState, useEffect } from "react";
import { Box, Divider, Stack, Typography, FormControl, Select, MenuItem, Paper } from "@mui/material";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";

import { fetchPriorityNotifications } from "../api/notifications";

export function PriorityPage() {
  const [priorityLimit, setPriorityLimit] = useState(10);
  const [priorityNotifications, setPriorityNotifications] = useState([]);
  
  const [readIds, setReadIds] = useState(() => {
    const saved = localStorage.getItem("read_notifications");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("read_notifications", JSON.stringify(readIds));
  }, [readIds]);

  useEffect(() => {
    const loadPriority = async () => {
      try {
        const data = await fetchPriorityNotifications(priorityLimit);
        if (data && data.notifications) {
          setPriorityNotifications(data.notifications);
        }
      } catch (err) {
        console.error("Failed to load priority inbox:", err);
      }
    };
    loadPriority();
  }, [priorityLimit]);

  const handleMarkAsRead = (id) => {
    if (!readIds.includes(id)) {
      setReadIds((prev) => [...prev, id]);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", px: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3} flexWrap="wrap" gap={2}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <PriorityHighIcon sx={{ fontSize: 32, color: "#d32f2f" }} />
          <Typography variant="h4" fontWeight={800} color="#1e3c72">
            Priority Inbox
          </Typography>
        </Stack>
      </Stack>

      <Divider sx={{ mb: 4 }} />

      <Paper elevation={2} sx={{ p: 4, borderRadius: 3, backgroundColor: "linear-gradient(to bottom, #ffffff, #fcfcfc)" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" fontWeight={700} color="text.secondary">
            Top Priority Items
          </Typography>
          <FormControl size="small" sx={{ width: 100 }}>
            <Select
              value={priorityLimit}
              onChange={(e) => setPriorityLimit(e.target.value)}
              sx={{ fontWeight: 700 }}
            >
              <MenuItem value={5}>Top 5</MenuItem>
              <MenuItem value={10}>Top 10</MenuItem>
              <MenuItem value={15}>Top 15</MenuItem>
              <MenuItem value={20}>Top 20</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {priorityNotifications.length === 0 ? (
          <Typography variant="body1" color="text.secondary" textAlign="center" py={6}>
            No priority items available.
          </Typography>
        ) : (
          <Stack spacing={2}>
            {priorityNotifications.map((item, index) => {
              const isRead = readIds.includes(item.ID);
              return (
                <Box
                  key={item.ID}
                  onClick={() => handleMarkAsRead(item.ID)}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    cursor: "pointer",
                    backgroundColor: isRead ? "rgba(243, 244, 246, 0.5)" : "rgba(30, 60, 114, 0.03)",
                    borderLeft: `5px solid ${item.Type === "Placement" ? "#d32f2f" : item.Type === "Result" ? "#f57c00" : "#388e3c"}`,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: "translateX(4px)",
                      backgroundColor: isRead ? "rgba(243, 244, 246, 0.9)" : "rgba(30, 60, 114, 0.08)",
                      boxShadow: 2
                    }
                  }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="subtitle2" fontWeight={800} color={item.Type === "Placement" ? "error.main" : item.Type === "Result" ? "warning.main" : "success.main"}>
                      #{index + 1} {item.Type}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      {item.Timestamp}
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight={isRead ? 400 : 700} sx={{ color: isRead ? "text.secondary" : "text.primary" }}>
                    {item.Message}
                  </Typography>
                </Box>
              );
            })}
          </Stack>
        )}
      </Paper>
    </Box>
  );
}

import { useState, useEffect } from "react";
import {
  Alert,
  Badge,
  Box,
  CircularProgress,
  Divider,
  Pagination,
  Stack,
  Typography,
  Grid,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import RefreshIcon from "@mui/icons-material/Refresh";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";

import { NotificationCard } from "../components/NotificationCard";
import { NotificationFilter } from "../components/NotificationFilter";
import { useNotifications } from "../hooks/useNotifications";
import { fetchPriorityNotifications } from "../api/notifications";
import { log } from "../api/logger";

export function NotificationsPage() {
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [priorityLimit, setPriorityLimit] = useState(10);

  const { notifications, totalPages, loading, error } = useNotifications({
    page,
    limit,
    type: filter,
  });

  const [priorityNotifications, setPriorityNotifications] = useState([]);

  // Local storage state tracking for read notifications
  const [readIds, setReadIds] = useState(() => {
    const saved = localStorage.getItem("read_notifications");
    return saved ? JSON.parse(saved) : [];
  });

  // Calculate unread count
  const unreadCount = notifications.filter((n) => !readIds.includes(n.ID)).length;

  useEffect(() => {
    localStorage.setItem("read_notifications", JSON.stringify(readIds));
  }, [readIds]);

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

  useEffect(() => {
    loadPriority();
  }, [priorityLimit]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPage(1);
    log(null, "INFO", "frontend.page", `Filter changed to ${newFilter}`);
  };

  const handlePageChange = (_, newPage) => {
    setPage(newPage);
    log(null, "INFO", "frontend.page", `Page changed to ${newPage}`);
  };

  const handleMarkAsRead = (id) => {
    if (!readIds.includes(id)) {
      setReadIds((prev) => [...prev, id]);
      log(null, "INFO", "frontend.page", `Notification ${id} marked read`);
    }
  };

  const handleMarkAllAsRead = () => {
    const unread = notifications.map((n) => n.ID).filter((id) => !readIds.includes(id));
    if (unread.length > 0) {
      setReadIds((prev) => [...prev, ...unread]);
      log(null, "INFO", "frontend.page", `Marked page as read`);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", px: 3, py: 4 }}>
      {/* Header Bar */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3} flexWrap="wrap" gap={2}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Badge badgeContent={unreadCount} color="error" max={99}>
            <NotificationsIcon sx={{ fontSize: 32, color: "#1e3c72" }} />
          </Badge>
          <Typography variant="h4" fontWeight={800} color="#1e3c72">
            Campus Notifications
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Button
            variant="outlined"
            size="small"
            startIcon={<MarkEmailReadIcon />}
            onClick={handleMarkAllAsRead}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Mark Page as Read
          </Button>
          <IconButton onClick={() => { loadPriority(); handlePageChange(null, page); }} color="primary">
            <RefreshIcon />
          </IconButton>
        </Stack>
      </Stack>

      <Divider sx={{ mb: 4 }} />

      <Grid container spacing={4}>
        {/* Left Column: Notifications Feed */}
        <Grid item xs={12} md={8}>
          <Paper elevation={1} sx={{ p: 3, borderRadius: 3, backgroundColor: "#ffffff" }}>
            <Box mb={3} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
              <NotificationFilter value={filter} onChange={handleFilterChange} />
              
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <InputLabel>Limit</InputLabel>
                <Select
                  value={limit}
                  label="Limit"
                  onChange={(e) => {
                    setLimit(e.target.value);
                    setPage(1);
                  }}
                >
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={20}>20</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {loading && (
              <Box display="flex" justifyContent="center" py={8}>
                <CircularProgress />
              </Box>
            )}

            {!loading && error && (
              <Alert severity="error" sx={{ mb: 2 }}>Failed to load notifications: {error}</Alert>
            )}

            {!loading && !error && notifications.length === 0 && (
              <Alert severity="info">No notifications found.</Alert>
            )}

            {!loading && !error && notifications.length > 0 && (
              <Stack spacing={2}>
                {notifications.map((n) => (
                  <NotificationCard
                    key={n.ID}
                    item={n}
                    isRead={readIds.includes(n.ID)}
                    onMarkAsRead={handleMarkAsRead}
                  />
                ))}
              </Stack>
            )}

            {!loading && totalPages > 1 && (
              <Box display="flex" justifyContent="center" mt={4}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  shape="rounded"
                />
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Right Column: Priority Inbox */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3, backgroundColor: "linear-gradient(to bottom, #ffffff, #fcfcfc)" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={800} color="#1e3c72" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PriorityHighIcon sx={{ color: "error.main" }} /> Priority Inbox
              </Typography>
              
              <FormControl size="small" sx={{ width: 85 }}>
                <Select
                  value={priorityLimit}
                  onChange={(e) => setPriorityLimit(e.target.value)}
                  variant="standard"
                  sx={{ fontSize: "0.875rem", fontWeight: 700 }}
                >
                  <MenuItem value={5}>Top 5</MenuItem>
                  <MenuItem value={10}>Top 10</MenuItem>
                  <MenuItem value={15}>Top 15</MenuItem>
                  <MenuItem value={20}>Top 20</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <Divider sx={{ mb: 2 }} />

            {priorityNotifications.length === 0 ? (
              <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                No priority items available.
              </Typography>
            ) : (
              <Stack spacing={1.5}>
                {priorityNotifications.map((item, index) => {
                  const isRead = readIds.includes(item.ID);
                  return (
                    <Box
                      key={item.ID}
                      onClick={() => handleMarkAsRead(item.ID)}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        cursor: "pointer",
                        backgroundColor: isRead ? "rgba(243, 244, 246, 0.5)" : "rgba(30, 60, 114, 0.03)",
                        borderLeft: `4px solid ${item.Type === "Placement" ? "#d32f2f" : item.Type === "Result" ? "#f57c00" : "#388e3c"}`,
                        transition: "all 0.15s ease",
                        "&:hover": {
                          transform: "translateX(3px)",
                          backgroundColor: isRead ? "rgba(243, 244, 246, 0.8)" : "rgba(30, 60, 114, 0.08)"
                        }
                      }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" fontWeight={800} color={item.Type === "Placement" ? "error.main" : item.Type === "Result" ? "warning.main" : "success.main"}>
                          #{index + 1} {item.Type}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.Timestamp.split(" ")[1]}
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight={isRead ? 400 : 700} sx={{ mt: 0.5, color: isRead ? "text.secondary" : "text.primary" }}>
                        {item.Message}
                      </Typography>
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

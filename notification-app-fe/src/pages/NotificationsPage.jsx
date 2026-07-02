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

import { NotificationCard } from "../components/NotificationCard";
import { NotificationFilter } from "../components/NotificationFilter";
import { useNotifications } from "../hooks/useNotifications";
import { log } from "../api/logger";

export function NotificationsPage() {
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { notifications, totalPages, loading, error } = useNotifications({
    page,
    limit,
    type: filter,
  });

  const [readIds, setReadIds] = useState(() => {
    const saved = localStorage.getItem("read_notifications");
    return saved ? JSON.parse(saved) : [];
  });

  const unreadCount = notifications.filter((n) => !readIds.includes(n.ID)).length;

  useEffect(() => {
    localStorage.setItem("read_notifications", JSON.stringify(readIds));
  }, [readIds]);

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
    <Box sx={{ maxWidth: 900, mx: "auto", px: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3} flexWrap="wrap" gap={2}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Badge badgeContent={unreadCount} color="error" max={99}>
            <NotificationsIcon sx={{ fontSize: 32, color: "#1e3c72" }} />
          </Badge>
          <Typography variant="h4" fontWeight={800} color="#1e3c72">
            Campus Feed
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
          <IconButton onClick={() => handlePageChange(null, page)} color="primary">
            <RefreshIcon />
          </IconButton>
        </Stack>
      </Stack>

      <Divider sx={{ mb: 4 }} />

      <Paper elevation={1} sx={{ p: 3, borderRadius: 3, backgroundColor: "#ffffff" }}>
        <Box mb={3} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <NotificationFilter value={filter} onChange={handleFilterChange} />
          
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel>Limit</InputLabel>
            <Select value={limit} label="Limit" onChange={(e) => { setLimit(e.target.value); setPage(1); }}>
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {loading && <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>}
        {!loading && error && <Alert severity="error" sx={{ mb: 2 }}>Failed to load notifications: {error}</Alert>}
        {!loading && !error && notifications.length === 0 && <Alert severity="info">No notifications found.</Alert>}
        
        {!loading && !error && notifications.length > 0 && (
          <Stack spacing={2}>
            {notifications.map((n) => (
              <NotificationCard key={n.ID} item={n} isRead={readIds.includes(n.ID)} onMarkAsRead={handleMarkAsRead} />
            ))}
          </Stack>
        )}

        {!loading && totalPages > 1 && (
          <Box display="flex" justifyContent="center" mt={4}>
            <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" shape="rounded" />
          </Box>
        )}
      </Paper>
    </Box>
  );
}

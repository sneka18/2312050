import React from "react";
import { Card, CardContent, Grid, Box, Typography, Chip, IconButton, Tooltip } from "@mui/material";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import FiberNewIcon from "@mui/icons-material/FiberNew";
import WorkIcon from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";
import EventIcon from "@mui/icons-material/Event";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";

export function NotificationCard({ item, isRead, onMarkAsRead }) {
  const getIconForType = (type) => {
    switch (type) {
      case "Placement":
        return <WorkIcon sx={{ color: "#d32f2f" }} />;
      case "Result":
        return <SchoolIcon sx={{ color: "#f57c00" }} />;
      case "Event":
        return <EventIcon sx={{ color: "#388e3c" }} />;
      default:
        return <NotificationsActiveIcon />;
    }
  };

  const getColorForType = (type) => {
    switch (type) {
      case "Placement":
        return "#ffebee";
      case "Result":
        return "#fff3e0";
      case "Event":
        return "#e8f5e9";
      default:
        return "#f5f5f5";
    }
  };

  return (
    <Card
      elevation={isRead ? 0 : 2}
      onClick={() => onMarkAsRead(item.ID)}
      sx={{
        cursor: "pointer",
        borderRadius: 2.5,
        borderLeft: isRead ? "5px solid #d1d5db" : `5px solid ${item.Type === "Placement" ? "#d32f2f" : item.Type === "Result" ? "#f57c00" : "#388e3c"}`,
        backgroundColor: isRead ? "rgba(249, 250, 251, 0.6)" : getColorForType(item.Type),
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: 4,
          backgroundColor: isRead ? "rgba(243, 244, 246, 0.8)" : getColorForType(item.Type),
        }
      }}
    >
      <CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item xs={1.5} sm={1} display="flex" justifyContent="center">
            {getIconForType(item.Type)}
          </Grid>
          <Grid item xs={8.5} sm={9}>
            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
              <Chip
                label={item.Type}
                size="small"
                color={item.Type === "Placement" ? "error" : item.Type === "Result" ? "warning" : "success"}
                sx={{ fontWeight: 700, fontSize: "0.75rem", height: 20 }}
              />
              {!isRead && (
                <Chip
                  label="New"
                  size="small"
                  color="info"
                  icon={<FiberNewIcon />}
                  sx={{ fontWeight: 700, fontSize: "0.75rem", height: 20 }}
                />
              )}
              <Typography variant="caption" color="text.secondary">
                {item.Timestamp}
              </Typography>
            </Box>
            <Typography variant="body1" fontWeight={isRead ? 400 : 700} sx={{ mt: 1, color: isRead ? "text.secondary" : "text.primary" }}>
              {item.Message}
            </Typography>
          </Grid>
          <Grid item xs={2} display="flex" justifyContent="flex-end">
            {!isRead && (
              <Tooltip title="Mark as Read">
                <IconButton
                  size="small"
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead(item.ID);
                  }}
                >
                  <MarkEmailReadIcon />
                </IconButton>
              </Tooltip>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

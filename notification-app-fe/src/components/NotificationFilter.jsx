import React from "react";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";

const filters = ["All", "Placement", "Result", "Event"];

export function NotificationFilter({ value, onChange }) {
  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      onChange={(event, newValue) => {
        if (newValue !== null) {
          onChange(newValue);
        }
      }}
      size="small"
      sx={{ flexWrap: "wrap", gap: 0.5 }}
    >
      {filters.map((type) => (
        <ToggleButton key={type} value={type} sx={{ textTransform: "none", px: 3, fontWeight: 600 }}>
          {type}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
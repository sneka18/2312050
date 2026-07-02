import React from "react";
import { ThemeProvider, createTheme, CssBaseline, Box, AppBar, Toolbar, Typography } from "@mui/material";
import HubIcon from "@mui/icons-material/Hub";
import { NotificationsPage } from "./pages/NotificationsPage";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1e3c72",
      light: "#2a5298",
      dark: "#122546",
    },
    background: {
      default: "#f4f6f9",
      paper: "#ffffff",
    },
    error: {
      main: "#d32f2f",
    },
    warning: {
      main: "#f57c00",
    },
    success: {
      main: "#388e3c",
    },
  },
  typography: {
    fontFamily: "'Outfit', 'Inter', sans-serif",
    h4: {
      fontWeight: 800,
    },
    h6: {
      fontWeight: 700,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 4px 20px 0 rgba(0,0,0,0.05)",
        },
      },
    },
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "background.default" }}>
        
        {/* App Bar / Navigation Header */}
        <AppBar position="sticky" sx={{ background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)", boxShadow: 3 }}>
          <Toolbar sx={{ justifyContent: "space-between", maxWidth: 1200, width: "100%", mx: "auto", px: 2 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <HubIcon sx={{ fontSize: 28, color: "#00d2ff" }} />
              <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: ".05rem", color: "#fff", textTransform: "uppercase" }}>
                AffordMed® <span style={{ fontWeight: 300, color: "#d1d5db" }}>Portal</span>
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: "#e5e7eb", display: { xs: "none", sm: "block" }, fontWeight: 600 }}>
              Pre-Authorized Access
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Dashboard Main Container */}
        <Box component="main" sx={{ flexGrow: 1 }}>
          <NotificationsPage />
        </Box>

        {/* Footer */}
        <Box component="footer" sx={{ py: 3, textAlign: "center", mt: "auto", borderTop: "1px solid rgba(0, 0, 0, 0.08)", bgcolor: "#ffffff" }}>
          <Typography variant="caption" color="text.secondary">
            © 2026 Afford Medical Technologies Private Limited. All Rights Reserved.
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
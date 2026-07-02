import React from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline, Box, AppBar, Toolbar, Typography, Button } from "@mui/material";
import HubIcon from "@mui/icons-material/Hub";
import { NotificationsPage } from "./pages/NotificationsPage";
import { PriorityPage } from "./pages/PriorityPage";

const theme = createTheme({
  palette: {
    primary: { main: "#1e3c72", light: "#2a5298", dark: "#122546" },
    background: { default: "#f4f6f9", paper: "#ffffff" },
    error: { main: "#d32f2f" },
    warning: { main: "#f57c00" },
    success: { main: "#388e3c" },
  },
  typography: {
    fontFamily: "'Outfit', 'Inter', sans-serif",
    h4: { fontWeight: 800 },
    h6: { fontWeight: 700 },
  },
  components: {
    MuiCard: { styleOverrides: { root: { boxShadow: "0 4px 20px 0 rgba(0,0,0,0.05)" } } },
    MuiButton: { styleOverrides: { root: { textTransform: "none", fontWeight: 600 } } }
  },
});

function Navigation() {
  const location = useLocation();
  
  return (
    <AppBar position="sticky" sx={{ background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)", boxShadow: 3 }}>
      <Toolbar sx={{ justifyContent: "space-between", maxWidth: 1200, width: "100%", mx: "auto", px: 2 }}>
        <Box display="flex" alignItems="center" gap={4}>
          <Box display="flex" alignItems="center" gap={1}>
            <HubIcon sx={{ fontSize: 28, color: "#00d2ff" }} />
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: ".05rem", color: "#fff", textTransform: "uppercase" }}>
              AffordMed®
            </Typography>
          </Box>
          
          <Box display="flex" gap={2}>
            <Button 
              component={Link} 
              to="/" 
              sx={{ 
                color: location.pathname === "/" ? "#00d2ff" : "#fff",
                borderBottom: location.pathname === "/" ? "2px solid #00d2ff" : "2px solid transparent",
                borderRadius: 0
              }}
            >
              All Notifications
            </Button>
            <Button 
              component={Link} 
              to="/priority" 
              sx={{ 
                color: location.pathname === "/priority" ? "#00d2ff" : "#fff",
                borderBottom: location.pathname === "/priority" ? "2px solid #00d2ff" : "2px solid transparent",
                borderRadius: 0
              }}
            >
              Priority Inbox
            </Button>
          </Box>
        </Box>
        <Typography variant="body2" sx={{ color: "#e5e7eb", display: { xs: "none", sm: "block" }, fontWeight: 600 }}>
          Pre-Authorized Access
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "background.default" }}>
          
          <Navigation />

          <Box component="main" sx={{ flexGrow: 1, py: 4 }}>
            <Routes>
              <Route path="/" element={<NotificationsPage />} />
              <Route path="/priority" element={<PriorityPage />} />
            </Routes>
          </Box>

          <Box component="footer" sx={{ py: 3, textAlign: "center", mt: "auto", borderTop: "1px solid rgba(0, 0, 0, 0.08)", bgcolor: "#ffffff" }}>
            <Typography variant="caption" color="text.secondary">
              © 2026 Afford Medical Technologies Private Limited. All Rights Reserved.
            </Typography>
          </Box>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}
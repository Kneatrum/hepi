import styles from "../../styles/page.module.css";
import { Box } from "@mui/material";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Sidebar from "./Sidebar";

export default function AdminDashboard({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <Box className={styles.dashboard}>
      <Navbar />
        <Box sx={{ display: "flex", gap: 2, overflow: "hidden" }}>
          {/* Sidebar */}
          <Box
            sx={{
              bgcolor: "transparent",
              color: "white",
              borderRadius: 2,
              minHeight: "100%",
            }}
          >
            <Sidebar />
          </Box>

          
          <Box sx={{ flexGrow: 1, overflowY: "auto", height: "100vh" }} >
            {children}
          </Box>
        </Box>
      <Footer />
    </Box>
  );
}

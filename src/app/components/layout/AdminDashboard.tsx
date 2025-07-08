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
          <Sidebar />
          <Box sx={{ 
            flexGrow: 1, 
            overflowY: "auto", 
            height: "calc(100vh - 160px)",
            overflowX: "hidden",
          }} >
            {children}
          </Box>
        </Box>
      <Footer />
    </Box>
  );
}

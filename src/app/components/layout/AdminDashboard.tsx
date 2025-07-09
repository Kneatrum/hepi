import styles from "../../styles/page.module.css";
import { Box } from "@mui/material";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Sidebar from "./Sidebar";
import { usePathname } from "next/navigation";

export default function AdminDashboard({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const isOnSongsPage = pathname.startsWith("/admin/songs");

  return (
    <Box className={styles.dashboard}>
      <Navbar />
        <Box sx={{ display: "flex", gap: 2, overflow: "hidden" }}>
          <Sidebar />
          <Box sx={{ 
            flexGrow: 1, 
            overflowY: "auto", 
            height: isOnSongsPage ? "calc(100dvh - 10rem)" : "calc(100dvh - 5.625rem)",
            overflowX: "hidden",
          }} >
            {children}
          </Box>
        </Box>
      <Footer />
    </Box>
  );
}

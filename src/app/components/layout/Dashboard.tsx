"use client"
import styles from "../../styles/page.module.css"
import { Box } from '@mui/material';
import Navbar from './Navbar';
import Footer from './Footer';
import UserSidebar from "./UserSidebar";
import { usePathname } from "next/navigation";


export default function Dashboard({children}: Readonly<{children: React.ReactNode}>) {
  const pathname = usePathname();
  const isOnSongsPage = pathname === "/";
  const isOnFavsPage = pathname.startsWith("/user/favourites");
  
  return (
    <Box className={styles.dashboard}>
      <Navbar />
      <Box sx={{ display: "flex", gap: 2, overflow: "hidden" }}>
        <UserSidebar />
        <Box sx={{ 
          flexGrow: 1, 
          overflowY: "auto",
          height: isOnSongsPage || isOnFavsPage
          ? "calc(100dvh - 10rem)" : "calc(100dvh - 5.625rem)",
          overflowX: "hidden",
        }} >
          {children}
        </Box>
      </Box>
      <Footer />
    </Box>
  );
}

/*
  <Container maxWidth="xl" sx={{ backgroundColor: "gray"}}>
    <Card sx={{ backgroundColor: "black" }} > 
      <CardContent> 
        {children}
      </CardContent> 
    </Card> 
  </Container> 
*/

/*
  <Navbar />
  <Box sx={{ display: "flex" }}>
    <Sidebar />
    <Box>
      {children}
    </Box>
  </Box>
  <Footer />
*/
import styles from "../../styles/page.module.css"
import { Box } from '@mui/material';
import Navbar from './Navbar';
import Footer from './Footer';
import UserSidebar from "./UserSidebar";


export default function Dashboard({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <Box className={styles.dashboard}>
      <Navbar />
      <Box sx={{ display: "flex", overflow: "hidden" }}>
        <UserSidebar />
        <Box sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: "86%",
          overflowY: "auto",
          height: "calc(100vh)"
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
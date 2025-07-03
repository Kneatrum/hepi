import styles from "../../styles/page.module.css"
import { Box,Container } from '@mui/material';
import Navbar from './Navbar';
import Footer from './Footer';


export default function AuthDashboard({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <Box className={styles.dashboard}>
        <Navbar />
        <Container maxWidth="xl">
          {children}
        </Container>
        <Footer />
    </Box>
  );
}

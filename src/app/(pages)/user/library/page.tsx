import Dashboard from "@/app/components/layout/Dashboard";
import styles from "../../../styles/page.module.css";
import { Box, Typography } from "@mui/material";

export default function Page() {
  return (
   <Dashboard>
      <Box className={styles.authBox}> 
        <Typography sx={{color:"#fff"}}>Library</Typography>
      </Box>
   </Dashboard>
  );
}
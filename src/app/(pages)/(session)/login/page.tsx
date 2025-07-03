import AuthDashboard from "@/app/components/layout/AuthDashboard";
import styles from "../../../styles/page.module.css";
import { Box } from "@mui/material";
import LoginForm from "@/app/components/common/forms/Login";

export default function page() {
  return (
   <AuthDashboard>
        <Box className={styles.authBox}>
            <LoginForm />
        </Box>
   </AuthDashboard>
  );
}

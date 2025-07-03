import styles from "../../../styles/page.module.css";
import { Box } from "@mui/material";
import SignupForm from "@/app/components/common/forms/Signup";
import AuthDashboard from "@/app/components/layout/AuthDashboard";

export default function page() {
  return (
   <AuthDashboard>
        <Box className={styles.authBox}>
            <SignupForm />
        </Box>
   </AuthDashboard>
  );
}

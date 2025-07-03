"use client"
import { useRouter } from "next/navigation";

import AdminDashboard from "@/app/components/layout/AdminDashboard";
import { Box, Button, Typography } from "@mui/material";
import styles from "../../../../styles/page.module.css";
import PermissionForm from "@/app/components/common/forms/PermissionForms";

export default function Page() {
  const router = useRouter();

  const handleCreateRoleClick = () => {
    router.push("/admin/permissions");
  };

  return (
    <AdminDashboard>
        <Box sx={{display:"flex", flexDirection:"column", gap:"10px"}}>
          <Box sx={{display:"flex", gap:"10px", justifyContent:"space-between", width:"100%"}}>
            <Typography className={styles.layerTopIntroTextInfo}>
                Create a permission
            </Typography>
            <Button className="callToActionButton" onClick={handleCreateRoleClick}>View permssions</Button>
            </Box>
          <PermissionForm />
        </Box>
    </AdminDashboard>
  );
}

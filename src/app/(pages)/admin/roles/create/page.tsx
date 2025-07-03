"use client"
import { useRouter } from "next/navigation";

import AdminDashboard from "@/app/components/layout/AdminDashboard";
import { Box, Button, Typography } from "@mui/material";
import styles from "../../../../styles/page.module.css";
import RoleForm from "@/app/components/common/forms/RoleForms";

export default function Page() {
  const router = useRouter();

  const handleViewRolesClick = () => {
    router.push("/admin/roles");
  };

  return (
    <AdminDashboard>
        <Box sx={{display:"flex", flexDirection:"column", gap:"10px"}}>
          <Box sx={{display:"flex", gap:"10px", justifyContent:"space-between", width:"100%"}}>
            <Typography className={styles.layerTopIntroTextInfo}>
                Create a role
            </Typography>
            <Button className="callToActionButton" onClick={handleViewRolesClick}>View Roles</Button>
            </Box>
          <RoleForm />
        </Box>
    </AdminDashboard>
  );
}

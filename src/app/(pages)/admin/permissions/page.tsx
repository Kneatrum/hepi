"use client";

import { useRouter } from "next/navigation";
import AdminDashboard from "@/app/components/layout/AdminDashboard";
import { Box, Button, Typography, Paper } from "@mui/material";
import styles from "../../../styles/page.module.css";

export default function Page() {
  const router = useRouter();

  const handleCreatePermissionClick = () => {
    router.push("/admin/permissions/create");
  };

  const handleViewRolesClick = () => {
    router.push("/admin/roles");
  };


  // Sample permissions
  const permissions = [
    { id: 1, name: "CREATE_USER", description: "Allows creation of new users" },
    { id: 2, name: "EDIT_ROLE", description: "Allows editing existing roles" },
    { id: 3, name: "VIEW_REPORTS", description: "Grants access to view system reports" },
  ];

  return (
    <AdminDashboard>
      <Box sx={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <Box sx={{ display: "flex", gap: "10px", justifyContent: "space-between", width: "100%" }}>
          <Typography className={styles.layerTopIntroTextInfo}>
            Permission Management
          </Typography>
          <Box sx={{ display: "flex", gap: "5px" }}>
            <Button className="callToActionButton" onClick={handleViewRolesClick}>
              View Roles
            </Button>
            <Button className="callToActionButton" onClick={handleCreatePermissionClick}>
              Create Permission
            </Button>
          </Box>
        </Box>

        <Box>
          <Typography variant="h6" gutterBottom>Available Permissions</Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {permissions.map((perm) => (
              <Paper key={perm.id} sx={{ padding: 2, backgroundColor: "#1e1e1e", color: "#ffffff" }}>
                <Typography variant="subtitle1">{perm.name}</Typography>
                <Typography variant="body2" color="gray">{perm.description}</Typography>
              </Paper>
            ))}
          </Box>
        </Box>
      </Box>
    </AdminDashboard>
  );
}

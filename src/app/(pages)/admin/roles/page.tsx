"use client";

import { useRouter } from "next/navigation";
import AdminDashboard from "@/app/components/layout/AdminDashboard";
import { Box, Button, Typography, Paper } from "@mui/material";
import styles from "../../../styles/page.module.css";

export default function Page() {
  const router = useRouter();

  const handleCreateRoleClick = () => {
    router.push("/admin/roles/create");
  };

  const handleCreatePermissionClick = () => {
    router.push("/admin/permissions/create");
  };

  // Sample roles
  const roles = [
    { id: 1, name: "Admin", description: "Full access to the system" },
    { id: 2, name: "Editor", description: "Can edit content but not manage users" },
    { id: 3, name: "Viewer", description: "Read-only access" },
  ];

  return (
    <AdminDashboard>
      <Box sx={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <Box sx={{ display: "flex", gap: "10px", justifyContent: "space-between", width: "100%" }}>
          <Typography className={styles.layerTopIntroTextInfo}>
            Role and Permission Management
          </Typography>
          <Box sx={{ display: "flex", gap: "5px" }}>
            <Button className="callToActionButton" onClick={handleCreateRoleClick}>
              Create Role
            </Button>
            <Button className="callToActionButton" onClick={handleCreatePermissionClick}>
              Create Permission
            </Button>
          </Box>
        </Box>

        <Box>
          <Typography variant="h6" gutterBottom>Available Roles</Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {roles.map((role) => (
              <Paper key={role.id} sx={{ padding: 2, backgroundColor: "#1e1e1e", color: "#ffffff" }}>
                <Typography variant="subtitle1">{role.name}</Typography>
                <Typography variant="body2" color="gray">{role.description}</Typography>
              </Paper>
            ))}
          </Box>
        </Box>
      </Box>
    </AdminDashboard>
  );
}

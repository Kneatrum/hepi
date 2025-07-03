"use client"

import AdminDashboard from "@/app/components/layout/AdminDashboard";
import { Typography } from "@mui/material";
import styles from "../../../styles/page.module.css";

export default function Page() {

  return (
    <AdminDashboard>
        <Typography className={styles.layerTopIntroTextInfo}>
            Favorite Management
        </Typography>
    </AdminDashboard>
  );
}

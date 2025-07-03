"use client";
import { useState, useEffect } from "react";
import Dashboard from "./components/layout/Dashboard";
import styles from "./styles/page.module.css";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import Link from "next/link";

export default function Page() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const delay = Math.floor(Math.random() * 1001); // Random delay between 0-1000 ms
    const timer = setTimeout(() => {
      setLoading(false);
    }, delay);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Dashboard>
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "70vh", flexDirection: "column" }}>
        {loading ? (
          <CircularProgress className="spinner" size={50} />
        ) : (
          <>
            <Typography className={styles.pageNotFoundFontH1} gutterBottom>
              Page Not Found
            </Typography>
            <Typography className={styles.pageNotFoundFontH2} variant="body1" color="textSecondary" sx={{ mb: 2 }}>
              Sorry, the page you are looking for does not exist.
            </Typography>
            <Link href="/" passHref>
              <Button className="callToActionButton" variant="contained" color="primary">
                Go Back Home
              </Button>
            </Link>
          </>
        )}
      </Box>
    </Dashboard>
  );
}

"use client";
import { CircularProgress, Box } from "@mui/material";

interface SpinnerProps {
  size?: number;
}

export default function Spinner({ size = 50}: SpinnerProps) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "30vh",
      }}
    >
      <CircularProgress size={size} className="spinner"/>
    </Box>
  );
}

import { Button, Typography } from "@mui/material";
import { ReactNode } from "react";  // Add ReactNode for the endIcon prop
import styles from "../../../styles/page.module.css";

interface CustomButtonProps {
  label?: string;
  onClick?: () => void;
  disabled?: boolean;
  endIcon?: ReactNode; // Add endIcon prop to interface
}

export default function SubmitButton({ label, onClick, disabled, endIcon }: CustomButtonProps) {
  return (
    <Button onClick={onClick} disabled={disabled} className={styles.customButton} endIcon={endIcon}>
      <Typography className={`${styles.buttonFont} ${styles.buttonDark}`}>
        {label}
      </Typography>
    </Button>
  );
}

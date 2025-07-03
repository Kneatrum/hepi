import { ChangeEvent } from "react";
import styles from "../../../styles/page.module.css";
import { Box, TextField } from "@mui/material";

interface CustomFieldProps {
  label?: string;
  type: string;
  placeholder?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export default function CustomField({ label, type, placeholder, value, onChange }: CustomFieldProps) {
  return (
    <Box className={styles.customFieldBox}>
      <TextField
        placeholder={placeholder}
        type={type}
        label={label}
        value={value}
        onChange={onChange}
        variant="outlined"
        className={styles.customTextField}
        InputLabelProps={{
          sx: {
            color: "var(--placeholder) !important",
            fontFamily: "var(--font-outfit) !important",
            "&.Mui-focused": {
              color: "#FFFFFF !important",
            },
          },
        }}
        InputProps={{
          sx: {
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px !important",
              "& fieldset": {
                borderRadius: "12px !important",
                borderColor: "#2E2E2E !important",
              },
              "&:hover fieldset": {
                borderColor: "#00BFFF",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#FFFFFF",
                borderWidth: "2px",
              },
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderRadius: "12px !important",
              borderColor: "#2E2E2E !important",
            },
            "& input": {
              color: "#FFFFFF",
            },
            "&::placeholder": {
              color: "var(--placeholder) !important",
              fontFamily: "var(--font-outfit) !important",
              opacity: 1,
            },
          },
        }}
        sx={{
          "& label.Mui-focused": {
            color: "#FFFFFF",
            backgroundColor: "#121212",
            padding: "0 4px",
          },
          "& .MuiOutlinedInput-root.Mui-focused": {
            borderColor: "#FFFFFF",
            boxShadow: "none",
          },
          "& .MuiOutlinedInput-root": {
            borderRadius: "12px !important",
            "&:focus-within": {
              borderColor: "#FFFFFF",
              boxShadow: "none",
            },
          },
          "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#FFFFFF !important",
            borderWidth: "2px",
          },
          "& input:focus": {
            outline: "none !important",
            borderColor: "#FFFFFF !important",
            boxShadow: "none !important",
          },
        }}
      />
    </Box>
  );
}

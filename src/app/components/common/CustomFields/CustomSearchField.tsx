import styles from "../../../styles/page.module.css";
import { Box, TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

interface SearchFieldProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function CustomSearchField({ label, placeholder, value, onChange }: SearchFieldProps) {
  return (
    <Box className={styles.customFieldBox}>
      <TextField
        placeholder={placeholder || "Search..."}
        type="text"
        label={label}
        variant="outlined"
        className={styles.customTextField}
        value={value}
        onChange={onChange}
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
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: "#D39A0B" }} />
            </InputAdornment>
          ),
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
            "& input": {
              color: "#FFFFFF !important",
              paddingLeft: "10px",
              "&::placeholder": {
                color: "blue",
                opacity: 1, // ensures color applies in most browsers
              },
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderRadius: "12px !important",
              borderColor: "#2E2E2E !important",
            },
          },
        }}
      />
    </Box>
  );
}

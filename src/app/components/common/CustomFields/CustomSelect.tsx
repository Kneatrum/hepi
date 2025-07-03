import styles from "../../../styles/page.module.css";
import { Box, InputLabel, MenuItem, Select, FormControl, SelectChangeEvent } from "@mui/material";

interface CustomSelectProps {
  label?: string;
  value: string;
  onChange: (event: SelectChangeEvent<string>) => void;  // Expect SelectChangeEvent
  options: { value: string; label: string }[];
}

export default function CustomSelect({ label, value, onChange, options }: CustomSelectProps) {
  return (
    <Box className={styles.customFieldBox}>
      <FormControl variant="outlined" fullWidth>
        {label && <InputLabel>{label}</InputLabel>}
        <Select
          value={value}
          onChange={onChange}
          label={label}
          variant="outlined"
          className={styles.customTextField}
          MenuProps={{
            PaperProps: {
              sx: {
                backgroundColor: "#121212",
                color: "#FFFFFF",
                borderRadius: "12px",
              },
            },
          }}
          sx={{
            "& .MuiSelect-outlined": {
              borderRadius: "12px !important",
              borderColor: "#2E2E2E !important",
              color: "#FFFFFF",
            },
            "& .MuiSelect-icon": {
              color: "#FFFFFF",
            },
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px !important",
              "&:focus-within": {
                borderColor: "#FFFFFF",
                boxShadow: "none",
              },
            },
            "& .MuiOutlinedInput-root.Mui-focused": {
              borderColor: "#FFFFFF",
              boxShadow: "none",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#2E2E2E !important",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#00BFFF",
            },
          }}
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}

import { Box, TextField, Autocomplete } from "@mui/material";
import styles from "../../../styles/page.module.css";

interface CustomAutocompleteProps<T> {
  label?: string;
  placeholder?: string;
  options: T[];
  value: T | null;
  onChange: (event: any, newValue: T | string | null) => void;
  getOptionLabel: (option: T | string) => string;
  freeSolo?: boolean;
}

export default function CustomAutocomplete<T>({
  label,
  placeholder,
  options,
  value,
  onChange,
  getOptionLabel,
  freeSolo = false,
}: CustomAutocompleteProps<T>) {
  return (
    <Box className={styles.customFieldBox}>
      <Autocomplete
        options={options}
        value={value}
        onChange={onChange}
        getOptionLabel={getOptionLabel}
        freeSolo={freeSolo}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={placeholder}
            label={label}
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
              ...params.InputProps,
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
        )}
        sx={{
          "& .MuiAutocomplete-popupIndicator": {
            color: "var(--placeholder)",
            "&:hover": {
              color: "#FFFFFF",
            },
          },
          "& .MuiAutocomplete-clearIndicator": {
            color: "var(--placeholder)",
            "&:hover": {
              color: "#FFFFFF",
            },
          },
          "& .MuiAutocomplete-endAdornment": {
            right: "12px !important",
          },
        }}
      />
    </Box>
  );
}
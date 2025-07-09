"use client";
import { TextField, InputAdornment, TextFieldProps } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

type CustomSearchFieldProps = Omit<TextFieldProps, "variant" | "size">;

export default function CustomSearchField(props: CustomSearchFieldProps) {
  return (
    <TextField
      {...props}
      variant="outlined"
      size="small" // Use "small" size for a more compact height
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: "50px", // Increase for more rounded corners (pill shape)
          backgroundColor: "#1a1a1a",
          transition: "background-color 0.2s, border-color 0.2s",
          "& fieldset": {
            borderColor: "#333",
          },
          "&:hover fieldset": {
            borderColor: "#FFEB3B",
          },
          "&.Mui-focused fieldset": {
            borderColor: "#FFEB3B",
            borderWidth: "1px",
          },
        },
        "& .MuiOutlinedInput-input::placeholder": {
          color: "#888",
          opacity: 1,
        },
        ...props.sx,
      }}
      InputProps={{
        ...props.InputProps,
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon sx={{ color: "gray" }} />
          </InputAdornment>
        ),
      }}
    />
  );
}
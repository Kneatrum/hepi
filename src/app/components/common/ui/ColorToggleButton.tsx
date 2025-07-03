import React, { useState, useEffect } from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { ThemeProvider } from '@mui/material/styles';
import theme from '@/app/theme';
import { useRouter, usePathname } from "next/navigation";

export default function ColorToggleButton() {
  const [alignment, setAlignment] = useState('admin');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Synchronize alignment with the current path
    if (pathname.startsWith('/admin')) {
      setAlignment('admin');
    } else if (pathname === '/') {
      setAlignment('user');
    }
    // Add more conditions if other paths should affect the toggle state,
    // for instance, if neither admin nor user is active.
  }, [pathname]);


  const handleChange = (
    event: React.MouseEvent<HTMLElement>,
    newAlignment: string,
  ) => {
    if (newAlignment !== null) {
      console.log("Alignment: ", newAlignment);
      setAlignment(newAlignment);
      
      if (newAlignment === "admin") {
        router.push("/admin/artists");
      } else if (newAlignment === "user") {
        router.push("/"); 
      }
    }
  };

  // Styles for the ToggleButtons
  const buttonStyles = {
    borderColor: theme.palette.secondary.main,
    borderRadius: '20px',
    height: '40px',
    // Default (unselected) state
    color: theme.palette.secondary.main,
    backgroundColor: 'transparent',
    '&:hover': {
      // Hover for unselected state
      backgroundColor: 'rgba(255, 235, 59, 0.08)', // Example hover color for unselected
    },
    // Selected state
    '&.Mui-selected': {
      color: theme.palette.primary.main, // Retain text color for selected
      backgroundColor: theme.palette.secondary.main, // Desired background for selected
      '&:hover': {
        backgroundColor: theme.palette.secondary.light, // Hover for selected state
      },
    },
  };

  return (
    <ThemeProvider theme={theme}>
      <ToggleButtonGroup
        color="primary"
        value={alignment}
        exclusive
        onChange={handleChange}
        aria-label="Platform"
        sx={{ paddingRight: '20px' }}
      >
        <ToggleButton value="admin" sx={buttonStyles}>
          Admin
        </ToggleButton>
        <ToggleButton value="user" sx={buttonStyles}>
          Home
        </ToggleButton>
      </ToggleButtonGroup>
    </ThemeProvider>
  );
}

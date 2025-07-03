import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import CustomAutocomplete from "../CustomFields/CustomAutocomplete";
import { Country } from "@/app/types";
import { useSession } from "@/app/context/SessionContext";


interface CountryFormData {
  countryId: number; // Assuming this is the ID for the country
  name: string;
  code: string;
  region: string;
}

interface CountryEditDialogProps {
  open: boolean;
  onClose: () => void;
  countries: Country[] | null;
  country: Country | null;
  setCountries: (countries: Country[]) => void;
  onSuccess?: () => void;
}

// Theme
const darkYellowTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#000000',
    },
    secondary: {
      main: '#FFEB3B',
    },
    background: {
      default: '#000000',
      paper: '#1a1a1a',
    },
    text: {
      primary: '#ffffff',
      secondary: '#FFEB3B',
    },
  },
  components: {
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8)',
          minWidth: '600px',
          maxWidth: '800px',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          backgroundColor: '#000000',
          color: '#FFEB3B',
          borderBottom: '2px solid #FFEB3B',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
      },
    },

    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#2a2a2a',
            borderRadius: '8px',
            '& fieldset': {
              borderColor: '#444',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#FFEB3B',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#FFEB3B',
            '&.Mui-focused': {
              color: '#FFEB3B',
            },
          },
          '& .MuiOutlinedInput-input': {
            color: '#ffffff',
          },
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          backgroundColor: '#2a2a2a',
          border: '1px solid #444',
        },
        option: {
          color: '#ffffff',
          '&:hover': {
            backgroundColor: 'rgba(255, 235, 59, 0.1)',
          },
          '&.Mui-focused': {
            backgroundColor: 'rgba(255, 235, 59, 0.2)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          backgroundColor: '#FFEB3B',
          color: '#000000',
          fontWeight: 600,
          '&:hover': {
            backgroundColor: '#FDD835',
          },
        },
        outlined: {
          borderColor: '#FFEB3B',
          color: '#FFEB3B',
          '&:hover': {
            borderColor: '#FDD835',
            backgroundColor: 'rgba(255, 235, 59, 0.1)',
          },
        },
      },
    },
  },
});

const CountryEditDialog: React.FC<CountryEditDialogProps> = ({
  open,
  onClose,
  countries,
  country,
  setCountries,
  onSuccess,
}) => {
//   const [tribes, setExistingTribes] = useState<Artist[]>([]);
//   const [existingGenres, setExistingGenres] = useState<Genre[]>([]);
//   const [tribe, setSelectedTribe] = useState<Artist | null>(null);

  const [loading, setLoading] = useState(false);
  // Initialize formData with empty values, it will be populated by useEffect
  const [formData, setFormData] = useState<CountryFormData>({
    countryId: country?.countryId || 0, 
    name: '', 
    code: '',
    region: '',
  });
  
  const { accessToken } = useSession();

  // Effect to pre-populate form data when dialog opens or song prop changes
  useEffect(() => {
    if (open && country) {

      setFormData({
        countryId: country.countryId,
        name: country?.name || '',
        code: country?.code || '',
        region: country?.region || '',
      });
    }
  }, [open, country]);



  // Handle form input changes
  const handleInputChange = (field: keyof CountryFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };



  // Handle form submission
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch( // Use formData.id for the PUT request
        `https://music-backend-production-99a.up.railway.app/api/v1/tribes/${formData.countryId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        console.log('Song updated successfully');
        onSuccess?.();
        onClose();
      } else {
        console.error('Failed to update song');
      }
    } catch (error) {
      console.error('Error updating song:', error);
    } finally {
      setLoading(false);
    }
  };

  const TabPanel = ({ children, value, index }: { children: React.ReactNode; value: number; index: number }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <ThemeProvider theme={darkYellowTheme}>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            width: '700px',
            maxWidth: '90vw',
          },
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon />
            <Typography variant="h6" component="span">
              Country Details
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            sx={{
              color: '#FFEB3B',
              '&:hover': {
                backgroundColor: 'rgba(255, 235, 59, 0.1)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            <Box>
              <Typography variant="body2" sx={{ color: '#FFEB3B', mb: 1, mt: 3 }}>
                Name:
              </Typography>
              <TextField
                fullWidth
                placeholder="Edit country name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </Box>

            <Box>
              <Typography variant="body2" sx={{ color: '#FFEB3B', mb: 1 }}>
                Region:
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Edit region"
                value={formData.region}
                onChange={(e) => handleInputChange('region', e.target.value)}
              />
            </Box>

            <Box>
              <Typography variant="body2" sx={{ color: '#FFEB3B', mb: 1 }}>
                Country Code:
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Edit country code"
                value={formData.code}
                onChange={(e) => handleInputChange('code', e.target.value)}
              />
            </Box>
            
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, borderTop: '1px solid #333' }}>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{ minWidth: 100 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            sx={{ minWidth: 100 }}
          >
            {loading ? 'Updating...' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default CountryEditDialog;
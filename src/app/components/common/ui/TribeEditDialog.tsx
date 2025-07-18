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
// import CustomAutocomplete from "../CustomFields/CustomAutocomplete";
import { Tribe } from "@/app/types";
import { useSession } from "@/app/context/SessionContext";


interface TribeFormData {
  id: number;
  name: string;
  description: string;
}

interface TribeEditDialogProps {
    open: boolean;
    onClose: () => void;
    tribe: Tribe | null;
    tribes: Tribe[];
    setTribes: (tribes: Tribe[]) => void;
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

const TribeEditDialog: React.FC<TribeEditDialogProps> = ({
  open,
  onClose,
  tribe,
  // tribes,
  // setTribes,
  onSuccess,
}) => {
//   const [tribes, setExistingTribes] = useState<Artist[]>([]);
//   const [existingGenres, setExistingGenres] = useState<Genre[]>([]);
//   const [tribe, setSelectedTribe] = useState<Artist | null>(null);
  // const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [loading, setLoading] = useState(false);
  // Initialize formData with empty values, it will be populated by useEffect
  const [formData, setFormData] = useState<TribeFormData>({
    id: tribe?.tribeId || 0, 
    name: '',
    description: '',
  });
    const { accessToken } = useSession();


  // Effect to pre-populate form data when dialog opens or song prop changes
  useEffect(() => {
    if (open && tribe) {
      setFormData({
        id: tribe?.tribeId || 0,
        name: tribe?.name || '',
        description: tribe?.description || '',
      });
    }
  }, [open, tribe]);

//   // Fetch artists
//   useEffect(() => {
//     async function fetchArtists() {
//       try {
//         const res = await fetch(
//           "https://music-backend-production-99a.up.railway.app/api/v1/artists"
//         );
//         const data = await res.json();

//         if (data?.content) {
//           setExistingTribes(data.content);
//           console.log("artists>>>", data.content);
//         } else {
//           setExistingTribes([]);
//         }
//       } catch (error) {
//         console.error("Failed to fetch artists:", error);
//       }
//     }

//     fetchArtists();
//   }, []);

  // Fetch genres
//   useEffect(() => {
//     async function fetchGenres() {
//       try {
//         const res = await fetch(
//           "https://music-backend-production-99a.up.railway.app/api/v1/genres"
//         );
//         const data = await res.json();
//         if (data) {
//           setExistingGenres(data);
//           console.log("genres>>>", data);
//         }
//       } catch (error) {
//         console.error("Failed to fetch genres:", error);
//       }
//     }

//     fetchGenres();
//   }, []);

  // Effect to set selected Artist/Genre objects for Autocomplete when existing data loads
//   useEffect(() => {
//     if (open && tribe && tribes.length > 0) {
//       const artist = tribes.find(a => a.name === tribe.name);
//       setSelectedTribe(artist || null);
//     }
    
//   }, [open, tribe, tribes, existingGenres]);

  // Handle form input changes
  const handleInputChange = (field: keyof TribeFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle artist selection
//   const handleArtistChange = (event: any, newValue: Artist | string | null) => {
//     if (typeof newValue === 'string') {
//       // User typed a custom value - you might want to handle this differently
//       setSelectedTribe(null);
//       setFormData({ ...formData, artistId: 0 });
//     } else if (newValue) {
//       // User selected an existing artist
//       setSelectedTribe(newValue);
//       setFormData({ ...formData, artistId: newValue.artistId });
//     } else {
//       // User cleared the selection
//       setSelectedTribe(null);
//       setFormData({ ...formData, artistId: 0 });
//     }
//   };

//  // Handle genre selection
//   const handleGenreChange = (event: any, newValue: Genre | string | null) => {
//     if (typeof newValue === 'string') {
//       // User typed a custom value - you might want to handle this differently
//       setSelectedGenre(null);
//       setFormData({ ...formData, genreId: 0 });
//     } else if (newValue) {
//       // User selected an existing genre
//       setSelectedGenre(newValue);
//       setFormData({ ...formData, genreId: newValue.genreId });
//     } else {
//       // User cleared the selection
//       setSelectedGenre(null);
//       setFormData({ ...formData, genreId: 0 });
//     }
//   };

  // Handle form submission
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch( // Use formData.id for the PUT request
        `https://music-backend-production-99a.up.railway.app/api/v1/tribes/${formData.id}`,
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

  // const TabPanel = ({ children, value, index }: { children: React.ReactNode; value: number; index: number }) => (
  //   <div hidden={value !== index}>
  //     {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  //   </div>
  // );

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
              Tribe Details
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
            {/* <Box>
              <Typography variant="body2" sx={{ color: '#FFEB3B', mb: 1 }}>
                ID:
              </Typography>
              <TextField
                fullWidth
                // placeholder="Enter song title"
                disabled
                value={formData.id}
                onChange={(e) => handleInputChange('id', e.target.value)}
              />
            </Box> */}

            <Box>
              <Typography variant="body2" sx={{ color: '#FFEB3B', mb: 1, mt: 3 }}>
                Name:
              </Typography>
              <TextField
                fullWidth
                placeholder="Edit tribe name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </Box>

            <Box>
              <Typography variant="body2" sx={{ color: '#FFEB3B', mb: 1 }}>
                Description:
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Edit tribe description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
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

export default TribeEditDialog;
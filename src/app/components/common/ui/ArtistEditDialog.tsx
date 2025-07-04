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
import { Artist } from "@/app/types";
import { useSession } from "@/app/context/SessionContext";
// import { Country, Tribe } from "@/app/types";



interface ArtistFormData {
  id: number; 
  name: string;
  biography: string;
  thumbnailUrl: string;
  countryId: number; 
  tribeId: number; 
}



// Define the overall response structure
// interface CountryApiResponse {
//   content: Country[];
//   totalPages: number;
//   totalElements: number;
//   last: boolean;
//   size: number;
//   number: number;
//   sort: string;
//   numberOfElements: number;
//   first: boolean;
//   empty: boolean;
//   pageable: string;
// }

// Define the type for the simplified output
// interface SimplifiedCountry {
//   countryId: number;
//   name: string;
//   code: string;
//   region: string;
// }

interface ArtistEditDialogProps {
  open: boolean;
  onClose: () => void;
  artists: Artist[] | null;
  artist: Artist | null;
  setArtists: (artists: Artist[]) => void;
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


interface ArtistFormData {
  id: number;
  name: string;
  biography: string;
  thumbnailUrl: string;
  countryId: number;
  tribeId: number;
}

const CountryEditDialog: React.FC<ArtistEditDialogProps> = ({
  open,
  onClose,
  // artists,
  artist,
  // setArtists,
  onSuccess,
}) => {
//   const [tribes, setExistingTribes] = useState<Artist[]>([]);
//   const [existingGenres, setExistingGenres] = useState<Genre[]>([]);
//   const [tribe, setSelectedTribe] = useState<Artist | null>(null);

  const [loading, setLoading] = useState(false);
  // Initialize formData with empty values, it will be populated by useEffect
  const [artistformData, setArtistFormData] = useState<ArtistFormData>({
    id:  0, 
    name: '', 
    biography: '', 
    thumbnailUrl: '', 
    countryId: 0, 
    tribeId: 0,
  });

 
  
  // const [existingCountries, setExistingCountries] = useState<SimplifiedCountry[]>([]);
  // const [existingTribes, setExistingTribes] = useState<Tribe[]>([]);
  // const [selectedCountry, setSelectedCountry] = useState<SimplifiedCountry | null>(null);
  // const [selectedTribe, setSelectedTribe] = useState<Tribe | null>(null);
  const { accessToken } = useSession();
  // const [ editMode , setEditMode ] = useState<boolean>(false);



      useEffect(() => {
        async function fetchCountries() {
            try {
                const res = await fetch(
                  "https://music-backend-production-99a.up.railway.app/api/v1/countries"
                );
                const data = await res.json();
                if (data) {
                  // const simplifiedCountries = extractCountries(data);
                  // setExistingCountries(simplifiedCountries);
                  console.log("countries>>>", data);
                }
            } catch (error) {
                console.error("Failed to fetch countries:", error);
            }
        }

        async function fetchTribes() {
            try {
                const res = await fetch(
                    "https://music-backend-production-99a.up.railway.app/api/v1/tribes"
                );
                const data = await res.json();
                if (data) {
                    // setExistingTribes(data);
                    console.log("tribes>>>", data);
                }
            } catch (error) {
                console.error("Failed to fetch tribes:", error);
            }
        }

        // function extractCountries(response: CountryApiResponse): SimplifiedCountry[] {
        //   return response.content.map(({ countryId, name, code, region }) => ({
        //     countryId,
        //     name,
        //     code,
        //     region
        //   }));
        // }


        fetchCountries();
        fetchTribes();
    }, []);

  // Effect to pre-populate form data when dialog opens or song prop changes
  useEffect(() => {
    if (open && artist) {

      setArtistFormData({
        id: artist.artistId, // Use artist.id for the PUT request
        name: artist.name || '',
        biography: artist.biography || '',
        thumbnailUrl: artist.thumbnailUrl || '',
        countryId: artist.country.countryId|| 0, 
        tribeId: artist.tribe.tribeId || 0, 
      });
    }
  }, [open, artist]);



  // Handle form input changes
  const handleInputChange = (field: keyof ArtistFormData, value: string) => {
    setArtistFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };


  // Handle artist selection
  // const handleCountryChange = ( newValue: Country | string | null) => {
  //   if (typeof newValue === 'string') {
  //     // User typed a custom value - you might want to handle this differently
  //     setSelectedCountry(null);
  //     setArtistFormData({ ...artistformData, countryId: 0 });
  //   } else if (newValue) {
  //     // User selected an existing artist
  //     setSelectedCountry(newValue);
  //     setArtistFormData({ ...artistformData, countryId: newValue.countryId });
  //   } else {
  //     // User cleared the selection
  //     setSelectedCountry(null);
  //     setArtistFormData({ ...artistformData, countryId: 0 });
  //   }
  // };

  // Handle genre selection
  // const handleTribeChange = ( newValue: Tribe | string | null) => {
  //   if (typeof newValue === 'string') {
  //     // User typed a custom value - you might want to handle this differently
  //     setSelectedTribe(null);
  //     setArtistFormData({ ...artistformData, tribeId: 0 });
  //   } else if (newValue) {
  //     // User selected an existing genre
  //     setSelectedTribe(newValue);
  //     setArtistFormData({ ...artistformData, tribeId: newValue.tribeId });
  //   } else {
  //     // User cleared the selection
  //     setSelectedTribe(null);
  //     setArtistFormData({ ...artistformData, tribeId: 0 });
  //   }
  // };



  // Handle form submission
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch( // Use formData.id for the PUT request
        `https://music-backend-production-99a.up.railway.app/api/v1/artists/${artistformData.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify(artistformData),
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
              Artist Details
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
                ID:
              </Typography>
              <TextField
                fullWidth
                placeholder="Edit country name"
                value={artistformData.id}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </Box>
            
            <Box>
              <Typography variant="body2" sx={{ color: '#FFEB3B', mb: 1, mt: 3 }}>
                Name:
              </Typography>
              <TextField
                fullWidth
                placeholder="Edit country name"
                value={artistformData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </Box>

            <Box>
              <Typography variant="body2" sx={{ color: '#FFEB3B', mb: 1 }}>
                Biography:
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Edit region"
                value={artistformData.biography}
                onChange={(e) => handleInputChange('biography', e.target.value)}
              />
            </Box>

            <Box>
              <Typography variant="body2" sx={{ color: '#FFEB3B', mb: 1 }}>
                Thumbnail URL:
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Edit thumbnail URL"
                value={artistformData.thumbnailUrl}
                onChange={(e) => handleInputChange('thumbnailUrl', e.target.value)}
              />
            </Box>

            {/* <Box>
              <Typography variant="body2" sx={{ color: '#FFEB3B', mb: 1 }}>
                Country:
              </Typography>
              <CustomAutocomplete
                // label="Country"
                placeholder="Type to search or select country"
                options={existingCountries}
                value={selectedCountry}
                onChange={handleCountryChange}
                getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
                freeSolo
              />         
            </Box> */}

            {/* <Box>
              <Typography variant="body2" sx={{ color: '#FFEB3B', mb: 1 }}>
                Tribe:
              </Typography>
              <CustomAutocomplete
                // label="Tribe"
                placeholder="Type to search or select tribe"
                options={existingTribes}
                value={selectedTribe}
                onChange={handleTribeChange}
                getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
                freeSolo
              />
            </Box> */}
            
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
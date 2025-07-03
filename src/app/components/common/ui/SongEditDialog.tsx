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
import { ParsedSong } from '@/app/utils/fetchSongsUtils'; // Import ParsedSong
import CustomAutocomplete from "../CustomFields/CustomAutocomplete";
import { Artist, Genre } from "@/app/types";
import { useSession } from "@/app/context/SessionContext";


interface SongFormData {
  id: number;
  title: string;
  description: string;
  filePath: string;
  thumbnailPath: string;
  artistId: number;
  genreId: number;
}

interface SongEditDialogProps {
  open: boolean;
  onClose: () => void;
  song: ParsedSong; // Change from songId: number to song: ParsedSong
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

const SongEditDialog: React.FC<SongEditDialogProps> = ({
  open,
  onClose,
  song, // Destructure the song object
  onSuccess,
}) => {
  const [existingArtists, setExistingArtists] = useState<Artist[]>([]);
  const [existingGenres, setExistingGenres] = useState<Genre[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [loading, setLoading] = useState(false);
  // Initialize formData with empty values, it will be populated by useEffect
  const [formData, setFormData] = useState<SongFormData>({
    id: song.songId, // Use song.songId for initial ID
    title: '',
    description: '',
    filePath: '',
    thumbnailPath: '',
    artistId: 0,
    genreId: 0,
  });
    const { accessToken } = useSession();


  // Effect to pre-populate form data when dialog opens or song prop changes
  useEffect(() => {
    if (open && song) {
      setFormData({
        id: song.songId,
        title: song.title || '',
        description: song.description || '',
        filePath: song.filePath || '',
        thumbnailPath: song.thumbnailPath || '',
        artistId: song.artistId || 0,
        genreId: song.genreId || 0,
      });
    }
  }, [open, song]);

  // Fetch artists
  useEffect(() => {
    async function fetchArtists() {
      try {
        const res = await fetch(
          "https://music-backend-production-99a.up.railway.app/api/v1/artists"
        );
        const data = await res.json();

        if (data?.content) {
          setExistingArtists(data.content);
          console.log("artists>>>", data.content);
        } else {
          setExistingArtists([]);
        }
      } catch (error) {
        console.error("Failed to fetch artists:", error);
      }
    }

    fetchArtists();
  }, []);

  // Fetch genres
  useEffect(() => {
    async function fetchGenres() {
      try {
        const res = await fetch(
          "https://music-backend-production-99a.up.railway.app/api/v1/genres"
        );
        const data = await res.json();
        if (data) {
          setExistingGenres(data);
          console.log("genres>>>", data);
        }
      } catch (error) {
        console.error("Failed to fetch genres:", error);
      }
    }

    fetchGenres();
  }, []);

  // Effect to set selected Artist/Genre objects for Autocomplete when existing data loads
  useEffect(() => {
    if (open && song && existingArtists.length > 0) {
      const artist = existingArtists.find(a => a.artistId === song.artistId);
      setSelectedArtist(artist || null);
    }
    if (open && song && existingGenres.length > 0) {
      const genre = existingGenres.find(g => g.genreId === song.genreId);
      setSelectedGenre(genre || null);
    }
  }, [open, song, existingArtists, existingGenres]);

  // Handle form input changes
  const handleInputChange = (field: keyof SongFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle artist selection
  const handleArtistChange = (event: any, newValue: Artist | string | null) => {
    if (typeof newValue === 'string') {
      // User typed a custom value - you might want to handle this differently
      setSelectedArtist(null);
      setFormData({ ...formData, artistId: 0 });
    } else if (newValue) {
      // User selected an existing artist
      setSelectedArtist(newValue);
      setFormData({ ...formData, artistId: newValue.artistId });
    } else {
      // User cleared the selection
      setSelectedArtist(null);
      setFormData({ ...formData, artistId: 0 });
    }
  };

 // Handle genre selection
  const handleGenreChange = (event: any, newValue: Genre | string | null) => {
    if (typeof newValue === 'string') {
      // User typed a custom value - you might want to handle this differently
      setSelectedGenre(null);
      setFormData({ ...formData, genreId: 0 });
    } else if (newValue) {
      // User selected an existing genre
      setSelectedGenre(newValue);
      setFormData({ ...formData, genreId: newValue.genreId });
    } else {
      // User cleared the selection
      setSelectedGenre(null);
      setFormData({ ...formData, genreId: 0 });
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch( // Use formData.id for the PUT request
        `https://music-backend-production-99a.up.railway.app/api/v1/songs/${formData.id}`,
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
        // fullWidth
        // PaperProps={{
        //   sx: {
        //     width: '700px',
        //     maxWidth: '90vw',
        //   },
        // }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon />
            <Typography variant="h6" component="span">
              Song Details
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
              <Typography variant="body2" sx={{ color: '#FFEB3B', mb: 1 }}>
                Title:
              </Typography>
              <TextField
                fullWidth
                placeholder="Enter song title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
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
                placeholder="Enter song description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </Box>

            <Box>
              <Typography variant="body2" sx={{ color: '#FFEB3B', mb: 1 }}>
                File Path:
              </Typography>
              <TextField
                fullWidth
                placeholder="Enter file path"
                value={formData.filePath}
                onChange={(e) => handleInputChange('filePath', e.target.value)}
              />
            </Box>

            <Box>
              <Typography variant="body2" sx={{ color: '#FFEB3B', mb: 1 }}>
                Thumbnail Path:
              </Typography>
              <TextField
                fullWidth
                placeholder="Enter thumbnail path"
                value={formData.thumbnailPath}
                onChange={(e) => handleInputChange('thumbnailPath', e.target.value)}
              />
            </Box>

            <Box>
              <Typography variant="body2" sx={{ color: '#FFEB3B', mb: 1 }}>
                Artist:
              </Typography>
              <CustomAutocomplete
                placeholder='Select or type an artist'
                options={existingArtists}
                value={selectedArtist}
                onChange={handleArtistChange}
                getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
                freeSolo
              />
            </Box>

            <Box>
              <Typography variant="body2" sx={{ color: '#FFEB3B', mb: 1 }}>
                Genre:
              </Typography>
              <CustomAutocomplete
                placeholder='Select or type a genre'
                options={existingGenres}
                value={selectedGenre}
                onChange={handleGenreChange}
                getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
                freeSolo
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

export default SongEditDialog;
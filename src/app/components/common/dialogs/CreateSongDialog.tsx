"use client";
import { useState, ChangeEvent, useEffect } from "react";
import { 
    Box, 
    Typography, 
    useTheme, 
    Dialog, 
    DialogActions, 
    DialogContent, 
    DialogTitle, 
    IconButton, 
    Button, 
    useMediaQuery, 
    createTheme, 
    ThemeProvider 
} from "@mui/material";
import CustomField from "../CustomFields/CustomField";
import CustomAutocomplete from "../CustomFields/CustomAutocomplete";
import SubmitButton from "../CustomButtons/SubmitButton";
import { useSession } from "@/app/context/SessionContext";
import { Artist, Genre } from "@/app/types";
import CloseIcon from "@mui/icons-material/Close";



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
          width: '100%',
          maxWidth: '400px',
          margin: '16px'
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




interface SongFormData {
    title: string;
    description: string;
    filePath: string;
    thumbnailPath: string;
    artistId: number; 
    genreId: number;
}

interface CreateSongDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: (artist: SongFormData) => void;
}

export default function CreateSongDialog({
    open,
    onClose,
    onSuccess,
}: CreateSongDialogProps ) {
    const { accessToken } = useSession();
    const [existingArtists, setExistingArtists] = useState<Artist[]>([]);
    const [existingGenres, setExistingGenres] = useState<Genre[]>([]);
    const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
    const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<string>("");
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const [formData, setSongFormData] = useState<SongFormData>({
        title: "",
        description: "",
        filePath: "",
        thumbnailPath: "",
        artistId: 0,
        genreId: 0
    });

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

  

    const handleChange = (field: keyof SongFormData) => (e: ChangeEvent<HTMLInputElement>) => {
        setSongFormData({ ...formData, [field]: e.target.value });
    };


    const resetForm = () => {
      setSongFormData({
        title: "",
        description: "",
        filePath: "",
        thumbnailPath: "",
        artistId: 0, 
        genreId: 0,
      });
      setError("");
      setSuccess("");
    };

    const handleClose = () => {
      if (!isSubmitting) {
        resetForm();
        onClose();
      }
    };


  const handleArtistChange = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: Artist | string | null
    ) => {
        if (typeof newValue === 'string') {
        // User typed a custom value - you might want to handle this differently
        setSelectedArtist(null);
        setSongFormData({ ...formData, artistId: 0 });
        } else if (newValue) {
        // User selected an existing artist
        setSelectedArtist(newValue);
        setSongFormData({ ...formData, artistId: newValue.artistId });
        } else {
        // User cleared the selection
        setSelectedArtist(null);
        setSongFormData({ ...formData, artistId: 0 });
        }
    };

  // Handle genre selection
  const handleGenreChange = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: Genre | string | null
    ) => {
        if (typeof newValue === 'string') {
            setSelectedGenre(null);
            setSongFormData({ ...formData, genreId: 0 });
        } else if (newValue) {
            setSelectedGenre(newValue);
            setSongFormData({ ...formData, genreId: newValue.genreId });
        } else {
            setSelectedGenre(null);
            setSongFormData({ ...formData, genreId: 0 });
        }
    };

    const handleSubmit = async () => {
        setError("");
        setSuccess("");
        setIsSubmitting(true);


        if (!formData.title || !formData.filePath || !formData.artistId || !formData.genreId) {
            setError("Please fill all required fields including artist and genre.");
            return;
        }

        try {
            const response = await fetch(
                "https://music-backend-production-99a.up.railway.app/api/v1/songs",
                {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: accessToken ? `Bearer ${accessToken}` : "",
                },
                body: JSON.stringify(formData),
                }
            );
            console.log("response>>>", response);
            const data = await response.json();

            if (response.ok) {
                setSuccess("Song successfully created!");
                if (onSuccess) onSuccess(data);
                setTimeout(() => onClose(), 1500);
            } else {
                setError(data.message || "Song creation failed.");
            }
        } catch (err) {
            console.error("Error:", err);
            setError("Network error. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

  return (
    <ThemeProvider theme={darkYellowTheme}>
        <Dialog
            open={open}
            onClose={onClose}
            fullScreen={isMobile}
            maxWidth="md"
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    minHeight: '500px',
                }
            }}
        >
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center'}}>
                <Typography variant="h6" component="div">
                    Add Song
                </Typography>
                <IconButton
                    aria-label="close"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    sx={{ color: (theme) => theme.palette.grey[500],}}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: { xs: 3, sm: 5 },
                    pt: 1,
                    mt: 2,
                }}>
                    <CustomField
                        label="Song Title"
                        placeholder="Enter song title"
                        type="text"
                        value={formData.title}
                        onChange={handleChange("title")}
                    />
                    <CustomField
                        label="Description"
                        placeholder="Short description of the song"
                        type="text"
                        value={formData.description}
                        onChange={handleChange("description")}
                    />
                    <CustomField
                        label="Song URL"
                        placeholder="https://example.com/song.mp3"
                        type="text"
                        value={formData.filePath}
                        onChange={handleChange("filePath")}
                    />
                    <CustomField
                        label="Thumbnail URL"
                        placeholder="https://..."
                        type="url"
                        value={formData.thumbnailPath}
                        onChange={handleChange("thumbnailPath")}
                    />
                    
                    {/* Artist Autocomplete */}
                    <CustomAutocomplete
                        label="Artist"
                        placeholder="Select or type an artist"
                        options={existingArtists}
                        value={selectedArtist}
                        onChange={handleArtistChange}
                        getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
                        freeSolo
                    />

                    {/* Genre Autocomplete */}
                    <CustomAutocomplete
                        label="Genre"
                        placeholder="Select or type a genre"
                        options={existingGenres}
                        value={selectedGenre}
                        onChange={handleGenreChange}
                        getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
                        freeSolo
                    />

                    {error && (
                        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                            {error}
                        </Typography>
                    )}
                    
                    {success && (
                        <Typography color="success.main" variant="body2" sx={{ mt: 1 }}>
                            {success}
                        </Typography>
                    )}
                </Box>
            </DialogContent>
            <DialogActions 
                sx={{
                borderTop: '1px solid #333',
                p: { xs: 2, sm: 3 },
                justifyContent: 'flex-end',
                gap: 1,
                }}
            >
                
                <Button 
                    variant="outlined"
                    onClick={handleClose} 
                    disabled={isSubmitting}
                    sx={{ height: '44px', width: '120px', borderRadius: '8px' }}
                >
                    Cancel
                </Button>
            
                <Box sx={{ display: 'flex', alignItems: 'center', width: '120px', height: '20px' }}>
                    <SubmitButton 
                        label={isSubmitting ? "Submitting..." : "Submit Song"}
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    />
                </Box>
            </DialogActions>
        </Dialog>
    </ThemeProvider>
  );
}
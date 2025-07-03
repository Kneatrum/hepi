"use client";
import { useState, ChangeEvent, SyntheticEvent, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import styles from "../../../styles/page.module.css";
import { Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    Button,
    IconButton,
    ThemeProvider,
    createTheme, 
} from "@mui/material";
import CustomField from "../CustomFields/CustomField";
import SubmitButton from "../CustomButtons/SubmitButton";
import { useSession } from "@/app/context/SessionContext";
import CloseIcon from "@mui/icons-material/Close";
import CustomAutocomplete from "../CustomFields/CustomAutocomplete";
import { Country, Tribe } from "@/app/types";

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
    id?: number;
    name: string;
    biography: string;
    thumbnailUrl: string;
    countryId: number;
    tribeId: number;
}

interface CreateArtistDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (artist: ArtistFormData) => void;
}

export default function CreateArtistDialog({
    open,
    onClose,
    onSuccess,
}: CreateArtistDialogProps ) {
    const { accessToken } = useSession();
    // const router = useRouter();

    const [formData, setArtistFormData] = useState<ArtistFormData>({
        id: 0,
        name: "",
        biography: "",
        thumbnailUrl: "",
        countryId: 0,
        tribeId: 0,
    });

    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [existingCountries, setExistingCountries] = useState<Country[]>([]);
    const [existingTribes, setExistingTribes] = useState<Tribe[]>([]);
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
    const [selectedTribe, setSelectedTribe] = useState<Tribe | null>(null);

    useEffect(() => {
        async function fetchCountries() {
            try {
                const res = await fetch(
                    "https://music-backend-production-99a.up.railway.app/api/v1/countries"
                );
                const data = await res.json();
                if (data) {
                    setExistingCountries(data);
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
                    setExistingTribes(data);
                    console.log("tribes>>>", data);
                }
            } catch (error) {
                console.error("Failed to fetch tribes:", error);
            }
        }

        fetchCountries();
        fetchTribes();
    }, []);


     // Handle artist selection
      const handleCountryChange = (event: SyntheticEvent, newValue: Country | string | null) => {
        if (typeof newValue === 'string') {
          setSelectedCountry(null);
          setArtistFormData({ ...formData, countryId: 0 });
        } else if (newValue) {
          setSelectedCountry(newValue);
          setArtistFormData({ ...formData, countryId: newValue.countryId });
        } else {
          setSelectedCountry(null);
          setArtistFormData({ ...formData, countryId: 0 });
        }
      };
    
     // Handle genre selection
      const handleTribeChange = (event: SyntheticEvent, newValue: Tribe | string | null) => {
        if (typeof newValue === 'string') {
          setSelectedTribe(null);
          setArtistFormData({ ...formData, tribeId: 0 });
        } else if (newValue) {
          setSelectedTribe(newValue);
          setArtistFormData({ ...formData, tribeId: newValue.tribeId });
        } else {
          setSelectedTribe(null);
          setArtistFormData({ ...formData, tribeId: 0 });
        }
      };

    const handleChange = (field: keyof ArtistFormData) => (e: ChangeEvent<HTMLInputElement>) => {
        setArtistFormData({ ...formData, [field]: e.target.value });
    };

    const resetForm = () => {
        setArtistFormData({
            id: 0,
            name: "",
            biography: "",
            thumbnailUrl: "",
            countryId: 0,
            tribeId: 0,
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

    const handleSubmit = async () => {
        setError("");
        setSuccess("");
        setIsSubmitting(true);

        if (!formData.name || !formData.biography || !formData.countryId || !formData.tribeId || !formData.thumbnailUrl) {
            setError("Please fill all required fields.");
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await fetch(
                "https://music-backend-production-99a.up.railway.app/api/v1/artists",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: accessToken ? `Bearer ${accessToken}` : "",
                    },
                    body: JSON.stringify(formData),
                }
            );
            const data = await response.json();

            if (response.ok) {
                setSuccess("Artist successfully created!");
                if (onSuccess) onSuccess(data);
                setTimeout(() => onClose(), 1500);
            } else {
                setError(data.message || "Artist creation failed.");
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
                onClose={handleClose}
                maxWidth="md"
                //   fullWidth
                PaperProps={{
                    sx: {
                    borderRadius: 2,
                    minHeight: '500px',
                    }
                }}
            >
        
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center'}}>
            <Typography variant="h6" component="div">
            Add Artist
            </Typography>
            <IconButton
                aria-label="close"
                onClick={handleClose}
                disabled={isSubmitting}
                sx={{
                    color: (theme) => theme.palette.grey[500],
                }}
                >
                <CloseIcon />
            </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5, pt: 1, mt: 5 }}>
                    <CustomField
                        label="Full Name"
                        placeholder="John Doe"
                        type="text"
                        value={formData.name}
                        onChange={handleChange("name")}
                    />
                    <CustomField
                        label="Biography"
                        placeholder="Short bio about the artist"
                        type="text"
                        value={formData.biography}
                        onChange={handleChange("biography")}
                    />
                    <CustomField
                        label="Thumbnail URL"
                        placeholder="https://..."
                        type="url"
                        value={formData.thumbnailUrl}
                        onChange={handleChange("thumbnailUrl")}
                    />

                    <CustomAutocomplete
                        label="Country"
                        placeholder="Select country"
                        options={existingCountries}
                        value={selectedCountry}
                        onChange={handleCountryChange}
                        getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
                        freeSolo
                    />

                    <CustomAutocomplete
                        label="Tribe"
                        placeholder="Select tribe"
                        options={existingTribes}
                        value={selectedTribe}
                        onChange={handleTribeChange}
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
            <DialogActions sx={{ borderTop: '1px solid #333', p: 3,  display: 'flex', justifyContent: 'space-between' }}>
                <Button 
                    variant="outlined"
                    onClick={handleClose} 
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>
                <SubmitButton 
                    label={isSubmitting ? "Submitting..." : "Submit Artist"}
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                />
            </DialogActions>
            </Dialog>
        </ThemeProvider>
    );
}

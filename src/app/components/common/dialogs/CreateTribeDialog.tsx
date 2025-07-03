"use client";
import { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
    Dialog,
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
import CloseIcon from "@mui/icons-material/Close";
import CustomField from "../CustomFields/CustomField";
import SubmitButton from "../CustomButtons/SubmitButton";
import { useSession } from "@/app/context/SessionContext";
import { Tribe } from "@/app/types";


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

interface TribeFormData {
  id: number;
  name: string;
  description: string;
}

interface CreateTribeDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (tribe: Tribe) => void;
}

export default function CreateTribeDialog({ 
  open, 
  onClose, 
  onSuccess 
}: CreateTribeDialogProps) {
  const { accessToken } = useSession();
  // const router = useRouter();

  const [formData, setFormData] = useState<TribeFormData>({
    id: 0,
    name: "",
    description: ""
  });

  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleChange = (field: keyof TribeFormData) => (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      id: 0,
      name: "",
      description: ""
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

    if (!formData.name || !formData.description) {
      setError("Please fill all required fields.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(
        "https://music-backend-production-99a.up.railway.app/api/v1/tribes",
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
        setSuccess("Tribe successfully created!");
        
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess(data);
        }
        
        setTimeout(() => {
          resetForm();
          onClose();
          // Optional: navigate to admin page
          // router.push("/admin");
        }, 1500);
      } else {
        setError(data.message || "Tribe creation failed.");
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
          Add Tribe
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
            label="Tribe Name"
            placeholder="e.g., Maasai"
            type="text"
            value={formData.name}
            onChange={handleChange("name")}
          />
          
          <CustomField
            label="Tribe Description"
            placeholder="A description of the tribe"
            type="text"
            value={formData.description}
            onChange={handleChange("description")}
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

      <DialogActions sx={{ borderTop: '1px solid #333', p: 3,  display: 'flex', justifyContent: 'right' }}>
        <Button 
          variant="outlined"
          onClick={handleClose} 
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        
        <SubmitButton 
          label={isSubmitting ? "Submitting..." : "Submit Tribe"}
          onClick={handleSubmit}
          disabled={isSubmitting}
        />
      </DialogActions>
    </Dialog>
    </ThemeProvider>
  );
}
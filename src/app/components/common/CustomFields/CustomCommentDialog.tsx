import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';

interface CommentDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (comment: string) => void;
}

export default function CommentDialog({
  open,
  onClose,
  onSubmit,
}: CommentDialogProps) {
  const [comment, setComment] = React.useState<string>('');

  const handleSubmit = () => {
    onSubmit(comment);
    setComment('');
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="sm"
      PaperProps={{
        sx: {
          backgroundColor: '#121212',
          color: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #2E2E2E',
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          color: '#FFFFFF',
          fontFamily: 'var(--font-outfit)',
          fontSize: '1.25rem',
          fontWeight: 600,
        }}
      >
        Leave a Comment
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="comment"
          label="Your Comment"
          type="text"
          fullWidth
          multiline
          minRows={3}
          variant="outlined"
          value={comment}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setComment(e.target.value)
          }
          InputLabelProps={{
            sx: {
              color: "var(--placeholder) !important",
              fontFamily: "var(--font-outfit) !important",
              "&.Mui-focused": {
                color: "#FFFFFF !important",
                backgroundColor: "#121212",
                padding: "0 4px",
              },
            },
          }}
          InputProps={{
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
              "& input, & textarea": {
                color: "#FFFFFF",
                fontFamily: "var(--font-outfit)",
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
            "& input:focus, & textarea:focus": {
              outline: "none !important",
              borderColor: "#FFFFFF !important",
              boxShadow: "none !important",
            },
          }}
        />
      </DialogContent>
      <DialogActions 
        sx={{ 
          padding: '16px 24px',
          gap: '12px'
        }}
      >
        <Button 
          onClick={onClose}
          sx={{
            color: '#FFFFFF',
            borderColor: '#2E2E2E',
            border: '1px solid #2E2E2E',
            borderRadius: '8px',
            fontFamily: 'var(--font-outfit)',
            textTransform: 'none',
            '&:hover': {
              borderColor: '#00BFFF',
              backgroundColor: 'rgba(230, 243, 42, 0.1)',
            }
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          sx={{
            backgroundColor: '#00BFFF',
            color: '#FFFFFF',
            borderRadius: '8px',
            fontFamily: 'var(--font-outfit)',
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: '#0099CC',
            },
            '&:disabled': {
              backgroundColor: '#2E2E2E',
              color: '#888888',
            }
          }}
          disabled={!comment.trim()}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}
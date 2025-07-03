import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import { Send } from '@mui/icons-material';
import { createTheme } from '@mui/material/styles';

// Create theme (you might want to import this from a shared theme file)
const theme = createTheme({
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
});

interface CommentDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (comment: string) => void;
  title?: string;
  placeholder?: string;
  submitButtonText?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  rows?: number;
}

const CommentDialog: React.FC<CommentDialogProps> = ({
  open,
  onClose,
  onSubmit,
  title = "Add Comment",
  placeholder = "Your comment",
  submitButtonText = "Post Comment",
  maxWidth = "sm",
  rows = 4
}) => {
  const [commentText, setCommentText] = useState<string>('');

  const handleSubmit = () => {
    if (!commentText.trim()) {
      return;
    }
    onSubmit(commentText);
    setCommentText('');
  };

  const handleClose = () => {
    setCommentText('');
    onClose();
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && event.ctrlKey) {
      handleSubmit();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#1a1a1a',
          border: '1px solid #333'
        }
      }}
    >
      <DialogTitle sx={{ color: 'white' }}>{title}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label={placeholder}
          type="text"
          fullWidth
          multiline
          rows={rows}
          variant="outlined"
          value={commentText}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCommentText(e.target.value)}
          onKeyPress={handleKeyPress}
          sx={{
            '& .MuiOutlinedInput-root': {
              color: 'white',
              '& fieldset': {
                borderColor: '#333',
              },
              '&:hover fieldset': {
                borderColor: theme.palette.secondary.main,
              },
              '&.Mui-focused fieldset': {
                borderColor: theme.palette.secondary.main,
              },
            },
            '& .MuiInputLabel-root': {
              color: '#ccc',
              '&.Mui-focused': {
                color: theme.palette.secondary.main,
              },
            },
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={handleClose}
          sx={{ color: '#ccc' }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          startIcon={<Send />}
          disabled={!commentText.trim()}
          sx={{ 
            backgroundColor: theme.palette.secondary.main,
            color: theme.palette.primary.main,
            '&:hover': {
              backgroundColor: '#FFD700'
            },
            '&:disabled': {
              backgroundColor: '#666',
              color: '#999'
            }
          }}
        >
          {submitButtonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CommentDialog;
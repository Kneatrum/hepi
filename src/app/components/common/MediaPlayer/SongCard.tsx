import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Avatar,
  Box,
  IconButton,
  Snackbar,
  Alert,
  Grid,
  Chip
} from '@mui/material';

import {
  ThumbUp,
  ThumbUpOutlined,
  ThumbDown,
  ThumbDownOutlined,
  Comment,
  Share,
} from '@mui/icons-material';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import MoreVertIcon from '@mui/icons-material/MoreVert';

// Import the new CommentDialog component
import CommentDialog from '@/app/components/common/ui/CommentDialog';
import SongEditDialog from '../ui/SongEditDialog';

import { ParsedSong } from '@/app/utils/fetchSongsUtils';
import { useSession } from "@/app/context/SessionContext";
import { useRouter } from 'next/navigation';
import { VotesState } from '@/app/utils/fetchVotesUtils';
import { getUserId } from "@/app/utils/authUtils";

interface CommentPayload {
  id: number;
  songId: number;
  userId: number;
  content: string;
}

interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

// Component props interface
interface SongCardProps {
  songs: ParsedSong[];
  currentSongIndex?: number;
  votes: VotesState;
  setVotes: React.Dispatch<React.SetStateAction<VotesState>>;
  handleSongSelect?: (songId: number) => void;
  userRole?: string;
  adminMode: boolean;
}

// Custom theme with black and yellow
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

const SongCard: React.FC<SongCardProps> = ({ songs, currentSongIndex, votes, setVotes, handleSongSelect, userRole, adminMode }) => {
  const [commentDialogOpen, setCommentDialogOpen] = useState<boolean>(false);
  const [selectedSongId, setSelectedSongId] = useState<number | null>(null);
  const [notification, setNotification] = useState<NotificationState>({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });
  const { accessToken } = useSession();
  const router = useRouter();
  const [userID, setUserID] = useState<number | null>(null);
  const [editSongDialogOpen, setEditSongDialogOpen] = useState(false);

  useEffect(() => {

    if (!accessToken) {
      console.error("No access token available");
      return;
    }

    let userID = getUserId(accessToken);
    setUserID(userID);
  }, [accessToken]);

  const handleVote = async (songId: number, voteType: 'UPVOTE' | 'DOWNVOTE'): Promise<void> => {
    try {
      const currentVote = votes[songId];
      
      // If clicking the same vote type, remove the vote
      if (currentVote === voteType) {
        // Here you would make an API call to remove the vote
        setVotes(prev => ({
          ...prev,
          [songId]: null
        }));
        showNotification('Vote removed', 'info');
        return;
      }

      // Cast new vote
      const response = await fetch('https://music-backend-production-99a.up.railway.app/api/v1/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          songId: songId,
          userId: userID,
          voteType: voteType
        }),
      });

      if (response.ok) {
        setVotes(prev => ({
          ...prev,
          [songId]: voteType
        }));
        showNotification(`${voteType.toLowerCase()} cast successfully!`, 'success');
      } else {
        showNotification('Error casting vote', 'error');
      }
    } catch (error) {
      console.error('Error voting:', error);
      showNotification('Error casting vote', 'error');
    }
  };

  const handleCommentSubmit = async (commentText: string): Promise<void> => {
    if (!selectedSongId) {
      showNotification('No song selected', 'error');
      return;
    }

    try {
      const commentPayload: CommentPayload = {
        id: 0,
        songId: selectedSongId,
        userId: userID || 0,
        content: commentText
      };

      const response = await fetch('https://music-backend-production-99a.up.railway.app/api/v1/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commentPayload),
      });

      if (response.ok) {
        showNotification('Comment posted successfully!', 'success');
        setCommentDialogOpen(false);
        setSelectedSongId(null);
      } else {
        showNotification('Error posting comment', 'error');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      showNotification('Error posting comment', 'error');
    }
  };

  const handleShare = (songId: number, title: string): void => {
    const shareUrl = `https://musicapp.com/song/${songId}?ref=${Math.random().toString(36).substring(7)}`;
    
    navigator.clipboard.writeText(shareUrl).then(() => {
      showNotification('Share URL copied to clipboard!', 'success');
    }).catch(() => {
      showNotification('Failed to copy URL', 'error');
    });
  };

  const showNotification = (message: string, severity: NotificationState['severity'] = 'success'): void => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = (): void => {
    setNotification({ ...notification, open: false });
  };

  const openCommentDialog = (songId: number): void => {
    setSelectedSongId(songId);
    setCommentDialogOpen(true);
  };

  const handleCommentDialogClose = (): void => {
    setCommentDialogOpen(false);
    setSelectedSongId(null);
  };

  const handleCardClick = (songId: number): void => {
    if (handleSongSelect) {
      handleSongSelect(songId);
    }
  };

  // Helper function to determine if a song is currently selected
  const isSongSelected = (index: number): boolean => {
    return currentSongIndex !== undefined && currentSongIndex === index;
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ padding: 2 }}>
        <Grid container spacing={3}>
          {songs.map((song, index) => {
            const isSelected = isSongSelected(index);
            
            return (
              <Grid item xs={12} sm={6} md={3} key={song.songId}>
                <Card 
                  onClick={() => handleCardClick(song.songId)}
                  sx={{ 
                    position: 'relative',
                    backgroundColor: isSelected ? theme.palette.secondary.main : '#1a1a1a',
                    border: isSelected ? '1px solid #000000' : '1px solid #333',
                    borderRadius: 2,
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: isSelected 
                        ? '0 4px 20px rgba(44, 31, 31, 0.3)' 
                        : '0 4px 20px rgba(255, 235, 59, 0.3)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease'
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <Avatar
                        src={song.thumbnailPath || '/default-music-icon.png'}
                        sx={{ 
                          width: 56, 
                          height: 56, 
                          mr: 2,
                          backgroundColor: isSelected ? theme.palette.primary.main : theme.palette.secondary.main,
                          color: isSelected ? theme.palette.secondary.main : theme.palette.primary.main
                        }}
                      >
                        ♪
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography 
                          variant="h6" 
                          component="div" 
                          sx={{ 
                            color: isSelected ? theme.palette.primary.main : 'white',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            mb: 0.5,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            paddingRight: '16px'
                          }}
                        >
                          {song.title}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: isSelected ? theme.palette.primary.main : theme.palette.secondary.main,
                            mb: 1
                          }}
                        >
                          {song.artistName || 'Unknown Artist'}
                        </Typography>
                      </Box>
                      {userRole === 'SUPERADMIN' && adminMode && (
                        <IconButton 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSongId(song.songId);
                            setEditSongDialogOpen(true);
                            console.log(`Edit song: ${song.songId}`);
                          }}
                          sx={{ 
                            color: isSelected ? theme.palette.primary.main : theme.palette.secondary.main,
                            '&:hover': { 
                              backgroundColor: isSelected ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 235, 59, 0.1)' 
                            },
                            position: 'absolute',
                            top: 1,
                            right: -5
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      )}
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <Chip 
                        label={song.genreName || 'Unknown Genre'}
                        size="small"
                        sx={{ 
                          backgroundColor: isSelected ? theme.palette.primary.main : theme.palette.secondary.main,
                          color: isSelected ? theme.palette.secondary.main : theme.palette.primary.main,
                          fontWeight: 'bold'
                        }}
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip 
                        label={song.countryName || 'Unknown Country'}
                        size="small"
                        variant="outlined"
                        sx={{ 
                          borderColor: isSelected ? theme.palette.primary.main : theme.palette.secondary.main,
                          color: isSelected ? theme.palette.primary.main : theme.palette.secondary.main
                        }}
                      />
                    </Box>
                  </CardContent>
                  
                  <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVote(song.songId, 'UPVOTE');
                        }}
                        sx={{ 
                          color: votes[song.songId] === 'UPVOTE' 
                            ? (isSelected ? theme.palette.primary.main : theme.palette.secondary.main)
                            : (isSelected ? theme.palette.primary.main : 'white'),
                          '&:hover': { 
                            backgroundColor: isSelected 
                              ? 'rgba(0, 0, 0, 0.1)' 
                              : 'rgba(255, 235, 59, 0.1)' 
                          }
                        }}
                      >
                        {votes[song.songId] === 'UPVOTE' ? <ThumbUp /> : <ThumbUpOutlined />}
                      </IconButton>
                      
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVote(song.songId, 'DOWNVOTE');
                        }}
                        sx={{ 
                          color: votes[song.songId] === 'DOWNVOTE' 
                            ? (isSelected ? theme.palette.primary.main : theme.palette.secondary.main)
                            : (isSelected ? theme.palette.primary.main : 'white'),
                          '&:hover': { 
                            backgroundColor: isSelected 
                              ? 'rgba(0, 0, 0, 0.1)' 
                              : 'rgba(255, 235, 59, 0.1)' 
                          }
                        }}
                      >
                        {votes[song.songId] === 'DOWNVOTE' ? <ThumbDown /> : <ThumbDownOutlined />}
                      </IconButton>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          openCommentDialog(song.songId);
                        }}
                        sx={{ 
                          color: isSelected ? theme.palette.primary.main : 'white',
                          '&:hover': { 
                            backgroundColor: isSelected 
                              ? 'rgba(0, 0, 0, 0.1)' 
                              : 'rgba(255, 235, 59, 0.1)',
                            color: isSelected ? theme.palette.primary.main : theme.palette.secondary.main
                          }
                        }}
                      >
                        <Comment />
                      </IconButton>
                      
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare(song.songId, song.title);
                        }}
                        sx={{ 
                          color: isSelected ? theme.palette.primary.main : 'white',
                          '&:hover': { 
                            backgroundColor: isSelected 
                              ? 'rgba(0, 0, 0, 0.1)' 
                              : 'rgba(255, 235, 59, 0.1)',
                            color: isSelected ? theme.palette.primary.main : theme.palette.secondary.main
                          }
                        }}
                      >
                        <Share />
                      </IconButton>
                    </Box>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Conditionally render the single edit dialog outside the map loop */}
        {selectedSongId !== null && (
          <SongEditDialog
            open={editSongDialogOpen}
            onClose={() => {
              setEditSongDialogOpen(false);
              setSelectedSongId(null); // Reset song ID on close
            }} // Pass the entire song object
            song={songs.find(s => s.songId === selectedSongId)!}
            onSuccess={() => {
              setEditSongDialogOpen(false);
              setSelectedSongId(null);
              // You can add a success notification here if you want
              showNotification('Song updated successfully!', 'success');
            }}
          />
        )}

        <CommentDialog
          open={commentDialogOpen}
          onClose={handleCommentDialogClose}
          onSubmit={handleCommentSubmit}
          title="Add Comment"
          placeholder="Your comment"
          submitButtonText="Post Comment"
        />

        {/* Notification Snackbar */}
        <Snackbar
          open={notification.open}
          autoHideDuration={4000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseNotification} 
            severity={notification.severity}
            sx={{ 
              backgroundColor: notification.severity === 'success' ? theme.palette.secondary.main : undefined,
              color: notification.severity === 'success' ? theme.palette.primary.main : undefined
            }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default SongCard;
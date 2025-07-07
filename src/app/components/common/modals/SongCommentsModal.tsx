import React, { useState, useMemo } from 'react';
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Avatar,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  TextField,
  InputAdornment,
  Fade,
  Backdrop,
  Tooltip,
  Grid,
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  MusicNote as MusicNoteIcon,
  Comment as CommentIcon,
  ThumbUp as ThumbUpIcon,
  PlayArrow as PlayArrowIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import { Comment, IndexedComments } from '../../../utils/fetchCommentsUtils'; // Adjust import path
import { CommentUtils } from '../../../utils/fetchCommentsUtils'; // Adjust import path

interface SongCommentsModalProps {
  open: boolean;
  onClose: () => void;
  songId: number | null;
  data: IndexedComments | null;
}

const absolute = 'absolute';

const modalStyle = {
  position: absolute,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '95%', sm: '90%', md: '80%', lg: '70%' },
  maxWidth: '1200px',
  maxHeight: '90vh',
  bgcolor: '#1a1a1a',
  border: '2px solid #FFEB3B',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(255, 235, 59, 0.3)',
  p: 0,
  overflow: 'hidden',
};

const SongCommentsModal: React.FC<SongCommentsModalProps> = ({
  open,
  onClose,
  songId,
  data,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const { comments, song } = useMemo(() => {
    if (!data || !songId) {
      return { comments: [], song: null };
    }
    
    const songComments = CommentUtils.getSongComments(data, songId);
    const songData = data.songIndex.get(songId);
    
    return {
      comments: songComments,
      song: songData?.song || null,
    };
  }, [data, songId]);

  const filteredComments = useMemo(() => {
    if (!searchTerm) return comments;
    
    const term = searchTerm.toLowerCase();
    return comments.filter(comment =>
      comment.content.toLowerCase().includes(term) ||
      comment.user.firstname.toLowerCase().includes(term) ||
      comment.user.lastname.toLowerCase().includes(term) ||
      comment.user.email.toLowerCase().includes(term)
    );
  }, [comments, searchTerm]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getUserInitials = (user: Comment['user']) => {
    return `${user.firstname.charAt(0)}${user.lastname.charAt(0)}`.toUpperCase();
  };

  if (!song) {
    return (
      <Modal
        open={open}
        onClose={onClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
          sx: { backgroundColor: 'rgba(0, 0, 0, 0.8)' },
        }}
      >
        <Fade in={open}>
          <Box sx={modalStyle}>
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="text.primary">
                No song data available
              </Typography>
              <IconButton
                onClick={onClose}
                sx={{ position: 'absolute', top: 8, right: 8, color: '#FFEB3B' }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </Fade>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
        sx: { backgroundColor: 'rgba(0, 0, 0, 0.8)' },
      }}
    >
      <Fade in={open}>
        <Box sx={modalStyle}>
          {/* Header */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
              p: 3,
              borderBottom: '2px solid #FFEB3B',
              position: 'relative',
            }}
          >
            <IconButton
              onClick={onClose}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                color: '#FFEB3B',
                '&:hover': { backgroundColor: 'rgba(255, 235, 59, 0.1)' },
              }}
            >
              <CloseIcon />
            </IconButton>

            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <MusicNoteIcon sx={{ color: '#FFEB3B', fontSize: 32 }} />
                    <Box>
                      <Typography variant="h5" color="text.primary" fontWeight="bold">
                        {song.title}
                      </Typography>
                      <Typography variant="subtitle1" color="text.secondary">
                        by {song.artist.name}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" color="text.primary" sx={{ opacity: 0.8 }}>
                    {song.description}
                  </Typography>
                </Stack>
              </Grid>

              <Grid item xs={12} md={4}>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Chip
                        icon={
                            <Box sx={{ color: '#000 !important', display: 'flex' }}>
                                <PlayArrowIcon sx={{fontSize: 'medium'}} />
                            </Box>
                        }
                        label={`${song.playCount} plays`}
                        size="small"
                        sx={{ backgroundColor: '#FFEB3B', color: '#000000' }}
                    />
                    <Chip
                      icon={
                            <Box sx={{ color: '#000 !important', display: 'flex' }}>
                                <ThumbUpIcon sx={{fontSize: 'medium'}}/>
                            </Box>
                        }
                        label={`${song.likeCount} likes`}
                        size="small"
                        sx={{ backgroundColor: '#FFEB3B', color: '#000000' }}
                    />
                    <Chip
                        icon={
                            <Box sx={{ color: '#000 !important', display: 'flex' }}>
                                <ShareIcon sx={{fontSize: 'medium'}}/>
                            </Box>
                        }
                        label={`${song.shareCount} shares`}
                        size="small"
                        sx={{ backgroundColor: '#FFEB3B', color: '#000000' }}
                    />
                  </Box>
                  
                  <Chip
                    label={song.genre.name}
                    size="small"
                    variant="outlined"
                    sx={{ 
                      borderColor: '#FFEB3B', 
                      color: '#FFEB3B',
                      alignSelf: 'flex-start',
                    }}
                  />
                </Stack>
              </Grid>
            </Grid>
          </Box>

          {/* Search and Stats */}
          <Box sx={{ p: 3, borderBottom: '1px solid #333' }}>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CommentIcon sx={{ color: '#FFEB3B' }} />
                  <Typography variant="h6" color="text.primary">
                    Comments ({filteredComments.length})
                  </Typography>
                </Box>
                
                <TextField
                  placeholder="Search comments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size="small"
                  sx={{
                    width: 300,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#000000',
                      borderRadius: '8px',
                      '& fieldset': { borderColor: '#FFEB3B' },
                      '&:hover fieldset': { borderColor: '#FFEB3B' },
                      '&.Mui-focused fieldset': { borderColor: '#FFEB3B' },
                    },
                    '& .MuiInputBase-input': { color: '#ffffff' },
                    '& .MuiInputBase-input::placeholder': { color: '#888' },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#FFEB3B' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Stack>
          </Box>

          {/* Comments List */}
          <Box
            sx={{
              maxHeight: '60vh',
              overflowY: 'auto',
              p: 3,
              '&::-webkit-scrollbar': { width: 8 },
              '&::-webkit-scrollbar-track': { backgroundColor: '#1a1a1a' },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#FFEB3B',
                borderRadius: '4px',
              },
            }}
          >
            {filteredComments.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <CommentIcon sx={{ color: '#FFEB3B', fontSize: 64, mb: 2 }} />
                <Typography variant="h6" color="text.primary" gutterBottom>
                  {searchTerm ? 'No matching comments found' : 'No comments yet'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchTerm ? 'Try adjusting your search term' : 'Be the first to comment on this song!'}
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {filteredComments.map((comment) => (
                  <Card
                    key={comment.id}
                    sx={{
                      backgroundColor: '#000000',
                      border: '1px solid #333',
                      borderRadius: '12px',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: '#FFEB3B',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 16px rgba(255, 235, 59, 0.2)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: '#FFEB3B',
                            color: '#000000',
                            width: 48,
                            height: 48,
                            fontWeight: 'bold',
                          }}
                        >
                          {getUserInitials(comment.user)}
                        </Avatar>
                        
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Box>
                              <Typography variant="subtitle1" color="text.primary" fontWeight="bold">
                                {comment.user.firstname} {comment.user.lastname}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {comment.user.email}
                              </Typography>
                            </Box>
                            
                            <Tooltip title={formatDate(comment.createdAt)}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <TimeIcon sx={{ color: '#FFEB3B', fontSize: 16 }} />
                                <Typography variant="caption" color="text.secondary">
                                  {formatDate(comment.createdAt)}
                                </Typography>
                              </Box>
                            </Tooltip>
                          </Box>
                          
                          <Divider sx={{ borderColor: '#333', my: 1 }} />
                          
                          <Typography variant="body1" color="text.primary" sx={{ lineHeight: 1.6 }}>
                            {comment.content}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                            <Chip
                              icon={<PersonIcon />}
                              label={comment.user.role.roleName}
                              size="small"
                              variant="outlined"
                              sx={{ 
                                borderColor: '#FFEB3B', 
                                color: '#FFEB3B',
                                fontSize: '0.75rem',
                              }}
                            />
                            {comment.user.country && (
                              <Chip
                                label={comment.user.country.name}
                                size="small"
                                sx={{ 
                                  backgroundColor: 'rgba(255, 235, 59, 0.1)',
                                  color: '#FFEB3B',
                                  fontSize: '0.75rem',
                                }}
                              />
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

export default SongCommentsModal;
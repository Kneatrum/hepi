

import { useState } from "react";
import { Song } from '@/app/types';
import { Box, Typography, ListItem, ListItemAvatar, Avatar, Paper, ListItemText, List, Chip, IconButton } from "@mui/material";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import SongActions from "./SongActions";
import SongCard from "./SongCard";


// Song List Component
interface SongListProps {
  songs: Song[];
  currentSongIndex: number;
  onSongSelect: (songId: number) => void;
  onLike?: (songId: number) => void;
}

export default function SongList({ songs, currentSongIndex, onSongSelect, onLike }: SongListProps) {
  const [likedSongs, setLikedSongs] = useState<Set<number>>(new Set());

  const handleLike = (songId: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering song selection
    
    const newLikedSongs = new Set(likedSongs);
    if (likedSongs.has(songId)) {
      newLikedSongs.delete(songId);
    } else {
      newLikedSongs.add(songId);
    }
    setLikedSongs(newLikedSongs);
    
    if (onLike) {
      onLike(songId);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (songs.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#1a1a1a', color: 'white' }}>
        <MusicNoteIcon sx={{ fontSize: 48, color: '#666', mb: 2 }} />
        <Typography variant="h6" color="#666">
          No songs available
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ bgcolor: '#1a1a1a', color: 'white' }}>
      <Box sx={{ p: 2, borderBottom: '1px solid #333' }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MusicNoteIcon />
          Playlist ({songs.length} songs)
        </Typography>
      </Box>
      
      <List sx={{ p: 0 }}>
        {songs.map((song, index) => {
          const isCurrentSong = index === currentSongIndex;
          
          return (
            <ListItem
              key={song.songId}
              onClick={() => onSongSelect(song.songId)}
              sx={{
                cursor: 'pointer',
                bgcolor: isCurrentSong ? 'rgba(178, 199, 83, 0.1)' : 'transparent',
                borderLeft: isCurrentSong ? '3px solid #D39A0B' : '3px solid transparent',
                '&:hover': {
                  bgcolor: isCurrentSong ? 'rgba(178, 199, 83, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                },
                transition: 'background-color 0.2s ease',
                py: 1.5,
              }}
            >
              <ListItemAvatar>
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    src={song.thumbnailPath}
                    alt={song.title}
                    sx={{ width: 50, height: 50 }}
                  >
                    <MusicNoteIcon />
                  </Avatar>
                  {isCurrentSong && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 6,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'rgba(0, 0, 0, 0.7)',
                        borderRadius: '50%',
                      }}
                    >
                      <PlayCircleOutlineIcon sx={{ color: '#D39A0B', fontSize: 24 }} />
                    </Box>
                  )}
                </Box>
              </ListItemAvatar>
              
              <ListItemText
                primary={
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: isCurrentSong ? '#D39A0B' : 'white',
                      fontWeight: isCurrentSong ? 600 : 400,
                    }}
                    noWrap
                  >
                    {song.title}
                  </Typography>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" sx={{ color: '#b3b3b3' }} noWrap>
                      {song.artist?.name || 'Unknown Artist'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                      <Chip 
                        label={song.genre?.name || 'Unknown'} 
                        size="small" 
                        sx={{ 
                          bgcolor: 'rgba(255, 255, 255, 0.1)', 
                          color: '#b3b3b3',
                          fontSize: '0.7rem',
                          height: '20px'
                        }} 
                      />
                      <Typography variant="caption" sx={{ color: '#666', alignSelf: 'center' }}>
                        {song.playCount || 0} plays
                      </Typography>
                    </Box>
                  </Box>
                }
              />
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                
                <IconButton
                  onClick={(e) => handleLike(song.songId, e)}
                  size="small"
                  sx={{ color: likedSongs.has(song.songId) ? 'red' : '#666' }}
                >
                  {likedSongs.has(song.songId) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>

                {/* <SongActions
                  currentSong={song}
                  upVotedSongs={new Set()}
                  downVotedSongs={new Set()}
                  onOpenCommentDialog={() => console.log('Open comment dialog')}
                  onToggleUpVote={() => console.log('Toggle upvote')}
                  onToggleDownVote={() => console.log('Toggle downvote')}
                  onShare={() => console.log('Share song')}
                /> */}
                <Typography variant="caption" sx={{ color: '#666', minWidth: '35px' }}>
                  3:45 {/* You can calculate actual duration if available */}
                </Typography>
              </Box>
            </ListItem>
          );
        })}
      </List>
      {/* <SongCard/> */}
    </Paper>
  );
}
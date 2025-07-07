"use client"
import React, { useState, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  // Paper,
  Avatar,
  Chip,
  // LinearProgress,
  Divider,
  IconButton,
  // Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  // Alert,
  // CircularProgress,
  Button,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Badge,
} from '@mui/material';
import {
  // TrendingUp as TrendingUpIcon,
  Comment as CommentIcon,
  Person as PersonIcon,
  MusicNote as MusicNoteIcon,
  BarChart as BarChartIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Star as StarIcon,
  Group as GroupIcon,
  Assessment as AssessmentIcon,
  // Timeline as TimelineIcon,
  Filter as FilterIcon,
  Clear as ClearIcon,
  // Refresh as RefreshIcon,
} from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {  CommentUtils, Comment, User, Song } from '../../../../utils/fetchCommentsUtils';
import { useSongsContext } from "@/app/context/SongsContext";
import SongCommentsModal from '../../../../components/common/modals/SongCommentsModal';


// Your theme
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
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '12px',
          '&:hover': {
            borderColor: '#FFEB3B',
            transform: 'translateY(-2px)',
            transition: 'all 0.3s ease',
          },
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '12px',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#000000',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#000000',
          color: '#FFEB3B',
          fontWeight: 'bold',
          fontSize: '16px',
          borderBottom: '2px solid #FFEB3B',
        },
        body: {
          color: '#ffffff',
          borderBottom: '1px solid #333',
          fontSize: '14px',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(255, 235, 59, 0.1)',
          },
          '&:nth-of-type(even)': {
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
          },
        },
      },
    },
  },
});

interface TopUser {
  user: User;
  commentCount: number;
  songsCommentedOn: number;
}

interface TopSong {
  song: Song;
  commentCount: number;
  uniqueCommenters: number;
}

interface UserSongAnalysis {
  user: User;
  songs: Song[];
  totalComments: number;
}

const Page: React.FC = () => {
  // State management
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedSongId, setSelectedSongId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  // const [sortBy, setSortBy] = useState<'comments' | 'users' | 'songs'>('comments');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSongId, setModalSongId] = useState<number | null>(null);
    const { commentsData } = useSongsContext();

  // Data fetching
  // const { commentsData, commentsLoading, commentsError, progress, fetchAllComments } = useCommentPagination({
  //   baseUrl: commentsApiUrl, 
  //   pageSize: 50,
  //   maxConcurrentRequests: 3,
  // });

  // useEffect(() => {
  //   fetchAllComments();
  // }, [fetchAllComments]);

  // Computed data using CommentUtils
  const analysisData = useMemo(() => {
    if (!commentsData) return null;

    const stats = CommentUtils.getStats(commentsData);
    
    // Top users by comment count
    const topUsers: TopUser[] = Array.from(commentsData.userIndex.entries())
      .map(([userId, userData]) => ({
        user: userData.user,
        commentCount: userData.comments.length,
        songsCommentedOn: userData.commentsBySong.size,
        userId
      }))
      .sort((a, b) => b.commentCount - a.commentCount)
      .slice(0, 10);

    // Top songs by comment count
    const topSongs: TopSong[] = Array.from(commentsData.songIndex.entries())
      .map(([songId, songData]) => ({
        song: songData.song,
        commentCount: songData.comments.length,
        uniqueCommenters: songData.commentsByUser.size,
        songId
      }))
      .sort((a, b) => b.commentCount - a.commentCount)
      .slice(0, 10);

    // User-song analysis
    const userSongAnalysis: UserSongAnalysis[] = Array.from(commentsData.userIndex.entries())
      .map(([userId, userData]) => ({
        user: userData.user,
        songs: CommentUtils.getUserCommentedSongs(commentsData, userId),
        totalComments: userData.comments.length,
      }))
      .filter(item => item.songs.length > 0)
      .sort((a, b) => b.totalComments - a.totalComments);

    return {
      stats,
      topUsers,
      topSongs,
      userSongAnalysis,
    };
  }, [commentsData]);

  // Filtered data based on search and selection
  const filteredData = useMemo(() => {
    if (!commentsData || !analysisData) return null;

    let userComments: Comment[] = [];
    let songComments: Comment[] = [];
    let userSongComments: Comment[] = [];

    if (selectedUserId) {
      userComments = CommentUtils.getUserComments(commentsData, selectedUserId);
      if (selectedSongId) {
        userSongComments = CommentUtils.getUserCommentsOnSong(commentsData, selectedUserId, selectedSongId);
      }
    }

    if (selectedSongId) {
      songComments = CommentUtils.getSongComments(commentsData, selectedSongId);
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      userComments = userComments.filter(c => 
        c.content.toLowerCase().includes(term) ||
        c.song.title.toLowerCase().includes(term)
      );
      songComments = songComments.filter(c => 
        c.content.toLowerCase().includes(term) ||
        c.user.firstname.toLowerCase().includes(term) ||
        c.user.lastname.toLowerCase().includes(term)
      );
      userSongComments = userSongComments.filter(c => 
        c.content.toLowerCase().includes(term)
      );
    }

    return {
      userComments,
      songComments,
      userSongComments,
    };
  }, [commentsData, selectedUserId, selectedSongId, searchTerm, analysisData]);

  const handleOpenSongModal = (songId: number) => {
    setModalSongId(songId);
    setModalOpen(true);
  };

  const handleClearFilters = () => {
    setSelectedUserId(null);
    setSelectedSongId(null);
    setSearchTerm('');
  };

  const getUserInitials = (user: User) => {
    return `${user.firstname.charAt(0)}${user.lastname.charAt(0)}`.toUpperCase();
  };

  // if (commentsLoading) {
  //   return (
  //     <ThemeProvider theme={darkYellowTheme}>
  //       <Box
  //         sx={{
  //           display: 'flex',
  //           justifyContent: 'center',
  //           alignItems: 'center',
  //           minHeight: '100vh',
  //           backgroundColor: '#000000',
  //         }}
  //       >
  //         <Stack spacing={3} alignItems="center">
  //           <CircularProgress size={60} sx={{ color: '#FFEB3B' }} />
  //           <Typography variant="h6" color="text.primary">
  //             Loading Comments Analysis...
  //           </Typography>
  //           <Typography variant="body2" color="text.secondary">
  //             {progress.current > 0 && `${progress.current}/${progress.total} pages loaded`}
  //           </Typography>
  //           <LinearProgress
  //             variant="determinate"
  //             value={progress.total > 0 ? (progress.current / progress.total) * 100 : 0}
  //             sx={{
  //               width: 300,
  //               height: 8,
  //               borderRadius: 4,
  //               backgroundColor: '#333',
  //               '& .MuiLinearProgress-bar': {
  //                 backgroundColor: '#FFEB3B',
  //               },
  //             }}
  //           />
  //         </Stack>
  //       </Box>
  //     </ThemeProvider>
  //   );
  // }

  // if (commentsError) {
  //   return (
  //     <ThemeProvider theme={darkYellowTheme}>
  //       <Container maxWidth="lg" sx={{ py: 4 }}>
  //         <Alert severity="error" sx={{ mb: 2 }}>
  //           Error loading comments: {commentsError.message}
  //         </Alert>
  //         <Button
  //           variant="contained"
  //           onClick={fetchAllComments}
  //           startIcon={<RefreshIcon />}
  //           sx={{ backgroundColor: '#FFEB3B', color: '#000000' }}
  //         >
  //           Retry
  //         </Button>
  //       </Container>
  //     </ThemeProvider>
  //   );
  // }

  if (!commentsData || !analysisData) {
    return (
      <ThemeProvider theme={darkYellowTheme}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography variant="h6" color="text.primary">
            No data available
          </Typography>
        </Container>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={darkYellowTheme}>
      <Box sx={{ backgroundColor: '#000000', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="xl">
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h3" color="text.primary" gutterBottom fontWeight="bold">
              Comments Analysis Dashboard
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Comprehensive analysis of user comments across all songs
            </Typography>
          </Box>

          {/* Overall Statistics */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" color="text.secondary" fontWeight="bold">
                        {analysisData.stats.totalComments}
                      </Typography>
                      <Typography variant="body2" color="text.primary">
                        Total Comments
                      </Typography>
                    </Box>
                    <CommentIcon sx={{ color: '#FFEB3B', fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" color="text.secondary" fontWeight="bold">
                        {analysisData.stats.totalUsers}
                      </Typography>
                      <Typography variant="body2" color="text.primary">
                        Active Users
                      </Typography>
                    </Box>
                    <PersonIcon sx={{ color: '#FFEB3B', fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" color="text.secondary" fontWeight="bold">
                        {analysisData.stats.totalSongs}
                      </Typography>
                      <Typography variant="body2" color="text.primary">
                        Songs with Comments
                      </Typography>
                    </Box>
                    <MusicNoteIcon sx={{ color: '#FFEB3B', fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" color="text.secondary" fontWeight="bold">
                        {analysisData.stats.avgCommentsPerUser.toFixed(1)}
                      </Typography>
                      <Typography variant="body2" color="text.primary">
                        Avg Comments/User
                      </Typography>
                    </Box>
                    <BarChartIcon sx={{ color: '#FFEB3B', fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Filters */}
          <Card sx={{ mb: 4 }}>
            <CardHeader
              title="Filters & Search"
              titleTypographyProps={{ color: 'text.primary', fontWeight: 'bold' }}
              avatar={<FilterIcon sx={{ color: '#FFEB3B' }} />}
            />
            <CardContent>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: '#FFEB3B' }}>Select User</InputLabel>
                    <Select
                      value={selectedUserId || ''}
                      onChange={(e) => setSelectedUserId(e.target.value as number)}
                      sx={{
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#FFEB3B' },
                        '& .MuiSelect-select': { color: '#ffffff' },
                      }}
                    >
                      <MenuItem value="">All Users</MenuItem>
                      {analysisData.topUsers.map((item) => (
                        <MenuItem key={item.user.id} value={item.user.id}>
                          {item.user.firstname} {item.user.lastname} ({item.commentCount} comments)
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: '#FFEB3B' }}>Select Song</InputLabel>
                    <Select
                      value={selectedSongId || ''}
                      onChange={(e) => setSelectedSongId(e.target.value as number)}
                      sx={{
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#FFEB3B' },
                        '& .MuiSelect-select': { color: '#ffffff' },
                      }}
                    >
                      <MenuItem value="">All Songs</MenuItem>
                      {analysisData.topSongs.map((item) => (
                        <MenuItem key={item.song.songId} value={item.song.songId}>
                          {item.song.title} by {item.song.artist.name} ({item.commentCount} comments)
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    placeholder="Search comments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: '#FFEB3B' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: '#FFEB3B' },
                        '&:hover fieldset': { borderColor: '#FFEB3B' },
                        '&.Mui-focused fieldset': { borderColor: '#FFEB3B' },
                      },
                      '& .MuiInputBase-input': { color: '#ffffff' },
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleClearFilters}
                    startIcon={<ClearIcon />}
                    sx={{
                      borderColor: '#FFEB3B',
                      color: '#FFEB3B',
                      '&:hover': { borderColor: '#FFEB3B', backgroundColor: 'rgba(255, 235, 59, 0.1)' },
                    }}
                  >
                    Clear
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Grid container spacing={3}>
            {/* Top Users */}
            <Grid item xs={12} lg={6}>
              <Card>
                <CardHeader
                  title="Top Commenters"
                  titleTypographyProps={{ color: 'text.primary', fontWeight: 'bold' }}
                  avatar={<GroupIcon sx={{ color: '#FFEB3B' }} />}
                />
                <CardContent>
                  <List>
                    {analysisData.topUsers.slice(0, 5).map((item, index) => (
                      <ListItem key={item.user.id} divider>
                        <ListItemAvatar>
                          <Badge badgeContent={index + 1} color="primary">
                            <Avatar sx={{ bgcolor: '#FFEB3B', color: '#000000' }}>
                              {getUserInitials(item.user)}
                            </Avatar>
                          </Badge>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography color="text.primary" fontWeight="bold">
                              {item.user.firstname} {item.user.lastname}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="body2" color="text.secondary">
                              {item.commentCount} comments on {item.songsCommentedOn} songs
                            </Typography>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Button
                            size="small"
                            onClick={() => setSelectedUserId(item.user.id)}
                            sx={{ color: '#FFEB3B' }}
                          >
                            View
                          </Button>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Top Songs */}
            <Grid item xs={12} lg={6}>
              <Card>
                <CardHeader
                  title="Most Commented Songs"
                  titleTypographyProps={{ color: 'text.primary', fontWeight: 'bold' }}
                  avatar={<StarIcon sx={{ color: '#FFEB3B' }} />}
                />
                <CardContent>
                  <List>
                    {analysisData.topSongs.slice(0, 5).map((item, index) => (
                      <ListItem key={item.song.songId} divider>
                        <ListItemAvatar>
                          <Badge badgeContent={index + 1} color="primary">
                            <Avatar sx={{ bgcolor: '#FFEB3B', color: '#000000' }}>
                              <MusicNoteIcon />
                            </Avatar>
                          </Badge>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography color="text.primary" fontWeight="bold">
                              {item.song.title}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="body2" color="text.secondary">
                              by {item.song.artist.name} • {item.commentCount} comments from {item.uniqueCommenters} users
                            </Typography>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Button
                            size="small"
                            onClick={() => handleOpenSongModal(item.song.songId)}
                            sx={{ color: '#FFEB3B' }}
                          >
                            View
                          </Button>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Detailed Analysis Tables */}
            {filteredData && (
              <>
                {/* User Comments Table */}
                {selectedUserId && filteredData.userComments.length > 0 && (
                  <Grid item xs={12}>
                    <Card>
                      <CardHeader
                        title={`Comments by ${filteredData.userComments[0]?.user.firstname} ${filteredData.userComments[0]?.user.lastname}`}
                        titleTypographyProps={{ color: 'text.primary', fontWeight: 'bold' }}
                        avatar={<PersonIcon sx={{ color: '#FFEB3B' }} />}
                      />
                      <CardContent>
                        <TableContainer>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>Song</TableCell>
                                <TableCell>Artist</TableCell>
                                <TableCell>Comment</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Actions</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {filteredData.userComments.map((comment) => (
                                <TableRow key={comment.id}>
                                  <TableCell>
                                    <Typography variant="body2" color="text.primary">
                                      {comment.song.title}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2" color="text.secondary">
                                      {comment.song.artist.name}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2" color="text.primary" sx={{ maxWidth: 300 }}>
                                      {comment.content.length > 100 
                                        ? `${comment.content.substring(0, 100)}...` 
                                        : comment.content}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2" color="text.secondary">
                                      {new Date(comment.createdAt).toLocaleDateString()}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <IconButton
                                      onClick={() => handleOpenSongModal(comment.song.songId)}
                                      sx={{ color: '#FFEB3B' }}
                                    >
                                      <VisibilityIcon />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                {/* Song Comments Table */}
                {selectedSongId && filteredData.songComments.length > 0 && (
                  <Grid item xs={12}>
                    <Card>
                      <CardHeader
                        title={`Comments on "${filteredData.songComments[0]?.song.title}"`}
                        titleTypographyProps={{ color: 'text.primary', fontWeight: 'bold' }}
                        avatar={<MusicNoteIcon sx={{ color: '#FFEB3B' }} />}
                      />
                      <CardContent>
                        <TableContainer>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>User</TableCell>
                                <TableCell>Comment</TableCell>
                                <TableCell>Role</TableCell>
                                <TableCell>Date</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {filteredData.songComments.map((comment) => (
                                <TableRow key={comment.id}>
                                  <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Avatar sx={{ bgcolor: '#FFEB3B', color: '#000000', width: 32, height: 32 }}>
                                        {getUserInitials(comment.user)}
                                      </Avatar>
                                      <Box>
                                        <Typography variant="body2" color="text.primary">
                                          {comment.user.firstname} {comment.user.lastname}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {comment.user.email}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2" color="text.primary" sx={{ maxWidth: 300 }}>
                                      {comment.content.length > 100 
                                        ? `${comment.content.substring(0, 100)}...` 
                                        : comment.content}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={comment.user.role.roleName}
                                      size="small"
                                      sx={{ backgroundColor: '#FFEB3B', color: '#000000' }}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2" color="text.secondary">
                                      {new Date(comment.createdAt).toLocaleDateString()}
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                {/* User-Song Intersection */}
                {selectedUserId && selectedSongId && filteredData.userSongComments.length > 0 && (
                  <Grid item xs={12}>
                    <Card>
                      <CardHeader
                        title="User-Song Specific Comments"
                        titleTypographyProps={{ color: 'text.primary', fontWeight: 'bold' }}
                        avatar={<AssessmentIcon sx={{ color: '#FFEB3B' }} />}
                      />
                      <CardContent>
                        <Typography variant="body1" color="text.primary" gutterBottom>
                          Showing {filteredData.userSongComments.length} comments by{' '}
                          {filteredData.userSongComments[0]?.user.firstname} {filteredData.userSongComments[0]?.user.lastname}{' '}
                          on &quot;{filteredData.userSongComments[0]?.song.title}&quot;
                        </Typography>
                        <Divider sx={{ my: 2, borderColor: '#333' }} />
                        <Stack spacing={2}>
                          {filteredData.userSongComments.map((comment) => (
                            <Card key={comment.id} sx={{ backgroundColor: '#000000' }}>
                              <CardContent>
                                <Typography variant="body1" color="text.primary">
                                  {comment.content}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                  {new Date(comment.createdAt).toLocaleString()}
                                </Typography>
                              </CardContent>
                            </Card>
                          ))}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </>
            )}
          </Grid>

          {/* Song Comments Modal */}
          <SongCommentsModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            songId={modalSongId}
            data={commentsData}
          />
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Page;
"use client"
import { useEffect, useState } from "react";

import AdminDashboard from "@/app/components/layout/AdminDashboard";
import CustomSearchField from "@/app/components/common/CustomFields/CustomSearchField";
import {  Box, Button, useMediaQuery, useTheme } from "@mui/material";
import styles from "../../../styles/page.module.css";
import InfoCard from "@/app/components/common/ui/InfoCard";
import { useRouter } from "next/navigation";
import Spinner from "@/app/components/common/spinners/loading";
import MediaPlayer from "@/app/components/common/MediaPlayer/MediaPlayer";
import SongCard from "@/app/components/common/MediaPlayer/SongCard";
import { useSession } from "@/app/context/SessionContext";
import { useSongsContext } from "@/app/context/SongsContext";
import { getUserRole, getUserId } from "@/app/utils/authUtils";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import AddCircleIcon from '@mui/icons-material/AddCircle';



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

export default function Page() {
  const { songs, favoriteSongs, songsLoading, votes, setVotes, commentsData, error } = useSongsContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [userID, setUserID] = useState<number | null>(null);
  const { accessToken } = useSession();
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))


  useEffect(() => {
    if (!accessToken) {
      console.error("No access token available");
      router.push('/login');
      return;
    }

    const userID = getUserId(accessToken);
    const userRole = getUserRole(accessToken);

    setUserID(userID);
    setUserRole(userRole);

  }, [accessToken, router]);

  const onCommentsButtonClick = () => {
    router.push("/admin/songs/comments");
  };

  const handleBackToArtistsClick = () => {
    router.push("/admin/songs/create");
  };

  const filteredSongs = songs.filter((songs) =>
    songs.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSongSelect = (songId: number) => {
    const songIndex = songs.findIndex(song => song.songId === songId);
    if (songIndex !== -1) {
      setCurrentSongIndex(songIndex);
    }
  };

  const handleSongChange = (index: number) => {
    setCurrentSongIndex(index);
  };

  return (
    <ThemeProvider theme={darkYellowTheme}>
      <AdminDashboard>
        <Box className={styles.home} sx={{padding:"0.625rem"}}>
          {/* Top Section */}
          <Box sx={{display:"flex", flexDirection:"column"}}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                position: "sticky",
                top: 0,
                zIndex: 10,
                bgcolor: "background.default",
              }}
            >
                  {/* Top Bar: Title, Search, Button */}
                  {isMobile ? (
                    // Mobile Layout }
                    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 2, pb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ flexGrow: 1 }}>
                          <CustomSearchField
                            placeholder="Search an artist."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </Box>
                        <AddCircleIcon
                          sx={{ color: 'yellow', fontSize: '40px', cursor: 'pointer' }}
                          onClick={() => handleBackToArtistsClick}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'left', gap: 2 }}>
                        <Button 
                          sx={{ 
                            color: "black", 
                            borderRadius: "50px", 
                            backgroundColor: "#F3B007", 
                            textTransform: 'none',
                            "&:hover": { backgroundColor: "#FFEB3B" }
                          }}
                          variant="contained"
                          size="medium"
                          onClick={onCommentsButtonClick}
                        >
                          Read comments
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    // Desktop Layout
                    
                    <Box className={styles.layerTop}>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Box className={styles.layerTopSearch}>
                          <CustomSearchField
                            placeholder="Search a song..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </Box>
                        <Box sx={{ display: "flex",  gap: "1rem" }}>
                          <Button 
                            sx={{ 
                              color: "black", 
                              borderRadius: "50px", 
                              backgroundColor: "#F3B007", 
                              textTransform: 'none',
                              "&:hover": { backgroundColor: "#FFEB3B" }
                            }}
                            variant="contained"
                            size="medium"
                            onClick={onCommentsButtonClick}
                          >
                          Read comments
                          </Button>
                          <Button 
                            sx={{ 
                              color: "black", 
                              borderRadius: "50px", 
                              backgroundColor: "#F3B007", 
                              textTransform: 'none',
                              "&:hover": { backgroundColor: "#FFEB3B" }
                            }}
                            variant="contained"
                            size="medium"
                            onClick={handleBackToArtistsClick}
                          >
                            Add a song
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  )}
                </Box>
      
            { !error && songsLoading && (
              <Spinner />
            )}

            {!error && !songsLoading && filteredSongs.length === 0 ? (
              <Box className={styles.centerYX}>
                <InfoCard
                  title="No songs found"
                  description="Try searching with a different keyword or check back later."
                />
              </Box>
            ) : ( !error && !songsLoading && (
              <Box sx={{ height: "100%", overflow: "hidden", paddingRight: "0px" }}>
                <Box className={styles.gridContainer} sx={{ mt: 3 }}>
                  <SongCard
                    songs={filteredSongs}
                    currentSongIndex={currentSongIndex}
                    votes={votes}
                    setVotes={setVotes}
                    commentsData={commentsData}
                    handleSongSelect={handleSongSelect}
                    userRole={userRole ?? undefined}
                    adminMode={true} 
                  />
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
        {filteredSongs.length > 0 && userID && userRole && (
        <MediaPlayer 
            songs={filteredSongs} 
            favoriteSongs={favoriteSongs}
            currentSongIndex={currentSongIndex}
            onSongChange={handleSongChange}
            userID={userID}
            userRole={userRole}
          />
        )}
      </AdminDashboard>
    </ThemeProvider>
  );
}

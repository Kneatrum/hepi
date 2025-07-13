"use client"
import { useEffect, useState } from "react";
import CustomSearchField from "./components/common/CustomFields/CustomSearchField";
import Dashboard from "./components/layout/Dashboard";
import styles from "./styles/page.module.css";
import { Box } from "@mui/material";
import MediaPlayer from "./components/common/MediaPlayer/MediaPlayer";
import InfoCard from "./components/common/ui/InfoCard";
import Spinner from "./components/common/spinners/loading";
import SongCard from "./components/common/MediaPlayer/SongCard";
import { useSession } from "@/app/context/SessionContext";
import { useSongsContext } from "@/app/context/SongsContext";
import { getUserRole, getUserId } from "./utils/authUtils";
import { createTheme, ThemeProvider } from '@mui/material/styles';

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
  const { songs, songsLoading, votes, setVotes, error, favoriteSongs } = useSongsContext();
  const [ searchQuery, setSearchQuery ] = useState("");
  const [ currentSongIndex, setCurrentSongIndex] = useState(0);
  const { isAuthenticated, accessToken } = useSession();
  const [ userID, setUserID ] = useState<number | null>(null);
  const [ userRole, setUserRole ] = useState<string | null>(null);





  useEffect(() => {
    if (isAuthenticated && accessToken) {
      const userID = getUserId(accessToken);
      const userRole = getUserRole(accessToken);
      setUserID(userID);
      setUserRole(userRole);
    }

  }, [isAuthenticated, accessToken]);
  

  const filteredSongs = songs.filter((song) =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

 // Function to handle song selection from the list
  const handleSongSelect = (songId: number) => {
    const songIndex = songs.findIndex(song => song.songId === songId);
    if (songIndex !== -1) {
      setCurrentSongIndex(songIndex);
    }
  };

  // Function to handle song changes from the media player
  const handleSongChange = (index: number) => {
    setCurrentSongIndex(index);
  };

  return (
    <ThemeProvider theme={darkYellowTheme}>
      <Dashboard>
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
              <Box className={styles.layerTop} >
                <CustomSearchField
                  placeholder="Search a song..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </Box>
            </Box>

            { !error && songsLoading && (
              <Spinner />
            )}

            { !error && !songsLoading && filteredSongs.length === 0 ? (
              <Box className={styles.centerYX}>
                <InfoCard
                  title="No songs found"
                  description="Try searching with a different keyword or check back later."
                />
              </Box>
            ) : ( !error && !songsLoading && (
              <Box sx={{ height: "100%", overflow: "hidden", paddingRight: "0px"}}>
                <Box className={styles.gridContainer} sx={{ mt: 3 }}>
                  <SongCard
                    currentSongIndex={currentSongIndex}
                    songs={filteredSongs}
                    votes={votes}
                    setVotes={setVotes}
                    commentsData={null}
                    handleSongSelect={handleSongSelect}
                    userRole={userRole ?? undefined}
                    adminMode={false}
                  />
                </Box>
              </Box>
              ))}
          </Box>
        </Box>
        {filteredSongs.length > 0  && (
        <MediaPlayer 
            songs={filteredSongs} 
            favoriteSongs={favoriteSongs}
            votes={votes}
            setVotes={setVotes}
            currentSongIndex={currentSongIndex}
            onSongChange={handleSongChange}
            userID={userID}
            // userRole={userRole}
          />
        )}
      </Dashboard>
    </ThemeProvider>
  );
}

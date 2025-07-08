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


export default function Page() {
  const { songs, songsLoading, votes, setVotes, error, favoriteSongs } = useSongsContext();
  const [ searchQuery, setSearchQuery ] = useState("");
  const [ currentSongIndex, setCurrentSongIndex] = useState(0);
  const { accessToken } = useSession();
  const [ userID, setUserID ] = useState<number | null>(null);
  const [ userRole, setUserRole ] = useState<string | null>(null);





  useEffect(() => {
    if (!accessToken) {
      console.error("No access token available");
      return;
    }

    const userID = getUserId(accessToken);
    const userRole = getUserRole(accessToken);

    setUserID(userID);
    setUserRole(userRole);

  }, [accessToken]);
  

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
    <Dashboard>
      <Box className={styles.home} sx={{padding:"0px"}}>
        {/* Top Section */}
        <Box sx={{display:"flex", flexDirection:"column", gap:"20px"}}>
          <Box className={styles.layer}>
            <Box className={styles.layerTop} sx={{ width: "30%"}}>
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
    </Dashboard>
  );
}

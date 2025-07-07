"use client"
import { useEffect, useState } from "react";

import AdminDashboard from "@/app/components/layout/AdminDashboard";
import CustomSearchField from "@/app/components/common/CustomFields/CustomSearchField";
import {  Box, Button } from "@mui/material";
import styles from "../../../styles/page.module.css";
import InfoCard from "@/app/components/common/ui/InfoCard";
import { useRouter } from "next/navigation";
import Spinner from "@/app/components/common/spinners/loading";
import MediaPlayer from "@/app/components/common/MediaPlayer/MediaPlayer";
import SongCard from "@/app/components/common/MediaPlayer/SongCard";
import { useSession } from "@/app/context/SessionContext";
import { useSongsContext } from "@/app/context/SongsContext";
import { getUserRole, getUserId } from "@/app/utils/authUtils";


export default function Page() {
  const { songs, songsLoading, votes, setVotes, commentsData, error } = useSongsContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [userID, setUserID] = useState<number | null>(null);
  const { accessToken } = useSession();
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();


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
    <AdminDashboard>
      <Box className={styles.home} sx={{padding:"0px"}}>
        {/* Top Section */}
        <Box sx={{display:"flex", flexDirection:"column",gap:"20px"}}>
              <Box className={styles.layer}>
                <Box className={styles.layerTop}>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Box className={styles.layerTopSearch}>
                      <CustomSearchField
                        placeholder="Search a song..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </Box>
                    <Box sx={{ display: "flex", paddingRight: "20px", gap: "20px" }}>
                      <Button 
                        className="callToActionButton"
                        onClick={onCommentsButtonClick}
                      >
                      Comments
                      </Button>
                      <Button 
                        className="callToActionButton"
                        onClick={handleBackToArtistsClick}
                      >
                      Add a song
                      </Button>
                    </Box>
                  </Box>
                 
                  
                </Box>
                
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
          currentSongIndex={currentSongIndex}
          onSongChange={handleSongChange}
          userID={userID}
          userRole={userRole}
        />
      )}
    </AdminDashboard>
  );
}

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
import { getUserRole, getUserId } from "@/app/utils/authUtils";
import { ParsedSong } from "@/app/utils/fetchSongsUtils";
import { fetchAllSongsParallel } from "@/app/utils/fetchSongsUtils";
import { fetchAllVotesPaginated } from "@/app/utils/fetchVotesUtils";
import { VotesState } from "@/app/utils/fetchVotesUtils";

import { PaginationOptions } from "@/app/utils/fetchVotesUtils";

const songsApiUrl = "https://music-backend-production-99a.up.railway.app/api/v1/songs";
const votesApiUrl = 'https://music-backend-production-99a.up.railway.app/api/v1/votes';


export default function Page() {
  const [allSongs, setAllSongs] = useState<ParsedSong[]>([]);
  const [votes, setVotes] = useState<VotesState>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
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



  useEffect(() => {
      const fetchVotes = async () => {
        // setLoading(true);
  
        if (!accessToken) {
          console.error("No access token available");
          // setLoading(false);
          // router.push('/login');
          return;
        }
  
        const options: PaginationOptions = {
          baseUrl: votesApiUrl,
          pageSize: 20, // Adjust based on your API's optimal page size
          maxConcurrentRequests: 3, // Limit concurrent requests
          headers: accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {},
          queryParams: {
            // Add any additional query parameters here
            // sortBy: 'createdAt',
            // order: 'desc'
          }
        };
  
      
        try {
          const result = await fetchAllVotesPaginated(options);
          
          setVotes(result.votesMap);
          console.log(`Loaded ${result.totalElements} votes across ${result.totalPages} pages`);
        } catch (err) {
          // setError(err instanceof Error ? err.message : 'Failed to fetch votes');
          console.error('Error fetching votes:', err);
        } finally {
          // setLoading(false);
        }
        
      };
  
      fetchVotes();
    }, [ accessToken, router]);
  


  // Fetch songs on component mount
  useEffect(() => {
    async function fetchSongs() {
      try {
        setLoading(true);

        if (!accessToken) {
          console.error("No access token available");
          // setLoading(false);
          // router.push('/login');
          return;
        }

        const result = await fetchAllSongsParallel({
          baseUrl: songsApiUrl,
          pageSize: 20,
          maxConcurrentRequests: 5,
          requestHeaders: {
            'Authorization': 'Bearer ' + accessToken
          },
          queryParams: {
            'sort': 'title'
          }
        });

        if (result.error) {
          console.error("Error fetching songs:", result.error);
        } else {
          console.log(`Loaded ${result.data.length} songs`);
          setAllSongs(result.data);
           setLoading(false);
        }

      } catch (error) {
        console.error("Failed to fetch songs:", error);
      } finally {
        setLoading(false);
      }
    }
  
    fetchSongs();
  }, [accessToken, router]);


  
  const handleBackToArtistsClick = () => {
    router.push("/admin/songs/create");
  };

  const filteredSongs = allSongs.filter((songs) =>
    songs.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSongSelect = (songId: number) => {
    const songIndex = allSongs.findIndex(song => song.songId === songId);
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
                    <Box sx={{ paddingRight: "20px" }}>
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
    
          { loading && (
            <Spinner />
          )}

          {!loading && filteredSongs.length === 0 ? (
            <Box className={styles.centerYX}>
              <InfoCard
                title="No songs found"
                description="Try searching with a different keyword or check back later."
              />
            </Box>
          ) : ( !loading && (
            <Box sx={{ height: "100%", overflow: "hidden", paddingRight: "0px" }}>
              <Box className={styles.gridContainer} sx={{ mt: 3 }}>
                <SongCard
                  songs={filteredSongs}
                  currentSongIndex={currentSongIndex}
                  votes={votes}
                  setVotes={setVotes}
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

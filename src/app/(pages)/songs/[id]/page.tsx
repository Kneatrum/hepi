"use client";
import { useEffect, useState } from "react";
import Dashboard from "@/app/components/layout/Dashboard";
import styles from "../../../styles/page.module.css";
import { Box, Card, CardContent, Grid, Typography } from "@mui/material";
// import MediaPlayer from "@/app/components/common/MediaPlayer/MediaPlayer";
import Link from "next/link";
import Image from "next/image";
import CustomSearchField from "@/app/components/common/CustomFields/CustomSearchField";
import MusicListItem from "@/app/components/pages/songs/MusicListItem";
import { Song } from "@/app/types";
import InfoCard from "@/app/components/common/ui/InfoCard";

import { useParams } from "next/navigation";
import Spinner from "@/app/components/common/spinners/loading";



export default function Page() {
  const [currentSongId, setCurrentSongId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const params = useParams();
  const id = params.id as string;
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);

  const allSongs:Song[] = [ ];
  

  useEffect(() => {
    async function fetchSong() {
      try {
        const res = await fetch(`https://music-backend-production-99a.up.railway.app/api/v1/songs/${id}`);
        if (!res.ok) throw new Error("Failed to fetch song");
        const data = await res.json();
        setSong(data);
      } catch (error) {
        console.error(error);
        setSong(null);
      } finally {
        setLoading(false);
      }
    }

    fetchSong();
  }, [id]);


  if (loading) {
    return (
      <Dashboard>
        <Box className={styles.home}>
          <Box className={styles.centerYX}>
            <Spinner />
          </Box>
        </Box>
      </Dashboard>
    );
  }

  if (!song) {
    return (
      <Dashboard>
        <Box className={styles.home}>
          <Box className={styles.centerYX}>
            <InfoCard
              title="No songs found"
              description="Try searching with a different keyword or check back later."
            />
          </Box>
        </Box>
      </Dashboard>
    );
  }



  const handlePlayPause = (songId:string) => {
    setCurrentSongId((prevSongId) => (prevSongId === songId ? null : songId));
  };

  const filteredSongs = allSongs.filter((song) =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentSong = song;

  return (
    <Dashboard>
      <Box className={styles.home} sx={{padding:"0px"}}>
        { loading ? (
          <Spinner />
        ) : (
          <>
            <Grid container spacing={2}>
              {/* Left Section */}
              <Grid item xs={12} md={8}>
                <Card className={styles.songCardLeft}>
                  <CardContent className={styles.songCardContent}>
                    <Box className={styles.songCardContentHero}>
                      <Typography className={styles.songIntro}>
                        Listening to{" "}
                        <Typography component="span" className={styles.songTitle}>
                          {currentSong ? currentSong.title : "Smooth Song"}
                        </Typography>
                      </Typography>
                    </Box>
                    <Box className={styles.songCardContentHero}>
                      <Link href={`/artists/${currentSong?.artist.artistId || "default"}`} passHref>
                        <Typography className={styles.songIntro}>
                          {currentSong ? currentSong.artist.name : "Artist Name"}
                        </Typography>
                      </Link>
                    </Box>
                  </CardContent>
                </Card>

                {/* Search & Suggested Songs */}
                <Box className={styles.gridContainer} sx={{ mt: 3 }}>
                  {filteredSongs.length > 0 ? (
                    <Box  sx={{ mt: 3 , mb:3}}>
                      <Typography color="white" sx={{ mt: 3 , mb:3}}>Suggested Songs</Typography>
                      <Box className={styles.layerTopSearch}>
                        <CustomSearchField
                          placeholder="Search a song..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </Box>
                    </Box>
                
                  ) : (
                    <Box className={styles.centerYX}>
                      <InfoCard
                            title="No songs found"
                            description="Try searching with a different keyword or check back later."
                        />
                    </Box>
                  )}
                  <Grid container spacing={3} sx={{ height: "600px", overflowY: "auto", paddingRight: "10px" }}>
                    {filteredSongs.length > 0 && (
                      filteredSongs.map((song) => (
                        <Grid item xs={6} sm={4} md={3} key={song.songId}>
                          <Link href={`/songs/${song.songId}`} passHref>
                            <Box className={styles.songCard}>
                              <Box sx={{ borderRadius: "8px", overflow: "hidden", height: "auto" }}>
                                <Image
                                  src={song.thumbnailPath}
                                  alt={song.title}
                                  width={200}
                                  height={210}
                                  layout="responsive"
                                  objectFit="cover"
                                />
                              </Box>
                              <Typography sx={{ mt: 1, fontWeight: "bold", color: "#fff", textAlign: "center" }}>
                                {song.title}
                              </Typography>
                            </Box>
                          </Link>
                        </Grid>
                      ))
                    )}
                  </Grid>
                </Box>
              </Grid>

              {/* Right Section */}
              <Grid item xs={12} md={4}>
                <Card className={styles.songCardRight}>
                  <CardContent className={styles.songCardContentRight}>
                    <Box className={styles.songMusicCard}>
                      <Typography className={styles.songMusicBoxTitle}>Music List</Typography>
                      <Link href="/" passHref>
                        <Typography className={styles.songMusicSeeMore}>See All</Typography>
                      </Link>
                    </Box>
                    <Box className={styles.musicListCard}>
                      
                      {filteredSongs.map((song) => (
                        <MusicListItem
                          key={song.songId}
                          id={`${song.songId}`}
                          song={song}
                          isPlaying={currentSongId === `${song.songId}`}
                          onPlay={handlePlayPause}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            {/* <MediaPlayer song={song} /> */}
          </>
        )}
        
      </Box>
    </Dashboard>
  );
}

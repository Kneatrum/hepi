"use client";
import { useState, useEffect, useRef } from "react";
import { useSession } from "@/app/context/SessionContext";
import { Box, Typography, IconButton, Slider, Snackbar, Alert } from "@mui/material";
import Image from "next/image";
import styles from "../../../styles/page.module.css";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import InsertCommentIcon from '@mui/icons-material/InsertComment';
import ShareIcon from '@mui/icons-material/Share';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import SkipPreviousOutlinedIcon from "@mui/icons-material/SkipPreviousOutlined";
import SkipNextOutlinedIcon from "@mui/icons-material/SkipNextOutlined";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import PauseOutlinedIcon from "@mui/icons-material/PauseOutlined";
import VolumeUpOutlinedIcon from "@mui/icons-material/VolumeUpOutlined";
import VolumeOffOutlinedIcon from "@mui/icons-material/VolumeOffOutlined";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import ReplayIcon from "@mui/icons-material/Replay";
import { Comment } from "@/app/types";
import CommentDialog from "@/app/components/common/CustomFields/CustomCommentDialog";
import { ParsedSong } from "@/app/utils/fetchSongsUtils";

const votesUrl = "https://music-backend-production-99a.up.railway.app/api/v1/votes";

interface MediaPlayerProps {
  songs: ParsedSong[];
  currentSongIndex: number;
  onSongChange: (index: number) => void;
  userID: number | null;
  userRole: string | null;
}

export default function MediaPlayer({ 
  songs, 
  currentSongIndex,
  onSongChange,
  userID,
  userRole,
}: MediaPlayerProps) {
  const { accessToken } = useSession();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(50);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [likedSongs, setLikedSongs] = useState<Set<number>>(new Set());
  const [upVotedSongs, setUpVotedSongs] = useState<Set<number>>(new Set());
  const [downVotedSongs, setDownVotedSongs] = useState<Set<number>>(new Set());
  const [shuffleHistory, setShuffleHistory] = useState<number[]>([]);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false); 
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "info" | "warning">("info");

  
  // State to track if the target playback duration message has been logged for the current song
  const [hasLoggedTargetPlayback, setHasLoggedTargetPlayback] = useState(false);

  const showSnackbar = (message: string, severity: typeof snackbarSeverity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };



  type User = {
    id: number;
    email: string;
  };

  type QueryResult = {
    content: User[];
  };



  // Fetch liked songs from backend
  // useEffect(() => {
  //   const fetchLikedSongs = async () => {
  //     try {
  //       const url = `${favouritesUrl}/${userId}`;
  //       const response = await fetch(url);
  //       if (!response.ok) {
  //         throw new Error(`HTTP error! status: ${response.status}`);
  //       }

  //       const data = await response.json();
  //       const content = data?.content || [];

  //       const likedIds = new Set<number>(
  //         content
  //           .map((item: any) => item.song?.songId)
  //           .filter((id: number | undefined) => id !== undefined)
  //       );

  //       setLikedSongs(likedIds);
  //     } catch (error) {
  //       console.error("Failed to fetch liked songs:", error);
  //     }
  //   };

  //   fetchLikedSongs();
  // }, []);


  // Fetch user votes from backend
  useEffect(() => {
    if (!accessToken || !userID) return;
    const fetchUserVotes = async () => {
      try {
        const res = await fetch(votesUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!res.ok) {
          const errorBody = await res.json();
          throw new Error(errorBody?.message || "Failed to fetch votes.");
        }

        const result = await res.json();
        const votes = result?.data?.content || [];

        const upVotes = new Set<number>();
        const downVotes = new Set<number>();

        for (const vote of votes) {
          const songId = vote.song?.songId;
          if (!songId) continue;

          if (vote.voteType === "UPVOTE") {
            upVotes.add(songId);
          } else if (vote.voteType === "DOWNVOTE") {
            downVotes.add(songId);
          }
        }

        setUpVotedSongs(upVotes);
        setDownVotedSongs(downVotes);
        showSnackbar("Vote data loaded.", "success");
      } catch (err: any) {
        console.error("Error loading votes:", err);
        showSnackbar(`Failed to load votes: ${err.message}`, "error");
      }
    };

    fetchUserVotes();
    console.log("User ID", userID)
    console.log("User role", userRole)
  }, [accessToken]);



  const handleToggleUpVote = async () => {
  if (!currentSong || !userID || !accessToken) return;
  const songId = currentSong.songId;
  const isUpVoted = upVotedSongs.has(songId);

  const newUpVotes = new Set(upVotedSongs);
  const newDownVotes = new Set(downVotedSongs);

  try {
    if (isUpVoted) {
      newUpVotes.delete(songId);
      showSnackbar("Removed upvote.", "info");
    } else {
      const res = await fetch(votesUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          voteType: "UPVOTE",
          songId,
          userID,
        }),
      });

      if (!res.ok) {
        const errorBody = await res.json();
        throw new Error(errorBody?.message || "Failed to upvote.");
      }

      showSnackbar("Song upvoted!", "success");

      newUpVotes.add(songId);
      newDownVotes.delete(songId); 
    }

    setUpVotedSongs(newUpVotes);
    setDownVotedSongs(newDownVotes);
  } catch (error: any) {
    showSnackbar(`Error: ${error.message}`, "error");
    console.error("Upvote error:", error);
  }
};

const handleToggleDownVote = async () => {
  if (!currentSong || !userID || !accessToken) return;
  const songId = currentSong.songId;
  const isDownVoted = downVotedSongs.has(songId);

  const newDownVotes = new Set(downVotedSongs);
  const newUpVotes = new Set(upVotedSongs);

  try {
    if (isDownVoted) {
      newDownVotes.delete(songId);
      showSnackbar("Removed upvote.", "info");
    } else {
      const res = await fetch(votesUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          voteType: "DOWNVOTE",
          songId,
          userID,
        }),
      });

      if (!res.ok) {
        const errorBody = await res.json();
        throw new Error(errorBody?.message || "Failed to upvote.");
      }

      showSnackbar("Song Downvoted!", "success");

      newDownVotes.add(songId);
      newUpVotes.delete(songId); 
    }

    setDownVotedSongs(newDownVotes);
    setUpVotedSongs(newUpVotes);
  } catch (error) {
    console.error("Failed to downvote:", error);
  }
};


  // Function to interact with a song (like, upvote, downvote, etc.)
  // This function can be used for any interaction type
  // e.g. "play", "share" etc.
const interactWithSong = async (songId: number, type: string) => {
  try {
    const response = await fetch(
      `https://music-backend-production-99a.up.railway.app/api/v1/songs/${songId}/interact?type=${encodeURIComponent(type)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: accessToken ? `Bearer ${accessToken}` : "",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Check if there's a response body to parse
    const contentLength = response.headers.get("Content-Length");
    if (contentLength && parseInt(contentLength) > 0) {
      const data = await response.json();
      console.log("Interaction successful:", data);
    } else {
      console.log("Interaction successful: No response body");
    }
  } catch (error) {
    console.error("Failed to interact with song:", error);
  }
};



  // Get current song
  const currentSong = songs[currentSongIndex] || null;
  const currentAudioUrl = currentSong?.filePath || "";

  // Initialize audio element and handle song changes
  useEffect(() => {
    if (audioRef.current && currentAudioUrl) {
      const wasPlaying = isPlaying;
      audioRef.current.src = currentAudioUrl;
      audioRef.current.volume = volume / 100;
      
      // Reset progress when changing songs
      setProgress(0);
      setDuration(0);
      setIsLoading(true);
      
      // If music was playing, continue playing the new song
      if (wasPlaying) {
        audioRef.current.play().catch(console.error);
      }
    }
  }, [currentSongIndex, currentAudioUrl]);





  // Reset playback log flag when song changes
  useEffect(() => {
    setHasLoggedTargetPlayback(false);
  }, [currentSongIndex]);

  /**
   * Monitors song playback duration and logs a message when a target percentage is reached.
   * This function is called during the 'timeupdate' event of the audio player.
   * @param currentTime - The current playback time of the song in seconds.
   * @param totalDuration - The total duration of the song in seconds.
   * @param targetPercentage - The target duration percentage (0-100) to monitor.
   * @param songTitle - The title of the current song.
   */
  const monitorPlaybackDurationTarget = (
    currentTime: number,
    totalDuration: number,
    targetPercentage: number,
    songTitle: string
  ) => {
    if (totalDuration > 0 && !hasLoggedTargetPlayback) {
      const targetTime = (targetPercentage / 100) * totalDuration;
      if (currentTime >= targetTime) {
        console.log(`Song "${songTitle}" with id "${currentSong?.songId}" has reached ${targetPercentage}% of its duration.`);
        setHasLoggedTargetPlayback(true); 
        interactWithSong(songs[currentSongIndex]?.songId, "play");
      }
    }
  };



  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(Math.floor(audio.duration) || 0);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      if (!isNaN(audio.currentTime)) {
        const newProgress = Math.floor(audio.currentTime);
        setProgress(newProgress);

        // Monitor playback duration target
        if (currentSong && duration > 0) {
          const TARGET_DURATION_PERCENTAGE = 2; // Example: Log when 2% of the song is played
          monitorPlaybackDurationTarget(
            audio.currentTime, // Use precise current time for the check
            duration,
            TARGET_DURATION_PERCENTAGE,
            currentSong.title
          );
        }
      }
    };

    const handleEnded = () => {
      if (isRepeating) {
        audio.currentTime = 0;
        audio.play().catch(console.error);
      } else {
        // Auto-play next song if available
        playNextSong();
      }
    };

    const handleLoadStart = () => {
      setIsLoading(true);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    const handleError = (e: Event) => {
      setIsLoading(false);
      setIsPlaying(false);
      console.error("Audio loading error:", e);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [
    isRepeating, 
    currentSong, 
    duration, // Add duration as a dependency, as it's used in handleTimeUpdate
    hasLoggedTargetPlayback // Add to re-define handleTimeUpdate if this state changes, ensuring it captures the latest value
  ]);


  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio || !currentAudioUrl) return;

    try {
      if (isPlaying) {
        audio.pause();
      } else {
        await audio.play();
      }
    } catch (error) {
      console.error("Playback error:", error);
      setIsPlaying(false);
    }
  };

  const handleProgressChange = (_: Event, value: number | number[]) => {
    const newProgress = value as number;
    setProgress(newProgress);
    if (audioRef.current) {
      audioRef.current.currentTime = newProgress;
    }
  };

  const handleVolumeChange = (_: Event, value: number | number[]) => {
    const newVolume = value as number;
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  const getNextSongIndex = () => {
    if (songs.length <= 1) return currentSongIndex;
    
    if (isShuffling) {
      // Get random song index different from current
      const availableIndices = songs.map((_, index) => index)
        .filter(index => index !== currentSongIndex);
      
      if (availableIndices.length === 0) return currentSongIndex;
      
      const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      return randomIndex;
    } else {
      // Get next song in order, loop to beginning if at end
      return (currentSongIndex + 1) % songs.length;
    }
  };

  const getPreviousSongIndex = () => {
    if (songs.length <= 1) return currentSongIndex;
    
    if (isShuffling) {
      // For shuffle, go back in shuffle history if available
      if (shuffleHistory.length > 0) {
        const prevIndex = shuffleHistory[shuffleHistory.length - 1];
        setShuffleHistory(prev => prev.slice(0, -1));
        return prevIndex;
      } else {
        // If no history, get random song
        const availableIndices = songs.map((_, index) => index)
          .filter(index => index !== currentSongIndex);
        
        if (availableIndices.length === 0) return currentSongIndex;
        
        const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
        return randomIndex;
      }
    } else {
      // Get previous song in order, loop to end if at beginning
      return currentSongIndex === 0 ? songs.length - 1 : currentSongIndex - 1;
    }
  };

  const playNextSong = () => {
    if (songs.length <= 1) return;
    
    // Add current song to shuffle history
    if (isShuffling) {
      setShuffleHistory(prev => [...prev, currentSongIndex]);
    }
    
    const nextIndex = getNextSongIndex();
    onSongChange(nextIndex);
  };

  const playPreviousSong = () => {
    if (songs.length <= 1) return;
    
    const prevIndex = getPreviousSongIndex();
    onSongChange(prevIndex);
  };

  const skipPrevious = () => {
    if (audioRef.current && audioRef.current.currentTime > 3) {
      // If more than 3 seconds into the song, restart current song
      audioRef.current.currentTime = 0;
      setProgress(0);
    } else {
      // Otherwise, go to previous song
      playPreviousSong();
    }
  };

  const skipNext = () => {
    playNextSong();
  };

  const toggleMute = () => {
    if (volume === 0) {
      setVolume(50);
      if (audioRef.current) {
        audioRef.current.volume = 0.5;
      }
    } else {
      setVolume(0);
      if (audioRef.current) {
        audioRef.current.volume = 0;
      }
    }
  };

  const toggleLike = () => {
    if (!currentSong) return;

    if (!userID) {
      console.error("User ID is not set. Cannot add to favorites.");
      return;
    }

    if (!accessToken) {
      console.error("Access token is not set. Cannot add to favorites.");
      return;
    }

    const isCurrentlyLiked = likedSongs.has(currentSong.songId);
    const newLikedSongs = new Set(likedSongs);

    if (isCurrentlyLiked) {
      newLikedSongs.delete(currentSong.songId);
    } else {
      newLikedSongs.add(currentSong.songId);
    }

    // Update frontend state
    setLikedSongs(newLikedSongs);

    // Sync with backend
    toggleFavorite(userID, currentSong.songId, isCurrentlyLiked, accessToken);
};


  const toggleShuffle = () => {
    setIsShuffling(!isShuffling);
    // Clear shuffle history when toggling
    setShuffleHistory([]);
  };

  const toggleRepeat = () => {
    setIsRepeating(!isRepeating);
  };

  // Add comment dialog handlers
  const handleOpenCommentDialog = () => {
    setCommentDialogOpen(true);
  };

  const handleCloseCommentDialog = () => {
    setCommentDialogOpen(false);
  };

  const handleSubmitComment = async (comment: string) => {
    if (!userID) {
      return console.error("User ID is not set. Cannot submit comment.");
    }

    if (!comment.trim()) {
      return console.warn("Comment is empty. Submission aborted.");
    }

    const commentData: Comment = {
      id: 0, 
      songId: currentSong?.songId || 0,
      userId: userID,
      content: comment.trim(),
      createdAt: new Date().toISOString(),
    };

    

    try {
      const response = await fetch(
        "https://music-backend-production-99a.up.railway.app/api/v1/comments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: accessToken ? `Bearer ${accessToken}` : "",
          },
          body: JSON.stringify(commentData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        console.log("Comment successfully submitted!");
      } else {
        console.error(data.message || "Comment submission failed.");
      }
    } catch (err) {
      console.error("Error submitting comment:", err);
    }
  };



  // Function that communicates with the backend
  const toggleFavorite = async (
    userId: number,
    songId: number,
    isFavorite: boolean,
    accessToken: string
  ) => {
    const url = `https://music-backend-production-99a.up.railway.app/api/v1/favorites/${userId}/${songId}`;

    try {  
      const response = await fetch(url, {
        method: isFavorite ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.text();

      if (response.ok) {
        console.log(`${isFavorite ? "Removed from" : "Added to"} favorites:`, data);
      } else {
        console.error("Favorite toggle failed:", data);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };




  // Format time helper
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <Box className={styles.mediaPlayer}>
      {/* Hidden audio element */}
      <audio ref={audioRef} preload="metadata" />
      
      {/* Only render if we have songs */}
      {songs.length === 0 ? (
        <Box className={styles.mediaPlayerBox}>
          <Typography sx={{ color: "white", textAlign: "center" }}>
            No songs available
          </Typography>
        </Box>
      ) : (
        <Box className={styles.mediaPlayerBox}>
          {/* Album Cover & Song Info */}
          <Box className={styles.mediaPlayerAlbum}>
            <Image
              src={"/images/album.jpeg"}
              alt={currentSong?.title || "Album cover"}
              width={60}
              height={60}
              style={{ objectFit: "cover", borderRadius: "4px" }}
            />
            <Box sx={{ flex: 1, minWidth: 0, mx: 1 }}>
              <Typography className={styles.songTitle} noWrap>
                {currentSong?.title || "No Title"}
              </Typography>
              <Typography className={styles.artistName} noWrap>
                {currentSong?.artistName || "Unknown Artist"}
              </Typography>
              {/* <Typography variant="subtitle2" sx={{ color: "#ccc" }} noWrap>
                {"Tribe: Kikuyu"}
              </Typography> */}
              {/* <Typography variant="caption" sx={{ color: "#aaa" }} noWrap>
                {currentSong?.genre?.name || "Unknown Genre"}
              </Typography> */}
            </Box>
            
          </Box>

          {/* Playback Controls */}
          <Box className={styles.mediaPlayerControls}>
            <IconButton 
              onClick={skipPrevious} 
              disabled={isLoading}
              sx={{ opacity: songs.length <= 1 ? 0.5 : 1 }}
            >
              <SkipPreviousOutlinedIcon sx={{ color: isLoading ? "#555" : "white" }} />
            </IconButton>
            <IconButton 
              onClick={togglePlayPause} 
              disabled={isLoading || !currentAudioUrl}
              sx={{ 
                backgroundColor: "rgba(255,255,255,0.1)",
                "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" }
              }}
            >
              {isLoading ? (
                <Typography variant="caption" sx={{ color: "white" }}>...</Typography>
              ) : isPlaying ? (
                <PauseOutlinedIcon sx={{ color: "white" }} />
              ) : (
                <PlayArrowOutlinedIcon sx={{ color: "white" }} />
              )}
            </IconButton>
            <IconButton 
              onClick={skipNext} 
              disabled={isLoading}
              sx={{ opacity: songs.length <= 1 ? 0.5 : 1 }}
            >
              <SkipNextOutlinedIcon sx={{ color: isLoading ? "#555" : "white" }} />
            </IconButton>
          </Box>

          {/* Media Progress Bar */}
          <Box className={styles.mediaPlayerProgressBar}>
            <Typography variant="caption" sx={{ minWidth: "40px", textAlign: "center", display: { xs: 'none', md: 'block' }, }}>
              {formatTime(progress)}
            </Typography>
            <Slider
              value={progress}
              min={0}
              max={duration || 1}
              onChange={handleProgressChange}
              disabled={isLoading || duration === 0}
              sx={{
                minWidth: "50%",
                color: "white",
                mx: 2,
                '& .MuiSlider-thumb': { color: "white" },
                '& .MuiSlider-track': { color: "white" },
                '& .MuiSlider-rail': { color: "#555" },
              }}
            />
            <Typography variant="caption" sx={{ minWidth: "40px", textAlign: "center", display: { xs: 'none', md: 'block' } }}>
              {formatTime(duration)}
            </Typography>
          </Box>

          {/* Volume, Shuffle & Repeat Controls */}
          <Box className={styles.mediaPlayerExtras} gap={1} >
            <IconButton onClick={toggleMute}>
              {volume === 0 ? (
                <VolumeOffOutlinedIcon sx={{ color: "white" }} />
              ) : (
                <VolumeUpOutlinedIcon sx={{ color: "white" }} />
              )}
            </IconButton>

            <Slider
              value={volume}
              min={0}
              max={100}
              onChange={handleVolumeChange}
              sx={{
                width: "100px",
                color: "white",
                '& .MuiSlider-thumb': { color: "white" },
                '& .MuiSlider-track': { color: "white" },
                '& .MuiSlider-rail': { color: "#555" },
              }}
            />

            <IconButton onClick={toggleLike}>
              {likedSongs.has(currentSong?.songId || 0) ? (
                <FavoriteIcon sx={{ color: "red" }} />
              ) : (
                <FavoriteBorderIcon sx={{ color: "white" }} />
              )}
            </IconButton>

            <IconButton 
              onClick={toggleShuffle}
              disabled={songs.length <= 1}
              sx={{ opacity: songs.length <= 1 ? 0.5 : 1 }}
            >
              <ShuffleIcon sx={{ color: isShuffling ? "#1db954" : "white" }} />
            </IconButton>

            <IconButton onClick={toggleRepeat}>
              <ReplayIcon sx={{ color: isRepeating ? "#1db954" : "white" }} />
            </IconButton>

            <IconButton
              onClick={handleOpenCommentDialog}
              sx={{ ml: "auto", color: "gray" }}
            >
              <InsertCommentIcon sx={{ color: "gray" }} />
            </IconButton>

            <IconButton>
              <ShareIcon sx={{ color: "gray" }} /> 
            </IconButton>

            {/* 👍 Upvote */}
            <IconButton onClick={handleToggleUpVote}>
              {currentSong && upVotedSongs.has(currentSong.songId) ? (
                <ThumbUpIcon sx={{ color: "#1db954" }} />
              ) : (
                <ThumbUpOffAltIcon sx={{ color: "gray" }} />
              )}
            </IconButton>

            {/* 👎 Downvote */}
            <IconButton onClick={handleToggleDownVote}>
              {currentSong && downVotedSongs.has(currentSong.songId) ? (
                <ThumbDownAltIcon sx={{ color: "#e53935" }} />
              ) : (
                <ThumbDownOffAltIcon sx={{ color: "gray" }} />
              )}
            </IconButton>
        </Box>


          {/* Playlist info and stats */}
          {/* {songs.length > 1 && (
            <Box sx={{ textAlign: "center", mt: 1 }}>
              <Typography variant="caption" sx={{ color: "#ccc" }}>
                {currentSongIndex + 1} of {songs.length} • {currentSong?.playCount || 0} plays
              </Typography>
            </Box>
          )} */}
        </Box>
      )}

      {/* Comment Dialog */}
      <CommentDialog
        open={commentDialogOpen}
        onClose={handleCloseCommentDialog}
        onSubmit={handleSubmitComment}
      />
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

    </Box>
  );
}
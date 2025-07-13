"use client"
import { useSession } from "@/app/context/SessionContext";
import { useState, useEffect, useRef, useCallback } from "react"
import { Box, Typography, IconButton, Slider, Snackbar, Alert, Collapse } from "@mui/material"
import Image from "next/image"
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder"
import FavoriteIcon from "@mui/icons-material/Favorite"
import InsertCommentIcon from "@mui/icons-material/InsertComment"
import ShareIcon from "@mui/icons-material/Share"
import ThumbUpIcon from "@mui/icons-material/ThumbUp"
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt"
import ThumbDownOffAltIcon from "@mui/icons-material/ThumbDownOffAlt"
import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt"
import SkipPreviousOutlinedIcon from "@mui/icons-material/SkipPreviousOutlined"
import SkipNextOutlinedIcon from "@mui/icons-material/SkipNextOutlined"
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined"
import PauseOutlinedIcon from "@mui/icons-material/PauseOutlined"
import VolumeUpOutlinedIcon from "@mui/icons-material/VolumeUpOutlined"
import VolumeOffOutlinedIcon from "@mui/icons-material/VolumeOffOutlined"
import ShuffleIcon from "@mui/icons-material/Shuffle"
import ReplayIcon from "@mui/icons-material/Replay"
import ExpandLessIcon from "@mui/icons-material/ExpandLess"
import MoreHorizIcon from "@mui/icons-material/MoreHoriz"
import type { Comment } from "@/app/types"
import CommentDialog from "@/app/components/common/CustomFields/CustomCommentDialog"
import type { ParsedSong } from "@/app/utils/fetchSongsUtils"
import { VotesState } from '@/app/utils/fetchVotesUtils';
import AuthDialog from "../dialogs/AuthDialog";
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
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
      paper: '#000000',
    },
    text: {
      primary: '#ffffff',
      secondary: '#FFEB3B',
    },
  },
});



interface MediaPlayerProps {
  songs: ParsedSong[]
  votes: VotesState;
  setVotes: React.Dispatch<React.SetStateAction<VotesState>>;
  favoriteSongs: ParsedSong[]
  currentSongIndex: number
  onSongChange: (index: number) => void
  userID: number | null
  // userRole: string | null
}

interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

export default function MediaPlayer({
  songs,
  votes,
  setVotes,
  favoriteSongs,
  currentSongIndex,
  onSongChange,
  userID,
  // userRole,
}: MediaPlayerProps) {
  const { isAuthenticated, accessToken } = useSession()
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(50)
  const [isShuffling, setIsShuffling] = useState(false)
  const [isRepeating, setIsRepeating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [likedSongIds, setLikedSongIds] = useState<Set<number>>(new Set())
  const [shuffleHistory, setShuffleHistory] = useState<number[]>([])
  const [commentDialogOpen, setCommentDialogOpen] = useState(false)
  const [ showAuthDialog, setShowAuthDialog ] = useState(false);

  // Responsive states
  const [isExtrasExpanded, setIsExtrasExpanded] = useState(false)
  const [isMobileExtrasExpanded, setIsMobileExtrasExpanded] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [notification, setNotification] = useState<NotificationState>({ 
    open: false, 
    message: '', 
    severity: 'success' 
  })

  // Initialize and sync local liked state with the prop from context
  useEffect(() => {
    const initialLikedIds = new Set(favoriteSongs.map((song) => song.songId))
    setLikedSongIds(initialLikedIds)
  }, [favoriteSongs])

  // State to track if the target playback duration message has been logged for the current song
  const [hasLoggedTargetPlayback, setHasLoggedTargetPlayback] = useState(false)


  const showNotification = (message: string, severity: NotificationState['severity'] = 'success'): void => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = (): void => {
    setNotification({ ...notification, open: false });
  };

  const handleVote = async (songId: number, voteType: 'UPVOTE' | 'DOWNVOTE'): Promise<void> => {
    try {
      
      if (!userID || !isAuthenticated){
        setShowAuthDialog(true);
        return;
      }
      const currentVote = votes[songId];
      
      // If clicking the same vote type, remove the vote
      if (currentVote === voteType) {
        // Here you would make an API call to remove the vote
        setVotes(prev => ({
          ...prev,
          [songId]: null
        }));
        showNotification('Vote removed', 'info');
        return;
      }

      // Cast new vote
      const response = await fetch('https://music-backend-production-99a.up.railway.app/api/v1/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          songId: songId,
          userId: userID,
          voteType: voteType
        }),
      });

      if (response.ok) {
        setVotes(prev => ({
          ...prev,
          [songId]: voteType
        }));
        showNotification(`${voteType.toLowerCase()} cast successfully!`, 'success');
      } else {
        showNotification('Error casting vote', 'error');
      }
    } catch (error) {
      console.error('Error voting:', error);
      showNotification('Error casting vote', 'error');
    }
  };

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
        },
      )
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const contentLength = response.headers.get("Content-Length")
      if (contentLength && Number.parseInt(contentLength) > 0) {
        const data = await response.json()
        console.log("Interaction successful:", data)
      } else {
        console.log("Interaction successful: No response body")
      }
    } catch (error) {
      console.error("Failed to interact with song:", error)
    }
  }

  // Get current song
  const currentSong = songs[currentSongIndex] || null
  const currentAudioUrl = currentSong?.filePath || ""

 

  useEffect(() => {
    if (audioRef.current && currentAudioUrl) {
      const wasPlaying = isPlaying
      audioRef.current.src = currentAudioUrl

      // Reset progress when changing songs ONLY
      setProgress(0)
      setDuration(0)
      setIsLoading(true)

      // If music was playing, continue playing the new song
      if (wasPlaying) {
        audioRef.current.play().catch(console.error)
      }
    }
  }, [currentSongIndex, currentAudioUrl]) 


  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100
    }
  }, [volume])

  // Reset playback log flag when song changes
  useEffect(() => {
    setHasLoggedTargetPlayback(false)
  }, [currentSongIndex])

  const monitorPlaybackDurationTarget = (
    currentTime: number,
    totalDuration: number,
    targetPercentage: number,
    songTitle: string,
  ) => {
    if (totalDuration > 0 && !hasLoggedTargetPlayback) {
      const targetTime = (targetPercentage / 100) * totalDuration
      if (currentTime >= targetTime) {
        console.log(
          `Song "${songTitle}" with id "${currentSong?.songId}" has reached ${targetPercentage}% of its duration.`,
        )
        setHasLoggedTargetPlayback(true)
        interactWithSong(songs[currentSongIndex]?.songId, "play")
      }
    }
  }

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => {
      setDuration(Math.floor(audio.duration) || 0)
      setIsLoading(false)
    }

    const handleTimeUpdate = () => {
      if (!isNaN(audio.currentTime)) {
        const newProgress = Math.floor(audio.currentTime)
        setProgress(newProgress)
        if (currentSong && duration > 0) {
          const TARGET_DURATION_PERCENTAGE = 2
          monitorPlaybackDurationTarget(audio.currentTime, duration, TARGET_DURATION_PERCENTAGE, currentSong.title)
        }
      }
    }

    const handleEnded = () => {
      if (isRepeating) {
        audio.currentTime = 0
        audio.play().catch(console.error)
      } else {
        playNextSong()
      }
    }

    const handleLoadStart = () => {
      setIsLoading(true)
    }

    const handleCanPlay = () => {
      setIsLoading(false)
    }

    const handleError = (e: Event) => {
      setIsLoading(false)
      setIsPlaying(false)
      console.error("Audio loading error:", e)
    }

    const handlePlay = () => {
      setIsPlaying(true)
    }

    const handlePause = () => {
      setIsPlaying(false)
    }

    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("loadstart", handleLoadStart)
    audio.addEventListener("canplay", handleCanPlay)
    audio.addEventListener("error", handleError)
    audio.addEventListener("play", handlePlay)
    audio.addEventListener("pause", handlePause)

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("loadstart", handleLoadStart)
      audio.removeEventListener("canplay", handleCanPlay)
      audio.removeEventListener("error", handleError)
      audio.removeEventListener("play", handlePlay)
      audio.removeEventListener("pause", handlePause)
    }
  }, [isRepeating, currentSong, duration, hasLoggedTargetPlayback])

  const togglePlayPause = async () => {
    const audio = audioRef.current
    if (!audio || !currentAudioUrl) return

    try {
      if (isPlaying) {
        audio.pause()
      } else {
        await audio.play()
      }
    } catch (error) {
      console.error("Playback error:", error)
      setIsPlaying(false)
    }
  }

  const handleProgressChange = (_: Event, value: number | number[]) => {
    const newProgress = value as number
    setProgress(newProgress)
    if (audioRef.current) {
      audioRef.current.currentTime = newProgress
    }
  }

  const handleVolumeChange = (_: Event, value: number | number[]) => {
    const newVolume = value as number
    setVolume(newVolume)
  }

  const getNextSongIndex = () => {
    if (songs.length <= 1) return currentSongIndex

    if (isShuffling) {
      const availableIndices = songs.map((_, index) => index).filter((index) => index !== currentSongIndex)

      if (availableIndices.length === 0) return currentSongIndex

      const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)]
      return randomIndex
    } else {
      return (currentSongIndex + 1) % songs.length
    }
  }

  const getPreviousSongIndex = () => {
    if (songs.length <= 1) return currentSongIndex

    if (isShuffling) {
      if (shuffleHistory.length > 0) {
        const prevIndex = shuffleHistory[shuffleHistory.length - 1]
        setShuffleHistory((prev) => prev.slice(0, -1))
        return prevIndex
      } else {
        const availableIndices = songs.map((_, index) => index).filter((index) => index !== currentSongIndex)

        if (availableIndices.length === 0) return currentSongIndex

        const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)]
        return randomIndex
      }
    } else {
      return currentSongIndex === 0 ? songs.length - 1 : currentSongIndex - 1
    }
  }

  const playNextSong = useCallback(() => {
    if (songs.length <= 1) return
    if (isShuffling) {
      setShuffleHistory((prev) => [...prev, currentSongIndex])
    }
    const nextIndex = getNextSongIndex()
    onSongChange(nextIndex)
  }, [songs, currentSongIndex, isShuffling, onSongChange])

  const playPreviousSong = () => {
    if (songs.length <= 1) return
    const prevIndex = getPreviousSongIndex()
    onSongChange(prevIndex)
  }

  const skipPrevious = () => {
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0
      setProgress(0)
    } else {
      playPreviousSong()
    }
  }

  const skipNext = () => {
    playNextSong()
  }

  const toggleMute = () => {
    if (volume === 0) {
      setVolume(50)
    } else {
      setVolume(0)
    }
  }

  const toggleLike = () => {
    if ( !userID || !isAuthenticated || !accessToken){
      setShowAuthDialog(true);
      return;
    } 
    const songId = currentSong.songId
    const isCurrentlyLiked = likedSongIds.has(songId)
    const newLikedSongIds = new Set(likedSongIds)
    if (isCurrentlyLiked) {
      newLikedSongIds.delete(songId)
      // showSnackbar("Removed from favorites", "info")
    } else {
      newLikedSongIds.add(songId)
      // showSnackbar("Added to favorites!", "success")
    }
    setLikedSongIds(newLikedSongIds)
    toggleFavorite(userID, songId, isCurrentlyLiked, accessToken)
  }

  const toggleShuffle = () => {
    setIsShuffling(!isShuffling)
    setShuffleHistory([])
  }

  const toggleRepeat = () => {
    setIsRepeating(!isRepeating)
  }

  const handleOpenCommentDialog = () => {
    if (!currentSong || !userID || !isAuthenticated){
      setShowAuthDialog(true);
      return;
    } 
    setCommentDialogOpen(true)
  }

  const handleCloseCommentDialog = () => {
    setCommentDialogOpen(false)
  }

  const handleSubmitComment = async (comment: string) => {
    if (!userID) {
      return console.error("User ID is not set. Cannot submit comment.")
    }
    if (!comment.trim()) {
      return console.warn("Comment is empty. Submission aborted.")
    }

    const commentData: Comment = {
      id: 0,
      songId: currentSong?.songId || 0,
      userId: userID,
      content: comment.trim(),
      createdAt: new Date().toISOString(),
    }

    try {
      const response = await fetch("https://music-backend-production-99a.up.railway.app/api/v1/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: accessToken ? `Bearer ${accessToken}` : "",
        },
        body: JSON.stringify(commentData),
      })
      const data = await response.json()
      if (response.ok) {
        console.log("Comment successfully submitted!")
      } else {
        console.error(data.message || "Comment submission failed.")
      }
    } catch (err) {
      console.error("Error submitting comment:", err)
    }
  }

  const toggleFavorite = async (userId: number, songId: number, isFavorite: boolean, accessToken: string) => {
    const url = `https://music-backend-production-99a.up.railway.app/api/v1/favorites/add-favorite/${userId}/${songId}`
    const deleteUrl = `https://music-backend-production-99a.up.railway.app/api/v1/favorites/${songId}`

    try {
      const response = await fetch(`${isFavorite ? deleteUrl : url}`, {
        method: isFavorite ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      })
      const data = await response.text()
      if (response.ok) {
        console.log(`${isFavorite ? "Removed from" : "Added to"} favorites:`, data)
      } else {
        console.error("Favorite toggle failed:", data)
      }
    } catch (error) {
      console.error("Error toggling favorite:", error)
    }
  }

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return "0:00"
    const minutes = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`
  }

  return (
    <ThemeProvider theme={theme}>
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#1a1a1a",
        borderTop: "1px solid #333",
        zIndex: 1000,
        transition: "height 0.3s ease",
        height: {
          xs: isMobileExtrasExpanded ? "240px" : "80px", // Increased mobile expanded height
          sm: isExtrasExpanded ? "140px" : "80px",
          md: "80px",
        },
        paddingBottom: {
          xs: "env(safe-area-inset-bottom, 0px)", // Add safe area padding for mobile
        },
      }}
    >
      <audio ref={audioRef} preload="metadata" />

      {songs.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            color: "white",
          }}
        >
          <Typography>No songs available</Typography>
        </Box>
      ) : (
        <Box sx={{ height: "100%", overflow: "hidden" }}>
          {/* Main Row - Always visible */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              height: "80px",
              px: 2,
              gap: 1,
            }}
          >
            {/* Album Cover & Song Info */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                minWidth: 0,
                flex: { xs: "1 1 auto", sm: "0 0 auto" },
                maxWidth: { xs: "none", sm: "300px" },
              }}
            >
              <Image
                src={"/images/album.jpeg"}
                alt={currentSong?.title || "Album cover"}
                width={50}
                height={50}
                style={{ objectFit: "cover", borderRadius: "4px", flexShrink: 0 }}
              />
              <Box sx={{ ml: 1, minWidth: 0, display: { xs: "block", sm: "block" } }}>
                <Typography variant="body2" sx={{ color: "white", fontWeight: 500 }} noWrap>
                  {currentSong?.title || "No Title"}
                </Typography>
                <Typography variant="caption" sx={{ color: "#ccc" }} noWrap>
                  {currentSong?.artistName || "Unknown Artist"}
                </Typography>
              </Box>
            </Box>

            {/* Essential Controls - Always visible */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                flex: "0 0 auto",
              }}
            >
              <IconButton
                onClick={skipPrevious}
                disabled={isLoading}
                size="small"
                sx={{ color: isLoading ? "#555" : "white" }}
              >
                <SkipPreviousOutlinedIcon />
              </IconButton>
              <IconButton
                onClick={togglePlayPause}
                disabled={isLoading || !currentAudioUrl}
                sx={{
                  backgroundColor: "rgba(255,255,255,0.1)",
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
                  color: "white",
                }}
              >
                {isLoading ? (
                  <Typography variant="caption">...</Typography>
                ) : isPlaying ? (
                  <PauseOutlinedIcon />
                ) : (
                  <PlayArrowOutlinedIcon />
                )}
              </IconButton>
              <IconButton
                onClick={skipNext}
                disabled={isLoading}
                size="small"
                sx={{ color: isLoading ? "#555" : "white" }}
              >
                <SkipNextOutlinedIcon />
              </IconButton>
            </Box>

            {/* Progress Bar - Hidden on mobile */}
            <Box
              sx={{
                display: { xs: "none", sm: "flex" },
                alignItems: "center",
                flex: 1,
                mx: 2,
                minWidth: 0,
              }}
            >
              <Typography variant="caption" sx={{ color: "white", minWidth: "40px", textAlign: "center" }}>
                {formatTime(progress)}
              </Typography>
              <Slider
                value={progress}
                min={0}
                max={duration || 1}
                onChange={handleProgressChange}
                disabled={isLoading || duration === 0}
                sx={{
                  mx: 1,
                  color: "white",
                  "& .MuiSlider-thumb": { color: "white" },
                  "& .MuiSlider-track": { color: "white" },
                  "& .MuiSlider-rail": { color: "#555" },
                }}
              />
              <Typography variant="caption" sx={{ color: "white", minWidth: "40px", textAlign: "center" }}>
                {formatTime(duration)}
              </Typography>
            </Box>

            {/* Desktop Controls - Visible on larger screens */}
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                alignItems: "center",
                gap: 1,
                flex: "0 0 auto",
              }}
            >
              <IconButton onClick={toggleMute} size="small">
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
                  width: "80px",
                  color: "white",
                  "& .MuiSlider-thumb": { color: "white" },
                  "& .MuiSlider-track": { color: "white" },
                  "& .MuiSlider-rail": { color: "#555" },
                }}
              />
              <IconButton onClick={toggleLike} size="small">
                {currentSong && votes && votes[currentSong.songId] === 'UPVOTE' ? (
                  <FavoriteIcon sx={{ color: "yellow" }} />
                ) : (
                  <FavoriteBorderIcon sx={{ color: "gray" }} />
                )}
              </IconButton>
              <IconButton onClick={toggleShuffle} size="small">
                <ShuffleIcon sx={{ color: isShuffling ? "yellow" : "gray" }} />
              </IconButton>
              <IconButton onClick={toggleRepeat} size="small">
                <ReplayIcon sx={{ color: isRepeating ? "yellow" : "gray" }} />
              </IconButton>
              <IconButton onClick={handleOpenCommentDialog} size="small">
                <InsertCommentIcon sx={{ color: "gray" }} />
              </IconButton>
              <IconButton size="small">
                <ShareIcon sx={{ color: "gray" }} />
              </IconButton>
              <IconButton onClick={(e) => {
                  e.stopPropagation()
                  handleVote(currentSong.songId, 'UPVOTE')
                }} 
                size="small">
                {currentSong && votes && votes[currentSong.songId] === 'UPVOTE' ? (
                  <ThumbUpIcon sx={{ color: "yellow" }} />
                ) : (
                  <ThumbUpOffAltIcon sx={{ color: "gray" }} />
                )}
              </IconButton>
              <IconButton onClick={(e) => {
                  e.stopPropagation()
                  handleVote(currentSong.songId, 'DOWNVOTE')
                }}
                size='small'>
                {currentSong && votes && votes[currentSong.songId] === 'DOWNVOTE' ? (
                  <ThumbDownAltIcon sx={{ color: "yellow" }} />
                ) : (
                  <ThumbDownOffAltIcon sx={{ color: "gray" }} />
                )}
              </IconButton>
            </Box>

            {/* Expand Button - Visible on tablet and mobile */}
            <IconButton
              onClick={() => {
                if (window.innerWidth < 600) {
                  setIsMobileExtrasExpanded(!isMobileExtrasExpanded)
                } else {
                  setIsExtrasExpanded(!isExtrasExpanded)
                }
              }}
              size="small"
              sx={{
                display: { xs: "flex", md: "none" },
                color: "white",
                ml: "auto",
              }}
            >
              {(window.innerWidth < 600 ? isMobileExtrasExpanded : isExtrasExpanded) ? (
                <ExpandLessIcon />
              ) : (
                <MoreHorizIcon />
              )}
            </IconButton>
          </Box>

          {/* Mobile Progress Bar - Only visible on mobile when expanded */}
          <Collapse in={isMobileExtrasExpanded}>
            <Box
              sx={{
                display: { xs: "flex", sm: "none" },
                alignItems: "center",
                px: 2,
                pb: 1,
              }}
            >
              <Typography variant="caption" sx={{ color: "white", minWidth: "40px", textAlign: "center" }}>
                {formatTime(progress)}
              </Typography>
              <Slider
                value={progress}
                min={0}
                max={duration || 1}
                onChange={handleProgressChange}
                disabled={isLoading || duration === 0}
                sx={{
                  mx: 1,
                  color: "white",
                  "& .MuiSlider-thumb": { color: "white" },
                  "& .MuiSlider-track": { color: "white" },
                  "& .MuiSlider-rail": { color: "#555" },
                }}
              />
              <Typography variant="caption" sx={{ color: "white", minWidth: "40px", textAlign: "center" }}>
                {formatTime(duration)}
              </Typography>
            </Box>
          </Collapse>

          {/* Tablet Secondary Controls */}
          <Collapse in={isExtrasExpanded}>
            <Box
              sx={{
                display: { xs: "none", sm: "flex", md: "none" },
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                px: 2,
                pb: 1,
              }}
            >
              <IconButton onClick={toggleMute} size="small">
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
                  "& .MuiSlider-thumb": { color: "white" },
                  "& .MuiSlider-track": { color: "white" },
                  "& .MuiSlider-rail": { color: "#555" },
                }}
              />
              <IconButton onClick={toggleLike} size="small">
                {currentSong && likedSongIds.has(currentSong.songId) ? (
                  <FavoriteIcon sx={{ color: "yellow" }} />
                ) : (
                  <FavoriteBorderIcon sx={{ color: "gray" }} />
                )}
              </IconButton>
              <IconButton onClick={toggleShuffle} size="small">
                <ShuffleIcon sx={{ color: isShuffling ? "yellow" : "gray" }} />
              </IconButton>
              <IconButton onClick={toggleRepeat} size="small">
                <ReplayIcon sx={{ color: isRepeating ? "yellow" : "gray" }} />
              </IconButton>
              <IconButton onClick={handleOpenCommentDialog} size="small">
                <InsertCommentIcon sx={{ color: "gray" }} />
              </IconButton>
              <IconButton size="small">
                <ShareIcon sx={{ color: "gray" }} />
              </IconButton>
              <IconButton onClick={(e) => {
                  e.stopPropagation()
                  handleVote(currentSong.songId, 'UPVOTE')
                }} 
                size="small">
                {currentSong && votes && votes[currentSong.songId] === 'UPVOTE' ? (
                  <ThumbUpIcon sx={{ color: "yellow" }} />
                ) : (
                  <ThumbUpOffAltIcon sx={{ color: "gray" }} />
                )}
              </IconButton>
              <IconButton onClick={(e) => {
                  e.stopPropagation()
                  handleVote(currentSong.songId, 'DOWNVOTE')
                }}
                size='small'>
                {currentSong && votes && votes[currentSong.songId] === 'DOWNVOTE' ? (
                  <ThumbUpIcon sx={{ color: "yellow" }} />
                ) : (
                  <ThumbUpOffAltIcon sx={{ color: "gray" }} />
                )}
              </IconButton>
            </Box>
          </Collapse>

          {/* Mobile Extended Controls */}
          <Collapse in={isMobileExtrasExpanded}>
            <Box
              sx={{
                display: { xs: "block", sm: "none" },
                px: 2,
                pb: 2, // Increased bottom padding
              }}
            >
              {/* Volume Control Row */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                  mb: 2, // Increased margin bottom
                }}
              >
                <IconButton onClick={toggleMute} size="small">
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
                    flex: 1,
                    mx: 1,
                    color: "white",
                    "& .MuiSlider-thumb": { color: "white" },
                    "& .MuiSlider-track": { color: "white" },
                    "& .MuiSlider-rail": { color: "#555" },
                  }}
                />
              </Box>

              {/* Action Buttons Row */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-around",
                  flexWrap: "wrap",
                  gap: 1,
                  pb: 1, // Add bottom padding to ensure buttons are visible
                }}
              >
                <IconButton onClick={toggleLike} size="small">
                  {currentSong && likedSongIds.has(currentSong.songId) ? (
                    <FavoriteIcon sx={{ color: "yellow" }} />
                  ) : (
                    <FavoriteBorderIcon sx={{ color: "gray" }} />
                  )}
                </IconButton>
                <IconButton onClick={toggleShuffle} size="small">
                  <ShuffleIcon sx={{ color: isShuffling ? "yellow" : "gray" }} />
                </IconButton>
                <IconButton onClick={toggleRepeat} size="small">
                  <ReplayIcon sx={{ color: isRepeating ? "yellow" : "gray" }} />
                </IconButton>
                <IconButton onClick={handleOpenCommentDialog} size="small">
                  <InsertCommentIcon sx={{ color: "gray" }} />
                </IconButton>
                <IconButton size="small">
                  <ShareIcon sx={{ color: "gray" }} />
                </IconButton>
                <IconButton onClick={(e) => {
                  e.stopPropagation()
                  handleVote(currentSong.songId, 'UPVOTE')
                }} 
                size="small">
                {currentSong && votes && votes[currentSong.songId] === 'UPVOTE' ? (
                  <ThumbUpIcon sx={{ color: "yellow" }} />
                ) : (
                  <ThumbUpOffAltIcon sx={{ color: "gray" }} />
                )}
              </IconButton>
              <IconButton onClick={(e) => {
                  e.stopPropagation()
                  handleVote(currentSong.songId, 'DOWNVOTE')
                }}
                size='small'>
                {currentSong && votes && votes[currentSong.songId] === 'DOWNVOTE' ? (
                  <ThumbDownAltIcon sx={{ color: "yellow" }} />
                ) : (
                  <ThumbDownOffAltIcon sx={{ color: "gray" }} />
                )}
              </IconButton>
              </Box>
            </Box>
          </Collapse>
        </Box>
      )}

      <AuthDialog 
        open={showAuthDialog} 
        onClose={() => setShowAuthDialog(false)}
      />

      <CommentDialog open={commentDialogOpen} onClose={handleCloseCommentDialog} onSubmit={handleSubmitComment} />

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ 
            backgroundColor: notification.severity === 'success' ? theme.palette.secondary.main : undefined,
            color: notification.severity === 'success' ? theme.palette.primary.main : undefined
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
    </ThemeProvider>
  )
}

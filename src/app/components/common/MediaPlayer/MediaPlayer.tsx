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

const votesUrl = "https://music-backend-production-99a.up.railway.app/api/v1/votes"

interface MediaPlayerProps {
  songs: ParsedSong[]
  favoriteSongs: ParsedSong[]
  currentSongIndex: number
  onSongChange: (index: number) => void
  userID: number | null
  userRole: string | null
}

export default function MediaPlayer({
  songs,
  favoriteSongs,
  currentSongIndex,
  onSongChange,
  userID,
  userRole,
}: MediaPlayerProps) {
  const { accessToken } = useSession()
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(50)
  const [isShuffling, setIsShuffling] = useState(false)
  const [isRepeating, setIsRepeating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [likedSongIds, setLikedSongIds] = useState<Set<number>>(new Set())
  const [upVotedSongs, setUpVotedSongs] = useState<Set<number>>(new Set())
  const [downVotedSongs, setDownVotedSongs] = useState<Set<number>>(new Set())
  const [shuffleHistory, setShuffleHistory] = useState<number[]>([])
  const [commentDialogOpen, setCommentDialogOpen] = useState(false)

  // Responsive states
  const [isExtrasExpanded, setIsExtrasExpanded] = useState(false)
  const [isMobileExtrasExpanded, setIsMobileExtrasExpanded] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState("")
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "info" | "warning">("info")

  // Initialize and sync local liked state with the prop from context
  useEffect(() => {
    const initialLikedIds = new Set(favoriteSongs.map((song) => song.songId))
    setLikedSongIds(initialLikedIds)
  }, [favoriteSongs])

  // State to track if the target playback duration message has been logged for the current song
  const [hasLoggedTargetPlayback, setHasLoggedTargetPlayback] = useState(false)

  const showSnackbar = useCallback((message: string, severity: typeof snackbarSeverity) => {
    setSnackbarMessage(message)
    setSnackbarSeverity(severity)
    setSnackbarOpen(true)
  }, [])

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false)
  }

  // Fetch user votes from backend
  useEffect(() => {
    if (!accessToken || !userID) return

    const fetchUserVotes = async () => {
      try {
        const res = await fetch(votesUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        if (!res.ok) {
          const errorBody = await res.json()
          throw new Error(errorBody?.message || "Failed to fetch votes.")
        }
        const result = await res.json()
        const votes = result?.data?.content || []
        const upVotes = new Set<number>()
        const downVotes = new Set<number>()
        for (const vote of votes) {
          const songId = vote.song?.songId
          if (!songId) continue
          if (vote.voteType === "UPVOTE") {
            upVotes.add(songId)
          } else if (vote.voteType === "DOWNVOTE") {
            downVotes.add(songId)
          }
        }
        setUpVotedSongs(upVotes)
        setDownVotedSongs(downVotes)
        showSnackbar("Vote data loaded.", "success")
      } catch (err) {
        console.error("Error loading votes:", err)
        const message = err instanceof Error ? err.message : "An unknown error occurred"
        showSnackbar(`Failed to load votes: ${message}`, "error")
      }
    }
    fetchUserVotes()
  }, [accessToken, userID, userRole, showSnackbar])

  const handleToggleUpVote = async () => {
    if (!currentSong || !userID || !accessToken) return
    const songId = currentSong.songId
    const isUpVoted = upVotedSongs.has(songId)
    const newUpVotes = new Set(upVotedSongs)
    const newDownVotes = new Set(downVotedSongs)

    try {
      if (isUpVoted) {
        newUpVotes.delete(songId)
        showSnackbar("Removed upvote.", "info")
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
        })
        if (!res.ok) {
          const errorBody = await res.json()
          throw new Error(errorBody?.message || "Failed to upvote.")
        }
        showSnackbar("Song upvoted!", "success")
        newUpVotes.add(songId)
        newDownVotes.delete(songId)
      }
      setUpVotedSongs(newUpVotes)
      setDownVotedSongs(newDownVotes)
    } catch (error) {
      console.error("Upvote error:", error)
      const message = error instanceof Error ? error.message : "An unknown error occurred"
      showSnackbar(`Error: ${message}`, "error")
    }
  }

  const handleToggleDownVote = async () => {
    if (!currentSong || !userID || !accessToken) return
    const songId = currentSong.songId
    const isDownVoted = downVotedSongs.has(songId)
    const newDownVotes = new Set(downVotedSongs)
    const newUpVotes = new Set(upVotedSongs)

    try {
      if (isDownVoted) {
        newDownVotes.delete(songId)
        showSnackbar("Removed downvote.", "info")
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
        })
        if (!res.ok) {
          const errorBody = await res.json()
          throw new Error(errorBody?.message || "Failed to downvote.")
        }
        showSnackbar("Song Downvoted!", "success")
        newDownVotes.add(songId)
        newUpVotes.delete(songId)
      }
      setDownVotedSongs(newDownVotes)
      setUpVotedSongs(newUpVotes)
    } catch (error) {
      console.error("Failed to downvote:", error)
    }
  }

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
    if (!currentSong || !userID || !accessToken) {
      showSnackbar("Cannot update favorites. User not logged in.", "error")
      return
    }
    const songId = currentSong.songId
    const isCurrentlyLiked = likedSongIds.has(songId)
    const newLikedSongIds = new Set(likedSongIds)
    if (isCurrentlyLiked) {
      newLikedSongIds.delete(songId)
      showSnackbar("Removed from favorites", "info")
    } else {
      newLikedSongIds.add(songId)
      showSnackbar("Added to favorites!", "success")
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
                {currentSong && likedSongIds.has(currentSong.songId) ? (
                  <FavoriteIcon sx={{ color: "red" }} />
                ) : (
                  <FavoriteBorderIcon sx={{ color: "white" }} />
                )}
              </IconButton>
              <IconButton onClick={toggleShuffle} size="small">
                <ShuffleIcon sx={{ color: isShuffling ? "#1db954" : "white" }} />
              </IconButton>
              <IconButton onClick={toggleRepeat} size="small">
                <ReplayIcon sx={{ color: isRepeating ? "#1db954" : "white" }} />
              </IconButton>
              <IconButton onClick={handleOpenCommentDialog} size="small">
                <InsertCommentIcon sx={{ color: "gray" }} />
              </IconButton>
              <IconButton size="small">
                <ShareIcon sx={{ color: "gray" }} />
              </IconButton>
              <IconButton onClick={handleToggleUpVote} size="small">
                {currentSong && upVotedSongs.has(currentSong.songId) ? (
                  <ThumbUpIcon sx={{ color: "#1db954" }} />
                ) : (
                  <ThumbUpOffAltIcon sx={{ color: "gray" }} />
                )}
              </IconButton>
              <IconButton onClick={handleToggleDownVote} size="small">
                {currentSong && downVotedSongs.has(currentSong.songId) ? (
                  <ThumbDownAltIcon sx={{ color: "#e53935" }} />
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
                  <FavoriteIcon sx={{ color: "red" }} />
                ) : (
                  <FavoriteBorderIcon sx={{ color: "white" }} />
                )}
              </IconButton>
              <IconButton onClick={toggleShuffle} size="small">
                <ShuffleIcon sx={{ color: isShuffling ? "#1db954" : "white" }} />
              </IconButton>
              <IconButton onClick={toggleRepeat} size="small">
                <ReplayIcon sx={{ color: isRepeating ? "#1db954" : "white" }} />
              </IconButton>
              <IconButton onClick={handleOpenCommentDialog} size="small">
                <InsertCommentIcon sx={{ color: "gray" }} />
              </IconButton>
              <IconButton size="small">
                <ShareIcon sx={{ color: "gray" }} />
              </IconButton>
              <IconButton onClick={handleToggleUpVote} size="small">
                {currentSong && upVotedSongs.has(currentSong.songId) ? (
                  <ThumbUpIcon sx={{ color: "#1db954" }} />
                ) : (
                  <ThumbUpOffAltIcon sx={{ color: "gray" }} />
                )}
              </IconButton>
              <IconButton onClick={handleToggleDownVote} size="small">
                {currentSong && downVotedSongs.has(currentSong.songId) ? (
                  <ThumbDownAltIcon sx={{ color: "#e53935" }} />
                ) : (
                  <ThumbDownOffAltIcon sx={{ color: "gray" }} />
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
                    <FavoriteIcon sx={{ color: "red" }} />
                  ) : (
                    <FavoriteBorderIcon sx={{ color: "white" }} />
                  )}
                </IconButton>
                <IconButton onClick={toggleShuffle} size="small">
                  <ShuffleIcon sx={{ color: isShuffling ? "#1db954" : "white" }} />
                </IconButton>
                <IconButton onClick={toggleRepeat} size="small">
                  <ReplayIcon sx={{ color: isRepeating ? "#1db954" : "white" }} />
                </IconButton>
                <IconButton onClick={handleOpenCommentDialog} size="small">
                  <InsertCommentIcon sx={{ color: "gray" }} />
                </IconButton>
                <IconButton size="small">
                  <ShareIcon sx={{ color: "gray" }} />
                </IconButton>
                <IconButton onClick={handleToggleUpVote} size="small">
                  {currentSong && upVotedSongs.has(currentSong.songId) ? (
                    <ThumbUpIcon sx={{ color: "#1db954" }} />
                  ) : (
                    <ThumbUpOffAltIcon sx={{ color: "gray" }} />
                  )}
                </IconButton>
                <IconButton onClick={handleToggleDownVote} size="small">
                  {currentSong && downVotedSongs.has(currentSong.songId) ? (
                    <ThumbDownAltIcon sx={{ color: "#e53935" }} />
                  ) : (
                    <ThumbDownOffAltIcon sx={{ color: "gray" }} />
                  )}
                </IconButton>
              </Box>
            </Box>
          </Collapse>
        </Box>
      )}

      <CommentDialog open={commentDialogOpen} onClose={handleCloseCommentDialog} onSubmit={handleSubmitComment} />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        sx={{
          mb: {
            xs: isMobileExtrasExpanded ? 25 : 10, // Adjust margin based on expanded state
            sm: isExtrasExpanded ? 18 : 10,
            md: 10,
          },
        }} // Add margin to avoid overlap with media player
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}

import React from 'react';
import { IconButton } from '@mui/material';
import InsertCommentIcon from '@mui/icons-material/InsertComment';
import ShareIcon from '@mui/icons-material/Share';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import { Song } from "@/app/types";

interface SongActionsProps {
  currentSong: Song | null;
  upVotedSongs: Set<number>;
  downVotedSongs: Set<number>;
  onOpenCommentDialog: () => void;
  onToggleUpVote: () => void;
  onToggleDownVote: () => void;
  onShare?: () => void; // Optional share handler
}

const SongActions: React.FC<SongActionsProps> = ({
  currentSong,
  upVotedSongs,
  downVotedSongs,
  onOpenCommentDialog,
  onToggleUpVote,
  onToggleDownVote,
  onShare,
}) => {
  const handleShare = () => {
    if (onShare) {
      onShare();
    } else {
      // Default share functionality
      if (currentSong && navigator.share) {
        navigator.share({
          title: currentSong.title,
          text: `Check out "${currentSong.title}" by ${currentSong.artist?.name || 'Unknown Artist'}`,
          url: window.location.href,
        }).catch(console.error);
      } else {
        // Fallback: copy to clipboard
        if (currentSong) {
          const shareText = `Check out "${currentSong.title}" by ${currentSong.artist?.name || 'Unknown Artist'}`;
          navigator.clipboard.writeText(shareText).catch(console.error);
        }
      }
    }
  };

  return (
    <>
      {/* Comment Button */}
      <IconButton
        onClick={onOpenCommentDialog}
        sx={{ color: "gray" }}
        aria-label="Add comment"
      >
        <InsertCommentIcon sx={{ color: "gray" }} />
      </IconButton>

      {/* Share Button */}
      <IconButton
        onClick={handleShare}
        sx={{ color: "gray" }}
        aria-label="Share song"
      >
        <ShareIcon sx={{ color: "gray" }} />
      </IconButton>

      {/* Upvote Button */}
      <IconButton
        onClick={onToggleUpVote}
        aria-label="Upvote song"
      >
        {currentSong && upVotedSongs.has(currentSong.songId) ? (
          <ThumbUpIcon sx={{ color: "#1db954" }} />
        ) : (
          <ThumbUpOffAltIcon sx={{ color: "gray" }} />
        )}
      </IconButton>

      {/* Downvote Button */}
      <IconButton
        onClick={onToggleDownVote}
        aria-label="Downvote song"
      >
        {currentSong && downVotedSongs.has(currentSong.songId) ? (
          <ThumbDownAltIcon sx={{ color: "#e53935" }} />
        ) : (
          <ThumbDownOffAltIcon sx={{ color: "gray" }} />
        )}
      </IconButton>
    </>
  );
};

export default SongActions;
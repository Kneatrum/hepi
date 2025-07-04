"use client"
import { useEffect, useState } from "react";
import styles from "../../../styles/page.module.css";
import { Box, Typography, IconButton } from "@mui/material";
import Grid from "@mui/material/Grid";
import AdminDashboard from "@/app/components/layout/AdminDashboard";
import CustomSearchField from "@/app/components/common/CustomFields/CustomSearchField";
import Spinner from "@/app/components/common/spinners/loading";
import InfoCard from "@/app/components/common/ui/InfoCard";
// import MusicNoteIcon from '@mui/icons-material/MusicNote';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CommentIcon from '@mui/icons-material/Comment';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
// import { useRouter } from "next/navigation";

// Updated Song interface to match API response
interface Song {
  songId: number;
  title: string;
  artistName: string;
  playCount: number;
  likeCount: number;
  shareCount: number;
  genre: string;
  upvotes: number; 
  downvotes: number; 
}

interface ApiResponse {
  songId: number;
  title: string;
  artistName: string;
  playCount: number;
  likeCount: number;
  shareCount: number;
  genre: string;
}

interface AnalyticsCategory {
  title: string;
  icon: React.ReactNode;
  color: string;
  sortKey: keyof Song;
  songs: Song[];
}

export default function SongAnalyticsPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  // Function to transform API response to Song interface
  function transformApiResponse(response: ApiResponse[]): Song[] {
    if (!response || !Array.isArray(response)) {
      console.error("Invalid API response format");
      return [];
    }

    return response.map((song) => ({
      songId: song.songId,
      title: song.title,
      artistName: song.artistName,
      likeCount: song.likeCount,
      playCount: song.playCount,
      shareCount: song.shareCount,
      genre: song.genre,
      upvotes: 0, 
      downvotes: 0, 
    }));
  }

  useEffect(() => {
    async function fetchSongs() {
      try {
        setLoading(true);
        const res = await fetch(
          "https://music-backend-production-99a.up.railway.app/api/v1/songs/trending?limit=10"
        );
        
        if (!res.ok) {
          throw new Error('Failed to fetch');
        }
        
        const data = await res.json();
        const transformedSongs = transformApiResponse(data);
        console.log("### Transformed songs:", transformedSongs);
        
        setSongs(transformedSongs);
      } catch (error) {
        console.error("Failed to fetch song analytics:", error);
        setSongs([]);
      } finally {
        setLoading(false);
      }
    }

    fetchSongs();
  }, []);

  

  const getAnalyticsCategories = (): AnalyticsCategory[] => {
    return [
      {
        title: "Most Played Songs",
        icon: <PlayArrowIcon sx={{ color: "#ff9800", fontSize: '24px' }} />,
        color: "#2196f3",
        sortKey: "playCount",
        songs: [...songs]
          .filter(song => song.playCount > 0)
          .sort((a, b) => b.playCount - a.playCount)
          .slice(0, 10)
      },
      {
        title: "Most Liked Songs",
        icon: <FavoriteIcon sx={{ color: "#ff9800", fontSize: '24px' }} />,
        color: "#e91e63",
        sortKey: "likeCount",
        songs: [...songs]
          .filter(song => song.likeCount > 0)
          .sort((a, b) => b.likeCount - a.likeCount)
          .slice(0, 10)
      },
      {
        title: "Most Shared Songs",
        icon: <CommentIcon sx={{ color: "#ff9800", fontSize: '24px' }} />,
        color: "#ff9800",
        sortKey: "shareCount",
        songs: [...songs]
          .filter(song => song.shareCount > 0)
          .sort((a, b) => b.shareCount - a.shareCount)
          .slice(0, 10)
      },
      {
        title: "Most Upvoted Songs",
        icon: <ThumbUpIcon sx={{ color: "#ff9800", fontSize: '24px' }} />,
        color: "#4caf50",
        sortKey: "upvotes",
        songs: [...songs]
          .filter(song => song.upvotes > 0)
          .sort((a, b) => b.upvotes - a.upvotes)
          .slice(0, 10)
      }
    ];
  };

  // const filteredSongs = songs.filter((song) =>
  //   song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //   song.artistName.toLowerCase().includes(searchQuery.toLowerCase())
  // );

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const toggleCardExpansion = (cardId: string) => {
    const newExpandedCards = new Set(expandedCards);
    if (newExpandedCards.has(cardId)) {
      newExpandedCards.delete(cardId);
    } else {
      newExpandedCards.add(cardId);
    }
    setExpandedCards(newExpandedCards);
  };

  const renderSongCard = (song: Song, rank: number, categoryTitle: string) => {
    const cardId = `${categoryTitle}-${song.songId}`;
    const isExpanded = expandedCards.has(cardId);

    return (
      <Box
        key={song.songId}
        sx={{
          padding: 0,
          overflow: "hidden",
          border: "1px solid var(--borderColor1)",
          backgroundColor: "#020202",
          marginBottom: "12px",
          transition: "all 0.3s ease",
        }}
      >
        {/* Header Section - Always Visible */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            backgroundColor: "#1a1a1a",
            padding: "12px 16px",
            cursor: "pointer",
            "&:hover": {
              backgroundColor: "#2a2a2a",
            },
          }}
          onClick={() => toggleCardExpansion(cardId)}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flex: 1,
            }}
          >
            <Typography
              sx={{
                fontSize: "16px",
                color: "gray",
                minWidth: "24px",
              }}
            >
              {rank}
            </Typography>
            {/* <MusicNoteIcon sx={{ color: "gray", fontSize: '28px' }} /> */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography 
                sx={{ 
                  fontSize: "16px", 
                  fontWeight: "bold", 
                  color: "#fff",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}
              >
                {song.title}
              </Typography>
              <Typography 
                sx={{ 
                  fontSize: "13px", 
                  color: "#ccc",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}
              >
                by {song.artistName}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography sx={{ fontSize: "12px", color: "#888" }}>
              {song.genre}
            </Typography>
            <IconButton 
              size="small" 
              sx={{ color: "#fff" }}
              onClick={(e) => {
                e.stopPropagation();
                toggleCardExpansion(cardId);
              }}
            >
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        </Box>

        {/* Expandable Body Section */}
        {isExpanded && (
          <Box sx={{ padding: "16px", backgroundColor: "#020202" }}>
            {/* Analytics Stats */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <FavoriteIcon sx={{ color: "#ff9800", fontSize: '18px' }} />
                <Typography sx={{ color: "#fff", fontSize: "14px" }}>
                  {formatNumber(song.likeCount)} likes
                </Typography>
              </Box>
              
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <PlayArrowIcon sx={{ color: "#ff9800", fontSize: '18px' }} />
                <Typography sx={{ color: "#fff", fontSize: "14px" }}>
                  {formatNumber(song.playCount)} plays
                </Typography>
              </Box>
              
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <CommentIcon sx={{ color: "#ff9800", fontSize: '18px' }} />
                <Typography sx={{ color: "#fff", fontSize: "14px" }}>
                  {formatNumber(song.shareCount)} shares
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <ThumbUpIcon sx={{ color: "#ff9800", fontSize: '18px' }} />
                <Typography sx={{ color: "#fff", fontSize: "14px" }}>
                  {formatNumber(song.upvotes)} upvotes
                </Typography>
              </Box>
              
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <ThumbDownIcon sx={{ color: "#ff9800", fontSize: '18px' }} />
                <Typography sx={{ color: "#fff", fontSize: "14px" }}>
                  {formatNumber(song.downvotes)} downvotes
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    );
  };

  const renderCategoryCard = (category: AnalyticsCategory) => (
    <Box
      key={category.title}
      sx={{
        border: "1px solid var(--borderColor1)",
        borderRadius: "0px",
        backgroundColor: "#020202",
        overflow: "hidden",
        height: "100%",
      }}
    >
      {/* Category Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          backgroundColor: "#1a1a1a",
          padding: "16px 20px",
          borderBottom: "1px solid var(--borderColor1)",
        }}
      >
        {category.icon}
        <Typography sx={{ fontSize: "20px", fontWeight: "bold", color: "#fff" }}>
          {category.title}
        </Typography>
      </Box>

      {/* Category Content */}
      <Box sx={{ padding: "16px", maxHeight: "500px", overflowY: "auto" }}>
        {category.songs.length === 0 ? (
          <InfoCard
            title="No data available"
            description="No songs found for this category."
          />
        ) : (
          category.songs.map((song, index) => renderSongCard(song, index + 1, category.title))
        )}
      </Box>
    </Box>
  );

  return (
    <AdminDashboard>
      <Box className={styles.home} sx={{ padding: "0px" }}>
        {/* Top Section */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <Box className={styles.layer}>
            <Box className={styles.layerTop}>
              <Box className={styles.layerTopSearch} sx={{ width: "30%"}}>
                <CustomSearchField
                  placeholder="Search songs or artists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </Box>
            </Box>
          </Box>

          {/* Analytics Categories */}
          <Box sx={{ height: "100%", overflow: "hidden", paddingRight: "0px" }}>
            {loading ? (
              <Spinner />
            ) : (
              <Grid container spacing={3}>
                {getAnalyticsCategories().map((category) => (
                  <Grid item xs={12} md={6} lg={4} key={category.title}>
                    {renderCategoryCard(category)}
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Box>
      </Box>
    </AdminDashboard>
  );
}
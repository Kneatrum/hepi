"use client"

import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Button,
  Chip,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
} from "@mui/material";

import { useEffect, useState } from "react";
import CustomSearchField from "@/app/components/common/CustomFields/CustomSearchField";
import Spinner from "@/app/components/common/spinners/loading";
import InfoCard from "@/app/components/common/ui/InfoCard";
// import { useRouter } from "next/navigation";
// import { useSession } from "@/app/context/SessionContext";

import CreateGenreDialog from "@/app/components/common/dialogs/CreateGenreDialog";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import AdminDashboard from "@/app/components/layout/AdminDashboard";
import styles from "../../../styles/page.module.css";
import GenreEditDialog from "@/app/components/common/ui/GenreEditDialog";
import { Genre } from "@/app/types";
import AddCircleIcon from '@mui/icons-material/AddCircle';


// Custom theme with dark and yellow colors
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
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))


  useEffect(() => {
    const fetchGenres = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://music-backend-production-99a.up.railway.app/api/v1/genres'); 
        if (!response.ok) {
          throw new Error('Failed to fetch genres');
        }
        const data = await response.json();
        setGenres(data);
      } catch (error) {
        console.error('Error fetching genres:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGenres();
  }, []);




  const handleGenreDialogSuccess = () => {
    console.log('New genre created');
    // Handle success (e.g., refresh list, show notification)
  };

  const handleGenreClick = (genre: Genre) => {
    setSelectedGenre(genre);
    setPopupOpen(true);
  }

  const filteredGenres = genres.filter((genre) =>
    genre.name.toLowerCase().includes(searchQuery.toLowerCase()) 
  );

  return (
    <ThemeProvider theme={darkYellowTheme}>
      <AdminDashboard>
            <Box className={styles.home} sx={{padding:"0.625rem"}}>
            {/* Top Section */}
            <Box sx={{display:"flex", flexDirection:"column"}}>
              <Box sx={{
                display: "flex",
                flexDirection: "column",
                position: "sticky",
                top: 0,
                zIndex: 10,
                bgcolor: "background.default",
              }}
              >
                {/* Top Bar: Title, Search, Button */}
                {isMobile ? (
                  // Mobile Layout
                  <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 2, pb: 2 }}>
                    <Typography sx={{ fontSize: "36px", fontWeight: "bold", color: "gray" }}>
                      Genres
                    </Typography  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}> 
                      <Box sx={{ flexGrow: 1 }}>
                        <CustomSearchField
                          placeholder="Search genres by name"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </Box>
                      <AddCircleIcon
                        sx={{ color: 'yellow', fontSize: '40px', cursor: 'pointer' }}
                        onClick={() => setDialogOpen(true)}
                      />
                    </Box>
                  </Box>
                ) : (
                  // Desktop Layout
                  <Box 
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                  >
                    <Typography sx={{ fontSize: "36px", fontWeight: "bold", color: "gray" }}>
                      Genres
                    </Typography>
                    <CustomSearchField
                      placeholder="Search an country"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button 
                      sx={{ 
                      color: "black", 
                      borderRadius: "50px", 
                      backgroundColor: "#F3B007", 
                      textTransform: 'none',
                      "&:hover": { backgroundColor: "#FFEB3B" }
                    }}
                    variant="contained"
                    size="medium"
                    onClick={() => setDialogOpen(true)}
                  >
                      Add Genre
                    </Button>
                  </Box>
                )}

                {
                  !loading && filteredGenres.length > 0 && !isMobile && (
                    <Table sx={{ minWidth: 650, tableLayout: "fixed" }}>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ width: "33%" }}>ID</TableCell>
                          <TableCell sx={{ width: "33%" }}>Name</TableCell>
                          <TableCell sx={{ width: "33%" }}>Description</TableCell>
                        </TableRow>
                      </TableHead>
                    </Table>
                  )}
                </Box>

              {/* Users Table */}
                { loading && <Spinner /> }
                
                {!loading && filteredGenres.length === 0 && (
                  <Box className={styles.centerYX}>
                    <InfoCard
                      title="No tribe found"
                      description="Try searching with a different keyword or check back later."
                    />
                  </Box>
                )}
                
                { !loading && filteredGenres.length > 0 && !isMobile &&  (
                  <Box sx={{ height: "100%", overflow: "hidden" }}>
                    <TableContainer component={Paper} sx={{borderRadius: "0px"}}>
                      <Table sx={{ minWidth: 650 }} aria-label="genres table">
                        <TableBody>
                          {filteredGenres.map((genre) => (
                            <TableRow
                              key={genre.name}
                              sx={{ 
                                '&:last-child td, &:last-child th': { border: 0 },
                                cursor: 'pointer'
                              }}
                              onClick={() => {
                                setSelectedGenre(genre);
                                setPopupOpen(true);
                              }}
                            > 
                              <TableCell component="th" scope="row" sx={{ width: "33%" }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography sx={{ fontWeight: 'bold', color: 'yellow' }}>
                                    {genre.genreId} 
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell component="th" scope="row" sx={{ width: "33%" }}>
                                <Typography sx={{ color: '#fff' }}>
                                  {genre.name}
                                </Typography>
                              </TableCell>
                              <TableCell component="th" scope="row" sx={{ width: "33%" }}>
                                <Typography noWrap sx={{ color: '#fff', maxWidth: '30ch' }}>
                                  {genre.description}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}
             
                            {/* Mobile Card View */}
              {!loading && filteredGenres.length > 0 && isMobile && (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    pb: 2,
                  }}
                >
                  {filteredGenres.map((genre) => (
                    <Card
                      key={genre.genreId}
                      sx={{
                        cursor: "pointer",
                        mb: 2,
                        position: "relative",
                        overflow: "hidden",
                        transition: "all 0.2s ease-in-out",
                        "&:active": {
                          transform: "scale(0.98)",
                        },
                      }}
                      onClick={() => handleGenreClick(genre)}
                    >
                      <CardContent
                        sx={{
                          p: 3,
                          "&:last-child": { pb: 2 },
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            width: "100%",
                            gap: 2,
                          }}
                        >
                          <Chip
                            label={genre.genreId}
                            size="small"
                            variant="outlined"
                            sx={{
                              backgroundColor: "rgb(0, 0, 0)",
                              color: "white",
                            }}>
                          </Chip>
                          
                          <Box sx={{flex: 1}}>
                            <Typography
                              variant="h6"
                              sx={{
                                color: "#fff",
                                fontWeight: 600,
                                fontSize: "1.1rem",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {genre.name}
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{
                                  color: "#888",
                                  fontSize: "0.7rem",
                                  mt: 1,
                                  display: "block",
                                }}
                              >
                                Tap for details
                              </Typography>
                            </Box>

                          
                        </Box>

                        {/* Tap hint */}
                        
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}


            </Box>
          </Box>
          <GenreEditDialog 
            open={popupOpen}
            onClose={() => setPopupOpen(false)}
            genre={selectedGenre}
            genres={genres}
            setGenres={setGenres}
            onSuccess={() => {
              setPopupOpen(false);
              setSelectedGenre(null);
            }}
          />
          <CreateGenreDialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            onSuccess={handleGenreDialogSuccess}
          />
      </AdminDashboard>
    </ThemeProvider>
  );
}

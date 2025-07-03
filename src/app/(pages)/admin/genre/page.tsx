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
  Button
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


  useEffect(() => {
    const fetchGenres = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://music-backend-production-99a.up.railway.app/api/v1/genres'); // Adjust the API endpoint as needed
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

  const filteredGenres = genres.filter((genre) =>
    genre.name.toLowerCase().includes(searchQuery.toLowerCase()) 
  );

  return (
    <ThemeProvider theme={darkYellowTheme}>
      <AdminDashboard>
            <Box className={styles.home} sx={{padding:"0px"}}>
            {/* Top Section */}
            <Box sx={{display:"flex", flexDirection:"column",gap:"20px"}}>
              <Box className={styles.layer}>
                <Box className={styles.layerTop}>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography className={styles.layerTopIntroText}>
                      Genres
                    </Typography>
                    <Button 
                      className="callToActionButton"
                      onClick={() => setDialogOpen(true)}
                    >
                      Add Genre
                    </Button>
                  </Box>
                </Box>
                <Box className={styles.layerTopSearch}>
                  <CustomSearchField
                    placeholder="Search genres by name."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </Box>
              </Box>

              {/* Users Table */}
              <Box sx={{ height: "600px", overflowY: "auto", paddingRight: "10px" }}>
                {loading && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Spinner />
                  </Box>
                )}
                
                {!loading && filteredGenres.length === 0 ? (
                  <Box className={styles.centerYX}>
                    <InfoCard
                      title="No tribe found"
                      description="Try searching with a different keyword or check back later."
                    />
                  </Box>
                ) : (
                  !loading && (
                    <TableContainer component={Paper}>
                      <Table sx={{ minWidth: 650 }} aria-label="genres table">
                        <TableHead >
                          <TableRow>
                              <TableCell></TableCell>
                              <TableCell>Name</TableCell>
                              <TableCell>Description</TableCell>
                          </TableRow>
                        </TableHead>
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
                              <TableCell component="th" scope="row">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {/* <AccountCircleIcon sx={{ color: "#FFEB3B", fontSize: '24px' }} /> */}
                                  <Typography sx={{ fontWeight: 'bold', color: 'gray' }}>
                                    {genre.genreId} 
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography sx={{ color: '#fff' }}>
                                  {genre.name}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography sx={{ color: '#fff' }}>
                                  {genre.description}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )
                )}
              </Box>
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

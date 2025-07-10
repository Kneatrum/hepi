"use client"
import { useEffect, useState } from "react";
import styles from "../../../styles/page.module.css";
import { 
  Button, 
  Box, 
  TableContainer, 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableRow, 
  Paper, 
  Card, 
  CardContent, 
  Avatar,
  Typography,
  useMediaQuery,
  useTheme,
  Chip,
} from "@mui/material";


import { Artist } from "@/app/types";
import AdminDashboard from "@/app/components/layout/AdminDashboard";
import CustomSearchField from "@/app/components/common/CustomFields/CustomSearchField";
import Spinner from "@/app/components/common/spinners/loading";
import InfoCard from "@/app/components/common/ui/InfoCard";
import CreateArtistDialog from "@/app/components/common/dialogs/CreateArtistDialog";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import ArtistDetailsModal from "@/app/components/common/ui/ArtistDetailsModal";
import AddCircleIcon from '@mui/icons-material/AddCircle';

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


// Mobile Artist Card Component
const MobileArtistCard = ({ artist, index, onClick }: { artist: Artist; index: number; onClick: () => void }) => (
  <Card
    onClick={onClick}
    sx={{
      cursor: "pointer",
      mb: 2,
      position: "relative",
      overflow: "hidden"
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Chip
          label={index + 1}
          size="small"
          variant="outlined"
          sx={{
            backgroundColor: "rgb(0, 0, 0)",
            color: "white",
            fontWeight: "bold",
            fontSize: "0.75rem",
          }}
        >
        </Chip>
        <Avatar
          sx={{
            bgcolor: "#FFEB3B",
            color: "#000",
            width: 48,
            height: 48,
            fontWeight: "bold",
            fontSize: "18px",
          }}
        >
          {artist.name.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h6"
            sx={{
              color: "#FFEB3B",
              fontWeight: "bold",
              mb: 0.5,
              fontSize: "18px",
            }}
          >
            {artist.name}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "#888",
              fontSize: "14px",
            }}
          >
            Tap to view details
          </Typography>
        </Box>
        
      </Box>
    </CardContent>
  </Card>
)

export default function Page() {
  const [allArtists, setAllArtists] = useState<Artist[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [createArtistDialogOpen, setCreateArtistDialogOpen] = useState(false);
  // const router = useRouter();
  // const [popupOpen, setPopupOpen] = useState(false);
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  useEffect(() => {
    async function fetchArtists() {
      try {
        setLoading(true);
        const res = await fetch(
          "https://music-backend-production-99a.up.railway.app/api/v1/artists?page=0&size=50"
        );
        const data = await res.json();
        setAllArtists(data?.content || []);
      } catch (error) {
        console.error("Failed to fetch songs:", error);
      } finally {
        setLoading(false);
      }
    }
  
    fetchArtists();
  }, []);
 

  const handleArtistDialogSuccess = () => {
    console.log('New artist created');
    // Handle success (e.g., refresh list, show notification)
  };
  

  const filteredArtist = allArtists.filter((artists) =>
    artists.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <ThemeProvider theme={darkYellowTheme}>
    <AdminDashboard>
      <Box className={styles.home} sx={{padding:"0.625rem"}}>
        {/* Top Section */}
        <Box sx={{display:"flex", flexDirection:"column"}}>
            <Box
              sx={{
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
                    Artists
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <CustomSearchField
                        placeholder="Search an artist."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </Box>
                    <AddCircleIcon
                      sx={{ color: 'yellow', fontSize: '40px', cursor: 'pointer' }}
                      onClick={() => setCreateArtistDialogOpen(true)}
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
                    Artists
                  </Typography>
                  <Box className={styles.layerTopSearch}>
                    <CustomSearchField
                      placeholder="Search an artist."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </Box>
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
                    onClick={() => setCreateArtistDialogOpen(true)}
                  >
                    Add Artist
                  </Button>
                </Box>
              )}

              {/* Sticky Table Header for Desktop */}
              {!isMobile && !loading && filteredArtist.length > 0 && (
                <Table sx={{ minWidth: 650, tableLayout: "fixed" }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: "10%" }}>ID</TableCell>
                      <TableCell sx={{ width: "30%" }}>Name</TableCell>
                      <TableCell sx={{ width: "20%" }}>Country</TableCell>
                      <TableCell sx={{ width: "20%" }}>Region</TableCell>
                      <TableCell sx={{ width: "20%" }}>Culture</TableCell>
                    </TableRow>
                  </TableHead>
                </Table>
              )}
            </Box>

          {/* Songs box */}
          { loading && <Spinner /> }

          {!loading && filteredArtist.length === 0 ? (
            <Box className={styles.centerYX}>
              <InfoCard
                title="No artists found"
                description="Try searching with a different keyword or check back later."
              />
            </Box>
          )  : ( !loading && ( 
            !isMobile ? (
              <Box>
                {/* Suggested Singers */}
                <Box className={styles.gridContainer}>
                  <TableContainer component={Paper} sx={{ borderRadius: "0px", borderTop: "none" }}>
                    <Table sx={{ minWidth: 650, tableLayout: "fixed" }} aria-label="artists table">
                      <TableBody>
                        {filteredArtist.map((artist, index) => (
                          <TableRow
                            key={index}
                            sx={{ 
                              '&:last-child td, &:last-child th': { border: 0 },
                              cursor: 'pointer'
                            }}
                            onClick={() => {
                              setSelectedArtist(artist);
                              // setPopupOpen(true);
                            }}
                          >
                            <TableCell component="th" scope="row" sx={{ width: "10%" }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {/* <AccountCircleIcon sx={{ color: "#FFEB3B", fontSize: '24px' }} /> */}
                                <Typography sx={{ fontWeight: 'bold', color: 'yellow'}}>
                                  {index + 1} 
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell component="th" scope="row" sx={{ width: "30%" }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {/* <AccountCircleIcon sx={{ color: "#FFEB3B", fontSize: '24px' }} /> */}
                                <Typography sx={{ fontWeight: 'bold', color: 'gray' }}>
                                  {artist.name} 
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell sx={{ width: "20%" }}>
                              <Typography sx={{ color: '#fff' }}>
                                {artist.country.name}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ width: "20%" }}>
                              <Typography sx={{ color: '#fff' }}>
                                {artist.country.region}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ width: "20%" }}>
                              <Typography sx={{ color: '#fff' }}>
                                {artist.tribe.name}
                              </Typography>
                            </TableCell>
                        </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Box>
            ) : (
              <>
                {filteredArtist.map((artist, index) => (
                  <MobileArtistCard
                    key={index}
                    artist={artist}
                    index={index}
                    onClick={() => setSelectedArtist(artist)}
                  />
                ))}
              </>
            )
          )
          )}

        </Box>
        <ArtistDetailsModal
          artist={selectedArtist}
          onClose={() => setSelectedArtist(null)}
        />
        {/* <ArtistEditDialog 
          open={popupOpen}
          onClose={() => setPopupOpen(false)}
          artist={selectedArtist}
          artists={allArtists}
          setArtists={setAllArtists}
          onSuccess={() => {
            setPopupOpen(false);
            setSelectedArtist(null);
          }}
        /> */}
        <CreateArtistDialog
          open={createArtistDialogOpen}
          onClose={() => setCreateArtistDialogOpen(false)}
          onSuccess={handleArtistDialogSuccess}
        />
      </Box>
    </AdminDashboard>
    </ThemeProvider>
  );
}

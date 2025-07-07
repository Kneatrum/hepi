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
  Typography 
} from "@mui/material";


import { Artist } from "@/app/types";
import AdminDashboard from "@/app/components/layout/AdminDashboard";
import CustomSearchField from "@/app/components/common/CustomFields/CustomSearchField";
import Spinner from "@/app/components/common/spinners/loading";
import InfoCard from "@/app/components/common/ui/InfoCard";
// import { useRouter } from "next/navigation";

// import ArtistEditDialog from "@/app/components/common/ui/ArtistEditDialog";
import CreateArtistDialog from "@/app/components/common/dialogs/CreateArtistDialog";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import ArtistDetailsModal from "@/app/components/common/ui/ArtistDetailsModal";

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
  const [allArtists, setAllArtists] = useState<Artist[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [createArtistDialogOpen, setCreateArtistDialogOpen] = useState(false);
  // const router = useRouter();
  // const [popupOpen, setPopupOpen] = useState(false);


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
      <Box className={styles.home} sx={{padding:"0px"}}>
        {/* Top Section */}
        <Box sx={{display:"flex", flexDirection:"column",gap:"20px"}}>
          <Box className={styles.layer}>
            <Box className={styles.layerTop}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Box className={styles.layerTopSearch}>
                  <CustomSearchField
                    placeholder="Search an artist."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </Box>

                <Box sx={{ paddingRight: "20px" }}>
                  <Button 
                    className="callToActionButton"
                    onClick={() => setCreateArtistDialogOpen(true)}
                  >
                  Create Artists
                  </Button>
                </Box>
              </Box>
             
              
            </Box>

          </Box>

          {/* Songs box */}
          { loading && (
            <Spinner />
          )}

          {!loading && filteredArtist.length === 0 ? (
            <Box className={styles.centerYX}>
              <InfoCard
                title="No artists found"
                description="Try searching with a different keyword or check back later."
              />
            </Box>
          )  : ( !loading && ( 
            <Box sx={{ height: "100%", overflow: "hidden", paddingRight: "0px" }}>
              {/* Suggested Singers */}
              <Box className={styles.gridContainer}>
                <TableContainer component={Paper} sx={{borderRadius: "0px"}}>
                  <Table sx={{ minWidth: 650 }} aria-label="countries table">
                    <TableHead >
                      <TableRow>
                        <TableCell></TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Country</TableCell>
                        <TableCell>Region</TableCell>
                        <TableCell>Culture</TableCell>
                      </TableRow>
                    </TableHead>
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
                          <TableCell component="th" scope="row">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {/* <AccountCircleIcon sx={{ color: "#FFEB3B", fontSize: '24px' }} /> */}
                              <Typography sx={{ fontWeight: 'bold', color: 'gray' }}>
                                {index + 1} 
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell component="th" scope="row">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {/* <AccountCircleIcon sx={{ color: "#FFEB3B", fontSize: '24px' }} /> */}
                              <Typography sx={{ fontWeight: 'bold', color: 'gray' }}>
                                {artist.name} 
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ color: '#fff' }}>
                              {artist.country.name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ color: '#fff' }}>
                              {artist.country.region}
                            </Typography>
                          </TableCell>
                          <TableCell>
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

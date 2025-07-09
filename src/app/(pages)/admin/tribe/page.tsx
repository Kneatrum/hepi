"use client"
import { useEffect, useState } from "react";
import styles from "../../../styles/page.module.css";
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
  Card, 
  CardContent,
  useMediaQuery,
  useTheme, 
} from "@mui/material";

import AdminDashboard from "@/app/components/layout/AdminDashboard";
import CustomSearchField from "@/app/components/common/CustomFields/CustomSearchField";
import Spinner from "@/app/components/common/spinners/loading";
import InfoCard from "@/app/components/common/ui/InfoCard";
// import AccountCircleIcon from '@mui/icons-material/AccountCircle';
// import { useRouter } from "next/navigation";
import { createTheme, ThemeProvider } from '@mui/material/styles';
// import { getAllUsers, FormattedUser } from "@/app/utils/fetchUsersUtils";
// import { useSession } from "@/app/context/SessionContext";
import  TribeEditDialog from "@/app/components/common/ui/TribeEditDialog";
import { Tribe } from "@/app/types";
import CreateTribeDialog from "@/app/components/common/dialogs/CreateTribeDialog";
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
  const [tribes, setTribes] = useState<Tribe[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedTribe, setSelectedTribe] = useState<Tribe | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    async function fetchTribes() {
      try {
        const res = await fetch(
          "https://music-backend-production-99a.up.railway.app/api/v1/tribes"
        );
        
        const data = await res.json();

        if (data) {
          setTribes(data);
          console.log("Tribes: ", data.content);
          setLoading(false);
        } 
      
      } catch (error) {
        console.error("Failed to fetch artists:", error);
      }
    }
  
    fetchTribes();
  }, []);

//   const router = useRouter();
//   const handleBackToArtistsClick = () => {
//     router.push("/admin/artists/create");
//   };

const handleTribeDialogSuccess = () => {
  console.log('New Tribe created');
  // Handle success (e.g., refresh list, show notification)
};

const handleTribeClick = (tribe: Tribe) => {
  setSelectedTribe(tribe);
  setPopupOpen(true);
}

  const filteredTribes = tribes.filter((tribe) =>
    tribe.name.toLowerCase().includes(searchQuery.toLowerCase()) 
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
                  Tribes
                </Typography>
                <Box  sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <CustomSearchField
                      placeholder="Search tribes by name."
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
                    onClick={() => setDialogOpen(true)}
                  >
                    Create Tribe
                  </Button>
                </Box>
              )}

              {/* Sticky Table Header for Desktop */}
              {!isMobile && !loading && filteredTribes.length > 0 && (
                <Table sx={{ minWidth: 650, tableLayout: "fixed" }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: "33.33%" }}>ID</TableCell>
                      <TableCell sx={{ width: "33.33%" }}>Name</TableCell>
                      <TableCell sx={{ width: "33.33%" }}>Description</TableCell>
                    </TableRow>
                  </TableHead>
                </Table>
              )}
            </Box>

            {/* Users Table */}
              {loading && (
                <Spinner />
              )}


              
              {!loading && filteredTribes.length === 0 && (
                <Box className={styles.centerYX}>
                  <InfoCard
                    title="No tribe found"
                    description="Try searching with a different keyword or check back later."
                  />
                </Box>
              )}
              
              
              {  !loading && filteredTribes.length > 0 && !isMobile && (
                  <Box sx={{ height: "100%", overflow: "hidden" }}>
                    <TableContainer component={Paper} sx={{ borderRadius: "0px" }}>
                      <Table sx={{ minWidth: 650, tableLayout: "fixed" }} aria-label="tribes table">
                        <TableBody>
                          {filteredTribes.map((tribe) => (
                            <TableRow
                              key={tribe.tribeId}
                              sx={{ 
                                '&:last-child td, &:last-child th': { border: 0 },
                                cursor: 'pointer'
                              }}
                              onClick={() => { handleTribeClick(tribe) }}
                            >
                              <TableCell component="th" scope="row">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {/* <AccountCircleIcon sx={{ color: "#FFEB3B", fontSize: '24px' }} /> */}
                                  <Typography sx={{ fontWeight: 'bold', color: 'yellow' }}>
                                    {tribe.tribeId} 
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography sx={{ color: '#fff' }}>
                                  {tribe.name}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography
                                  noWrap
                                  title={tribe.description || "No description available"}
                                  sx={{
                                    color: "#fff",
                                    maxWidth: "30ch", // Limit width to roughly 30 characters
                                  }}
                                >
                                  {tribe.description || "No description available"}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
              )}

              {!loading && filteredTribes.length > 0 && isMobile && (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      pb: 2,
                    }}
                  >
                  {filteredTribes.map((tribe) => (
                    <Card
                      key={tribe.tribeId}
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
                      onClick={() => handleTribeClick(tribe)}
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
                            label={tribe.tribeId}
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
                              {tribe.name}
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

                          <Box
                            sx={{
                              position: "absolute",
                              top: "16px",
                              right: "16px",
                            }}
                          >
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
                )}
          </Box>
        </Box>
        <TribeEditDialog 
            open={popupOpen}
            onClose={() => setPopupOpen(false)}
            tribe={selectedTribe}
            tribes={tribes}
            setTribes={setTribes}
            onSuccess={() => {
              setPopupOpen(false);
              setSelectedTribe(null);
            }}
        />
        <CreateTribeDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSuccess={handleTribeDialogSuccess}
        />
      </AdminDashboard>
    </ThemeProvider>
  );
}
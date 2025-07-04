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
  Button
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
  // const { accessToken } = useSession();
  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedTribe, setSelectedTribe] = useState<Tribe | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);


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

  const filteredTribes = tribes.filter((tribe) =>
    tribe.name.toLowerCase().includes(searchQuery.toLowerCase()) 
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
                      placeholder="Search tribes by name."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </Box>
                  <Box sx={{ paddingRight: "20px" }}>
                    <Button 
                      className="callToActionButton"
                      onClick={() => setDialogOpen(true)}
                    >
                      Add Tribe
                    </Button>
                  </Box>
                </Box>
              </Box>
              
            </Box>

            {/* Users Table */}
              {loading && (
                <Spinner />
              )}


              
              {!loading && filteredTribes.length === 0 ? (
                <Box className={styles.centerYX}>
                  <InfoCard
                    title="No tribe found"
                    description="Try searching with a different keyword or check back later."
                  />
                </Box>
              ) : (
                !loading && (
                  <Box sx={{ height: "100%", overflow: "hidden", paddingRight: "0px" }}>
                    <TableContainer component={Paper} sx={{borderRadius: "0px"}}>
                      <Table sx={{ minWidth: 650 }} aria-label="tribes table">
                        <TableHead >
                          <TableRow>
                              <TableCell></TableCell>
                              <TableCell>Name</TableCell>
                              <TableCell>Description</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredTribes.map((tribe) => (
                            <TableRow
                              key={tribe.tribeId}
                              sx={{ 
                                '&:last-child td, &:last-child th': { border: 0 },
                                cursor: 'pointer'
                              }}
                              onClick={() => {
                                setSelectedTribe(tribe);
                                setPopupOpen(true);
                              }}
                            >
                              <TableCell component="th" scope="row">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {/* <AccountCircleIcon sx={{ color: "#FFEB3B", fontSize: '24px' }} /> */}
                                  <Typography sx={{ fontWeight: 'bold', color: 'gray' }}>
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
                                <Typography sx={{ color: '#fff' }}>
                                  {tribe.description || "No description available"}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )
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
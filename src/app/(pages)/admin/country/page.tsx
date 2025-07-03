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
// import { useSession } from "@/app/context/SessionContext";
import  CountryEditDialog from "@/app/components/common/ui/CountryEditDialog";
import { Country } from "@/app/types";
import CreateCountryDialog from "@/app/components/common/dialogs/CreateCountryDialog";


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
  const [countries, setCountries] = useState<Country[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  // const { accessToken } = useSession();
  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchCountries() {
      try {
        const res = await fetch(
          "https://music-backend-production-99a.up.railway.app/api/v1/countries"
        );
        
        const data = await res.json();

        if (data) {
          setCountries(data.content || []);
          console.log("Countries: ", data.content);
          setLoading(false);
        } 
      
      } catch (error) {
        console.error("Failed to fetch artists:", error);
      }
    }
  
    fetchCountries();
  }, []);


  const handleCountryDialogSuccess = () => {
    console.log('New artist created');
    // Handle success (e.g., refresh list, show notification)
  };

  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) 
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
                    Countries
                  </Typography>
                  <Button 
                    className="callToActionButton"
                    onClick={() => setDialogOpen(true)}
                  >
                    Add Country
                  </Button>
                </Box>
              </Box>
              <Box className={styles.layerTopSearch}>
                <CustomSearchField
                  placeholder="Search countries by name."
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
              
              {!loading && filteredCountries.length === 0 ? (
                <Box className={styles.centerYX}>
                  <InfoCard
                    title="No tribe found"
                    description="Try searching with a different keyword or check back later."
                  />
                </Box>
              ) : (
                !loading && (
                  <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="countries table">
                      <TableHead >
                        <TableRow>
                            <TableCell></TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Country Code</TableCell>
                            <TableCell>Region</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredCountries.map((country) => (
                          <TableRow
                            key={country.name}
                            sx={{ 
                              '&:last-child td, &:last-child th': { border: 0 },
                              cursor: 'pointer'
                            }}
                            onClick={() => {
                              setSelectedCountry(country);
                              setPopupOpen(true);
                            }}
                          >
                            <TableCell component="th" scope="row">
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {/* <AccountCircleIcon sx={{ color: "#FFEB3B", fontSize: '24px' }} /> */}
                                <Typography sx={{ fontWeight: 'bold', color: 'gray' }}>
                                  {country.countryId} 
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography sx={{ color: '#fff' }}>
                                {country.name}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography sx={{ color: '#fff' }}>
                                {country.code}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography sx={{ color: '#fff' }}>
                                {country.region}
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
        <CountryEditDialog 
          open={popupOpen}
          onClose={() => setPopupOpen(false)}
          country={selectedCountry}
          countries={countries}
          setCountries={setCountries}
          onSuccess={() => {
            setPopupOpen(false);
            setSelectedCountry(null);
          }}
        />
        <CreateCountryDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSuccess={handleCountryDialogSuccess}
        />
      </AdminDashboard>
    </ThemeProvider>
  );
}
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
  Card, 
  CardContent, 
  Paper,
  useMediaQuery,
  useTheme, 
  Button,
  Chip,
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
  const [countries, setCountries] = useState<Country[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  // const { accessToken } = useSession();
  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

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

  const handleCountryClick = (country: Country) => {
    setSelectedCountry(country)
    setPopupOpen(true)
  }

  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) 
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
                      Countries
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <CustomSearchField
                          placeholder="Search countries by name"
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
                    Countries
                  </Typography>
                  <Box className={styles.layerTopSearch}>
                    <CustomSearchField
                      placeholder="Search an country"
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
                    Add country
                  </Button>
                  </Box>
                )}
              
                {/* Sticky Table Header for Desktop */}
                {!isMobile && !loading && filteredCountries.length > 0 && (
                  <Table sx={{ minWidth: 650, tableLayout: "fixed" }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ width: "25%" }} >ID</TableCell>
                        <TableCell sx={{ width: "25%" }} >Name</TableCell>
                        <TableCell sx={{ width: "25%" }} >Country Code</TableCell>
                        <TableCell sx={{ width: "25%" }} >Region</TableCell>
                      </TableRow>
                    </TableHead>
                  </Table>
                )}
            </Box>

            {/* Users Table */}
            {loading && (
              <Spinner />
            )}

            {!loading && filteredCountries.length === 0 && (
                <Box className={styles.centerYX}>
                  <InfoCard
                    title="No Countries found"
                    description="Try searching with a different keyword or check back later."
                  />
                </Box>
              )}
              
              { !loading && filteredCountries.length > 0 && !isMobile && (
                <Box sx={{ height: "100%", overflow: "hidden" }}>
                  <TableContainer component={Paper} sx={{borderRadius: "0px"}}>
                    <Table sx={{ minWidth: 650 }} aria-label="countries table">
                      <TableBody>
                        {filteredCountries.map((country) => (
                          <TableRow
                            key={country.name}
                            sx={{ 
                              '&:last-child td, &:last-child th': { border: 0 },
                              cursor: 'pointer'
                            }}
                            onClick={() => handleCountryClick(country)}
                          >
                            <TableCell component="th" scope="row" sx={{ width: "25%" }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {/* <AccountCircleIcon sx={{ color: "#FFEB3B", fontSize: '24px' }} /> */}
                                <Typography sx={{ fontWeight: 'bold', color: '#FFEB3B' }}>
                                  {country.countryId} 
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell component="th" scope="row" sx={{ width: "25%" }}>
                              <Typography sx={{ color: '#fff' }}>
                                {country.name}
                              </Typography>
                            </TableCell>
                            <TableCell component="th" scope="row" sx={{ width: "25%" }}>
                              <Chip
                                label={country.code}
                                size="small"
                                sx={{
                                  backgroundColor: "rgba(255, 235, 59, 0.2)",
                                  color: "#FFEB3B",
                                  fontWeight: "bold",
                                }}
                              />
                            </TableCell>
                            <TableCell component="th" scope="row" sx={{ width: "25%" }}>
                              <Typography sx={{ color: '#fff' }}>
                                {country.region}
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
              {!loading && filteredCountries.length > 0 && isMobile && (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    pb: 2,
                  }}
                >
                  {filteredCountries.map((country) => (
                    <Card
                      key={country.countryId}
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
                      onClick={() => handleCountryClick(country)}
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
                            label={country.countryId}
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
                              {country.name}
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
                            <Chip
                              label={country.code}
                              size="small"
                              sx={{
                                backgroundColor: "rgba(255, 235, 59, 0.2)",
                                color: "#FFEB3B",
                                fontWeight: "bold",
                                fontSize: "0.75rem",
                              }}
                            />
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
"use client"
import { useEffect, useState } from "react";
import styles from "../../../styles/page.module.css";
import { 
  Box, 
  // Button, 
  // Link, 
  Typography, 
  Chip, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  useMediaQuery,
  useTheme, 
  Card, 
  CardContent
} from "@mui/material";

import AdminDashboard from "@/app/components/layout/AdminDashboard";
import CustomSearchField from "@/app/components/common/CustomFields/CustomSearchField";
import Spinner from "@/app/components/common/spinners/loading";
import InfoCard from "@/app/components/common/ui/InfoCard";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { getAllUsers, FormattedUser } from "@/app/utils/fetchUsersUtils";
import { useSession } from "@/app/context/SessionContext";
import  UserPopup from "@/app/components/common/ui/UserPopup";


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
  const [users, setUsers] = useState<FormattedUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { accessToken } = useSession();
  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<FormattedUser | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    async function fetchUsers() {
      if (!accessToken) {
        console.log("Access token not available yet. Waiting for token...");
        // setLoading(false); // Optionally stop loading if you want to show a message
        return;
      }

      try {
        setLoading(true);
        const formattedUsers = await getAllUsers("https://music-backend-production-99a.up.railway.app/api/v1/users", accessToken);
        setUsers(formattedUsers);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        setUsers([]); 
      } finally {
        setLoading(false);
      }
    }
  
    fetchUsers();
    
  }, [accessToken]);

  // const router = useRouter();
  // const handleBackToArtistsClick = () => {
  //   router.push("/admin/artists/create");
  // };

  const filteredUsers = users.filter((user) =>
    user.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.lastname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusChip = (status: string) => {
    if (status === "ACTIVE") {
      return <Chip label={status}  size="small" sx={{ color: "black", backgroundColor: "yellow" }} />;
    } else if (status === "INACTIVE") {
      return <Chip label={status} variant="outlined" size="small" sx={{ color: "white", backgroundColor: "black" }} />;
    } else {
      return <Chip label={status} variant="outlined" size="small" sx={{ color: "white", backgroundColor: "black" }} />;
    }
  };

  const handleCountryClick = (user: FormattedUser) => {
    setSelectedUser(user)
    setPopupOpen(true)
  }

  const getRoleChip = (roleName: string) => {
    return (
      <Chip 
        label={roleName} 
        sx={{
          backgroundColor: '#FFEB3B',
          color: '#000000',
          fontWeight: 'bold',
          '&:hover': {
            backgroundColor: '#FFD700',
          }
        }}
        size="small"
      />
    );
  };

  return (
    <ThemeProvider theme={darkYellowTheme}>
      <AdminDashboard>
        <Box className={styles.home} sx={{padding:"0.625rem"}}>
          {/* Top Section */}
          <Box sx={{display:"flex", flexDirection:"column",gap:"20px"}}>
            <Box className={styles.layer}>
              <Box className={styles.layerTop}>
                <Box sx={{ width: "30%" }}>
                  <CustomSearchField
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                </Box>
              </Box>
            </Box>

            {/* Users Table */}
              { loading && (
                <Spinner />
              )}
              
              {!loading && filteredUsers.length === 0 && (
                <Box className={styles.centerYX}>
                  <InfoCard
                    title="No users found"
                    description="Try searching with a different keyword or check back later."
                  />
                </Box>
              ) }
              
              
                { !loading && filteredUsers.length > 0 &&  !isMobile && (
                  <Box sx={{ height: "100%", overflow: "hidden", paddingRight: "0px" }}>
                    <TableContainer component={Paper} sx={{ borderRadius: "0px"}}>
                      <Table sx={{ minWidth: 650 }} aria-label="users table">
                        <TableHead >
                          <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Name</TableCell>
                            {/* <TableCell>Email</TableCell> */}
                            {/* <TableCell>Phone Number</TableCell> */}
                            <TableCell>Role</TableCell>
                            <TableCell>Status</TableCell>
                            {/* <TableCell>Country</TableCell> */}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredUsers.map((user) => (
                            <TableRow
                              key={user.id}
                              sx={{ 
                                '&:last-child td, &:last-child th': { border: 0 },
                                cursor: 'pointer'
                              }}
                              onClick={() => {
                                setSelectedUser(user);
                                setPopupOpen(true);
                              }}
                            >
                              <TableCell component="th" scope="row">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography sx={{ fontWeight: 'bold', color: 'yellow' }}>
                                    {user.id}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell component="th" scope="row">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography sx={{ fontWeight: 'bold', color: '#fff' }}>
                                    {user.firstname} {user.lastname}
                                  </Typography>
                                </Box>
                              </TableCell>
                              {/* <TableCell>
                                <Typography sx={{ color: '#fff' }}>
                                  {user.email}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography sx={{ color: '#fff' }}>
                                  {user.userPhoneNumber}
                                </Typography>
                              </TableCell> */}
                              <TableCell>
                                {getRoleChip(user.roleName)}
                              </TableCell>
                              <TableCell>
                                {getStatusChip(user.roleStatus)}
                              </TableCell>
                              {/* <TableCell>
                                <Typography sx={{ color: '#fff' }}>
                                  {user.country || "Not specified"}
                                </Typography>
                              </TableCell> */}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}

                {!loading && filteredUsers.length > 0 && isMobile && (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      pb: 2,
                    }}
                  >
                  {filteredUsers.map((user) => (
                    <Card
                      key={user.id}
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
                      onClick={() => handleCountryClick(user)}
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
                            label={user.id}
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
                              {user.firstname} {user.lastname}
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
        <UserPopup 
          open={popupOpen}
          onClose={() => setPopupOpen(false)}
          user={selectedUser}
        />
      </AdminDashboard>
    </ThemeProvider>
  );
}
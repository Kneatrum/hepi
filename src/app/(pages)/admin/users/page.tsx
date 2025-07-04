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
  Paper 
} from "@mui/material";

import AdminDashboard from "@/app/components/layout/AdminDashboard";
import CustomSearchField from "@/app/components/common/CustomFields/CustomSearchField";
import Spinner from "@/app/components/common/spinners/loading";
import InfoCard from "@/app/components/common/ui/InfoCard";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
// import { useRouter } from "next/navigation";
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
      return <Chip label={status} color="success" size="small" />;
    } else if (status === "INACTIVE") {
      return <Chip label={status} color="warning" size="small" />;
    } else {
      return <Chip label={status} color="default" size="small" />;
    }
  };

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
        <Box className={styles.home} sx={{padding:"0px"}}>
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
              
              {!loading && filteredUsers.length === 0 ? (
                <Box className={styles.centerYX}>
                  <InfoCard
                    title="No users found"
                    description="Try searching with a different keyword or check back later."
                  />
                </Box>
              ) : (
                !loading && (
                  <Box sx={{ height: "100%", overflow: "hidden", paddingRight: "0px" }}>
                    <TableContainer component={Paper} sx={{ borderRadius: "0px"}}>
                      <Table sx={{ minWidth: 650 }} aria-label="users table">
                        <TableHead >
                          <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Phone Number</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Country</TableCell>
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
                                  <AccountCircleIcon sx={{ color: "#FFEB3B", fontSize: '24px' }} />
                                  <Typography sx={{ fontWeight: 'bold', color: '#fff' }}>
                                    {user.firstname} {user.lastname}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography sx={{ color: '#fff' }}>
                                  {user.email}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography sx={{ color: '#fff' }}>
                                  {user.userPhoneNumber}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                {getRoleChip(user.roleName)}
                              </TableCell>
                              <TableCell>
                                {getStatusChip(user.roleStatus)}
                              </TableCell>
                              <TableCell>
                                <Typography sx={{ color: '#fff' }}>
                                  {user.country || "Not specified"}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                ))}
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
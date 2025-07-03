import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Tabs,
  Tab,
  Box,
  Typography,
  TextField,
  Chip,
  IconButton,
  Paper,
  // Grid,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import { Close as CloseIcon, Person, Security, CheckCircle, Check, Cancel } from '@mui/icons-material';

// Types
interface Permission {
  id: number;
  name: string;
  description?: string;
}

interface FormattedUser {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  userPhoneNumber: string;
  country: string | null;
  roleCode: number;
  roleName: string;
  permissions: Permission[];
  roleShortDesc: string;
  roleDescription: string;
  roleStatus: string;
  forgotPassword: boolean | null;
  accountEnabled: boolean;
  accountNotExpired: boolean;
  accountNotLocked: boolean;
  credentialsNotExpired: boolean;
}

interface UserPopupProps {
  open: boolean;
  onClose: () => void;
  user: FormattedUser | null;
}

// Enhanced theme
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
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          backgroundColor: '#000000',
          color: '#FFEB3B',
          borderBottom: '2px solid #FFEB3B',
          padding: '20px 24px',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          backgroundColor: '#000000',
          borderBottom: '1px solid #333',
        },
        indicator: {
          backgroundColor: '#FFEB3B',
          height: '3px',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: '#ffffff',
          textTransform: 'none',
          fontSize: '16px',
          fontWeight: 500,
          padding: '16px 24px',
          '&.Mui-selected': {
            color: '#FFEB3B',
            fontWeight: 600,
          },
          '&:hover': {
            backgroundColor: 'rgba(255, 235, 59, 0.1)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#2a2a2a',
            borderRadius: '8px',
            '& fieldset': {
              borderColor: '#444',
            },
            // '&:hover fieldset': {
            //   borderColor: '#FFEB3B',
            // },
            '&.Mui-focused fieldset': {
              borderColor: '#FFEB3B',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#FFEB3B',
            '&.Mui-focused': {
              color: '#FFEB3B',
            },
          },
          '& .MuiOutlinedInput-input': {
            color: '#ffffff',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 235, 59, 0.2)',
          color: '#FFEB3B',
          border: '1px solid rgba(255, 235, 59, 0.3)',
          fontWeight: 500,
          '&:hover': {
            backgroundColor: 'rgba(255, 235, 59, 0.3)',
          },
        },
      },
    },
  },
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-tabpanel-${index}`}
      aria-labelledby={`user-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const UserPopup: React.FC<UserPopupProps> = ({ open, onClose, user }) => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (!user) return null;

  return (
    <ThemeProvider theme={darkYellowTheme}>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth={false}
        fullWidth={false}
        PaperProps={{
          sx: {
            width: '450px'
            // width: '800px', // Fixed width in pixels
            // height: '600px', // Fixed height in pixels
            // maxWidth: '90vw', // Responsive: max 90% of viewport width
            // maxHeight: '90vh', // Responsive: max 90% of viewport height
            // minWidth: '600px', // Minimum width
            // minHeight: '500px', // Minimum height
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '24px',
            fontWeight: 600,
            backgroundColor: '#FFEB3B',
            color: '#000000'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'black' }}>
            <Person sx={{ fontSize: 28 }} />
            User Details
          </Box>
          <IconButton
            onClick={onClose}
            sx={{ color: '#000000', '&:hover': { backgroundColor: 'rgba(20, 20, 19, 0.29)' } }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="user details tabs"
        >
          <Tab label="General" icon={<Person />} iconPosition="start" />
          <Tab label="Authentication" icon={<Security />} iconPosition="start" />
          <Tab label="Status" icon={<CheckCircle />} iconPosition="start" />
        </Tabs>

        <DialogContent 
          sx={{ 
            padding: 0, 
            backgroundColor: '#1a1a1a',
            height: '400px',
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column' 
          }}>
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: '#FFEB3B', 
                    fontWeight: 200,
                    fontSize: '18px',
                    width: '18%'
                  }}
                >
                Name:
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: 'gray', 
                    fontWeight: 200,
                    fontSize: '18px'
                  }}
                >
                  {user.firstname} {user.lastname}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3}}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: '#FFEB3B', 
                    fontWeight: 200,
                    fontSize: '18px',
                    width: '18%'
                  }}
                >
                  Email:
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: 'gray', 
                    fontWeight: 200,
                    fontSize: '18px'
                  }}
                >
                  {user.email}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3  }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: '#FFEB3B', 
                    fontWeight: 200,
                    fontSize: '18px',
                    width: '18%'
                  }}
                >
                  Phone:
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: 'grey', 
                    fontWeight: 200,
                    fontSize: '18px'
                  }}
                >
                  {user.userPhoneNumber}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3  }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: '#FFEB3B', 
                    fontWeight: 200,
                    fontSize: '18px',
                    width: '18%'
                  }}
                >
                  Country:
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: 'grey', 
                    alignContent: 'center',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 200,
                    fontSize: '18px'
                  }}
                >
                  {user.country || 'Not specified'}
                </Typography>
              </Box>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#FFEB3B', 
                  alignContent: 'center',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3, 
                  fontWeight: 200,
                  fontSize: '18px',
                  width: '30%'
                }}
              >
                Role Code:
              </Typography>
              <Chip
                label={user.roleCode}
                variant="outlined"
                sx={{
                  margin: '2px',
                  fontSize: '14px',
                  height: '32px',
                  width: '100px',
                  mb: 3,
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3  }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#FFEB3B', 
                  alignContent: 'center',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3, 
                  fontWeight: 200,
                  fontSize: '18px',
                  width: '30%'
                }}
              >
                Role Name:
              </Typography>
              <Chip
                // key={permission.id}
                label={user.roleName}
                variant="outlined"
                sx={{
                  margin: '2px',
                  fontSize: '14px',
                  height: '32px',
                  width: '100px',
                  mb: 3,
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, borderBottom: '1px solid rgba(255, 235, 59, 0.13)',  mb: 2 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#FFEB3B', 
                  alignContent: 'center',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 5, 
                  fontWeight: 200,
                  fontSize: '18px',
                  width: '30%'
                }}
              >
                Role Status:
              </Typography>
              <Chip
                label={user.roleStatus}
                variant="outlined"
                sx={{
                  margin: '2px',
                  fontSize: '14px',
                  height: '32px',
                  width: '100px',
                  mb: 5,
                }}
              />
            </Box>


            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'left', gap: 1, borderBottom: '1px solid rgba(255, 235, 59, 0.13)', mb: 2 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#FFEB3B', 
                  mb: 0, 
                  fontWeight: 200,
                  fontSize: '18px'
                }}
              >
                Short description:
              </Typography>
              <TextField
                value={user.roleShortDesc}
                fullWidth
                InputProps={{ readOnly: true }}
                multiline
                disabled={true}
                sx={{
                  mb: 4
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'left', gap: 1, borderBottom: '1px solid rgba(255, 235, 59, 0.13)', mb: 2 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#FFEB3B', 
                  mb: 0, 
                  fontWeight: 200,
                  fontSize: '18px'
                }}
              >
                Long description:
              </Typography>
              <TextField
                value={user.roleDescription}
                fullWidth
                InputProps={{ readOnly: true }}
                multiline
                disabled={true}
                sx={{
                  mb: 4
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'left', gap: 1, mb: 3 }}>
              <Typography 
                  variant="h6" 
                  sx={{ 
                    color: '#FFEB3B', 
                    fontWeight: 200,
                    fontSize: '18px'
                  }}
                >
                  Permissions
                </Typography>
                <Paper
                  sx={{
                    borderColor: '#444',
                    backgroundColor: '#2a2a2a',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '12px',
                    padding: '20px',
                    minHeight: '120px',
                    width: '100%',
                    mb: 3,
                  }}
                >
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {user.permissions.length > 0 ? (
                      user.permissions.map((permission) => (
                        <Chip
                          key={permission.id}
                          label={permission.name}
                          variant="outlined"
                          sx={{
                            margin: '2px',
                            fontSize: '14px',
                            height: '32px',
                          }}
                        />
                      ))
                    ) : (
                      <Typography 
                        sx={{ 
                          color: '#888', 
                          fontStyle: 'italic',
                          textAlign: 'center',
                          width: '100%',
                          paddingTop: '40px'
                        }}
                      >
                        No permissions assigned
                      </Typography>
                    )}
                  </Box>
                </Paper>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box sx={{ padding: '5px' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {user.forgotPassword ? (
                    <Check sx={{ color: '#FFEB3B', fontSize: 28 }} />
                  ) : (
                    <Cancel sx={{ color: 'transparent', stroke: '#FFEB3B', strokeWidth: 2, fontSize: 28 }} />
                  )}
                  <Typography sx={{ color: 'gray', fontSize: '16px', fontWeight: 500 }}>
                    Forgot Password
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {user.accountEnabled ? (
                    <Check sx={{ color: '#FFEB3B', fontSize: 28 }} />
                  ) : (
                    <Cancel sx={{ color: 'transparent', stroke: '#FFEB3B', strokeWidth: 2, fontSize: 28 }} />
                  )}
                  <Typography sx={{ color: 'gray', fontSize: '16px', fontWeight: 500 }}>
                    Account Enabled
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {user.accountNotExpired ? (
                    <Check sx={{ color: '#FFEB3B', fontSize: 28 }} />
                  ) : (
                    <Cancel sx={{ color: 'transparent', stroke: '#FFEB3B', strokeWidth: 2, fontSize: 28 }} />
                  )}
                  <Typography sx={{ color: 'gray', fontSize: '16px', fontWeight: 500 }}>
                    Account Not Expired
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {user.accountNotLocked ? (
                    <Check sx={{ color: '#FFEB3B', fontSize: 28 }} />
                  ) : (
                    <Cancel sx={{ color: 'transparent', stroke: '#FFEB3B', strokeWidth: 2, fontSize: 28 }} />
                  )}
                  <Typography sx={{ color: 'gray', fontSize: '16px', fontWeight: 500 }}>
                    Account Not Locked
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {user.credentialsNotExpired ? (
                    <Check sx={{ color: '#FFEB3B', fontSize: 28 }} />
                  ) : (
                    <Cancel sx={{ color: 'transparent', stroke: '#FFEB3B', strokeWidth: 2, fontSize: 28 }} />
                  )}
                  <Typography sx={{ color: 'gray', fontSize: '16px', fontWeight: 500 }}>
                    Credentials Not Expired
                  </Typography>
                </Box>

              </Box>
            </Box>
          </TabPanel>
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
};

export default UserPopup;
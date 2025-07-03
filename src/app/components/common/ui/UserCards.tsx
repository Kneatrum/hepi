import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Container,
  createTheme,
  ThemeProvider,
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Define the user interface based on your API response
interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  userStatus: string;
  userPhoneNumber: string;
  country: string | null;
  role: {
    roleName: string;
    roleDescription: string;
  };
}

interface ApiResponse {
  content: User[];
  totalElements: number;
}

// Create custom theme with dark primary and yellow secondary
const theme = createTheme({
  palette: {
    primary: {
      main: '#1a1a1a',
      dark: '#000000',
      light: '#333333',
    },
    secondary: {
      main: '#ffd700',
      dark: '#b8860b',
      light: '#ffeb3b',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
});

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  borderRadius: 12,
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
  },
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.secondary.main,
  color: theme.palette.primary.main,
  fontWeight: 'bold',
  '&.MuiChip-filled': {
    backgroundColor: theme.palette.secondary.main,
  },
}));

const UserCards: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/v1/users');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: ApiResponse = await response.json();
        setUsers(data.content);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress size={60} color="secondary" />
          </Box>
        </Container>
      </ThemeProvider>
    );
  }

  if (error) {
    return (
      <ThemeProvider theme={theme}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        </Container>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            color: theme.palette.primary.main,
            fontWeight: 'bold',
            textAlign: 'center',
            mb: 4,
          }}
        >
          User Directory
        </Typography>
        
        <Grid container spacing={3}>
          {users.map((user) => (
            <Grid item xs={12} sm={6} md={4} key={user.id}>
              <StyledCard>
                <CardContent sx={{ p: 3 }}>
                  {/* Header with name and status */}
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                      {user.firstname} {user.lastname}
                    </Typography>
                    <StyledChip
                      label={user.userStatus}
                      size="small"
                      variant="filled"
                    />
                  </Box>

                  {/* User details */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1, opacity: 0.9 }}>
                      <strong>Email:</strong> {user.email}
                    </Typography>
                    
                    <Typography variant="body2" sx={{ mb: 1, opacity: 0.9 }}>
                      <strong>Phone:</strong> {user.userPhoneNumber}
                    </Typography>
                    
                    <Typography variant="body2" sx={{ mb: 1, opacity: 0.9 }}>
                      <strong>Country:</strong> {user.country || 'Not specified'}
                    </Typography>
                  </Box>

                  {/* Role section */}
                  <Box
                    sx={{
                      backgroundColor: theme.palette.secondary.main,
                      color: theme.palette.primary.main,
                      p: 2,
                      borderRadius: 2,
                      mt: 2,
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                      Role: {user.role.roleName}
                    </Typography>
                    {user.role.roleDescription && user.role.roleDescription !== 'string' && (
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        {user.role.roleDescription}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>
          ))}
        </Grid>

        {users.length === 0 && (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="text.secondary">
              No users found
            </Typography>
          </Box>
        )}
      </Container>
    </ThemeProvider>
  );
};

export default UserCards;
"use client";
// import { useState } from 'react';
import { Card, CardContent, Typography, Button, Box, Avatar } from '@mui/material';
import { Artist } from '../../../types';
// import ArtistDetailsModal from './ArtistDetailsModal';

interface ArtistCardProps {
  artist: Artist;
}

const ArtistCard: React.FC<ArtistCardProps> = ({ artist }) => {
  // const [modalOpen, setModalOpen] = useState(false);

  // const handleOpenModal = () => setModalOpen(true);
  // const handleCloseModal = () => setModalOpen(false);

  return (
    <>
      <Card sx={{ 
        backgroundColor: 'background.default', 
        color: 'text.primary', 
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'secondary.main'
      }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar 
              src={artist.thumbnailUrl || '/default-image.png'} 
              alt={artist.name} 
              sx={{ width: 56, height: 56, mr: 2, bgcolor: 'secondary.main' }}
            />
            <Typography variant="h5" component="div" sx={{ color: 'text.secondary' }}>
              {artist.name}
            </Typography>
          </Box>

            <Box sx={{ mb: 1, display: 'flex', flexDirection: 'row' }}>
                <Typography color="text.secondary">
                    Region:
                </Typography>
                <Typography sx={{ ml: 1 }} color="text.primary">
                    {artist.country.region}
                </Typography>
            </Box>

            <Box sx={{ mb: 1, display: 'flex', flexDirection: 'row' }}> 
                <Typography color="text.secondary">
                    Country:
                </Typography>
                <Typography sx={{ ml: 1 }} color="text.primary">
                    {artist.country.name}
                </Typography>
            </Box>
            
            <Box sx={{ mb: 1, display: 'flex', flexDirection: 'row' }}>
                <Typography variant="body2" color="text.secondary">
                    Culture:
                </Typography>
                <Typography variant="body2" sx={{ mb: 1, ml: 1 }} color="text.primary">
                    {artist.tribe.name}
                </Typography>
            </Box>

          <Button 
            variant="contained" 
            // onClick={handleOpenModal} 
            sx={{ 
              backgroundColor: 'secondary.main', 
              color: 'primary.main',
              '&:hover': {
                backgroundColor: '#FFD700'
              }
            }}
          >
            View More
          </Button>
        </CardContent>
      </Card>
      {/* <ArtistDetailsModal artist={artist}  onClose={handleCloseModal} /> */}
    </>
  );
};

export default ArtistCard;
"use client";
import { Artist } from '../../../types';
import { Modal, Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface ArtistDetailsModalProps {
  artist: Artist | null;
  onClose: () => void;
}


const MODAL_MAX_HEIGHT = '80vh';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 700 }, // Responsive width
  bgcolor: 'background.paper',
  border: '1px solid',
  borderColor: 'secondary.main',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
  color: 'text.primary',
  maxHeight: MODAL_MAX_HEIGHT, 
  overflowY: 'auto',        
};

const ArtistDetailsModal: React.FC<ArtistDetailsModalProps> = ({ artist, onClose }) => {
  if (!artist) return null;

  return (
    
    <Box sx={style}>
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 4, alignItems: 'center' }}>
        {/* Image on the left */}
        <Box sx={{ flexShrink: 0, textAlign: { xs: 'center', sm: 'left' } }}>
          <Box
            component="img"
            src={artist.thumbnailUrl || '/default-image.png'}
            alt={artist.name}
            sx={{
              width: 250,
              height: 250,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '4px solid',
              borderColor: 'secondary.main',
              boxShadow: 3,
            }}
          />
        </Box>

        {/* Details on the right */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography id="artist-details-modal-title" variant="h4" component="h2" sx={{ color: 'text.primary', mb: 2, fontWeight: 'bold' }}>
            {artist.name}
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ color: 'secondary.main', fontWeight: 'bold' }}>
              Biography
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.primary', whiteSpace: 'pre-wrap' }}>
              {artist.biography || 'No biography available.'}
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ color: 'secondary.main', fontWeight: 'bold' }}>
              Country
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.primary' }}>
              {artist.country.name} ({artist.country.region})
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ color: 'secondary.main', fontWeight: 'bold' }}>
              Culture / Tribe
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.primary' }}>
              {artist.tribe.name}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle1" sx={{ color: 'secondary.main', fontWeight: 'bold' }}>
              Culture Description
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.primary', whiteSpace: 'pre-wrap' }}>
              {artist.tribe.description || 'No description available.'}
            </Typography>
          </Box>
        </Box>
      </Box>

    </Box>
  );
};

export default ArtistDetailsModal;
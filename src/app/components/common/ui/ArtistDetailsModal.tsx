"use client";
import { Artist } from '../../../types';
import { Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import XIcon from '@mui/icons-material/X';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import zIndex from '@mui/material/styles/zIndex';


interface ArtistDetailsModalProps {
  artist: Artist | null;
  onClose: () => void;
}


const MODAL_MAX_HEIGHT = '80vh';



const style = {
  position: "absolute",
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 700 }, // Responsive width
  bgcolor: 'background.paper',
  border: '1px solid',
  borderColor: 'secondary.main',
  borderRadius: 0,
  boxShadow: 24,
  p: 4,
  color: 'text.primary',
  maxHeight: MODAL_MAX_HEIGHT, 
  overflowY: 'auto',     
  zIndex: zIndex.drawer + 1,
   
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

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 4, alignItems: 'left' }}>
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

          <Box sx={{ mt: 3, textAlign: { xs: 'center', sm: 'left', backgroundColor: 'rgba(158, 157, 157, 0.16)', padding: "10px", borderRadius: '12px'}}}>
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'baseline', gap: 2 }}>
              <Typography variant="subtitle1" sx={{ color: 'secondary.main', minWidth: '50px' }}>
                Country:
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.primary' }}>
                {artist.country.name} ({artist.country.region})
              </Typography>
            </Box>

            <Box sx={{ mb: 2, display: 'flex', alignItems: 'baseline', gap: 2  }}>
              <Typography variant="subtitle1" sx={{ color: 'secondary.main', minWidth: '64px' }}>
                Tribe:
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.primary'}}>
                {artist.tribe.name}
              </Typography>
            </Box>
          </Box>


          <Box sx={{ mt: 3, textAlign: 'left', backgroundColor: 'rgba(158, 157, 157, 0.16)', padding: 2, borderRadius: '12px'}}>
            {artist.name}&apos;s social media
            <Box sx={{ display: 'flex', justifyContent: 'left', alignItems: 'center', gap: 2, mt: 2 }}>
              <IconButton component="a" href={`https://x.com/${artist.name.replace(/\s+/g, '')}`} target="_blank" rel="noopener noreferrer" sx={{ color: 'text.primary' }}>
                <XIcon />
              </IconButton>
              <IconButton component="a" href={`https://facebook.com/${artist.name.replace(/\s+/g, '')}`} target="_blank" rel="noopener noreferrer" sx={{ color: 'text.primary' }}>
                <FacebookIcon />
              </IconButton>
              <IconButton component="a" href={`https://instagram.com/${artist.name.replace(/\s+/g, '')}`} target="_blank" rel="noopener noreferrer" sx={{ color: 'text.primary' }}>
                <InstagramIcon />
              </IconButton>
            </Box>
          </Box>
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
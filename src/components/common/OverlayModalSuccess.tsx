import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Box, Typography, useTheme } from '@mui/material';
import { OpaqueButton } from './OpaqueButton';
import { CloseableOverlayProps } from './OverlayModal';

export const OverlayModalSuccess: React.FC<CloseableOverlayProps> = ({ handleCloseOverlay }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        top: '0',
        left: '0',
        display: 'flex',
        position: 'fixed',
        justifyContent: 'top',
        alignItems: 'center',
        zIndex: '10',
        flexWrap: 'wrap',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          flexDirection: 'column',
          marginTop: '23vh',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CheckCircleOutlineIcon sx={{ fontSize: '80px', color: theme.palette.primary.main }} />
        <Typography variant="h2" sx={{ margin: '12px' }}>
          Transaction submitted successfully!
        </Typography>
        <Typography variant="h5">View the transaction details.</Typography>
        <OpaqueButton
          onClick={handleCloseOverlay}
          palette={theme.palette.primary}
          sx={{
            margin: '6px',
            padding: '6px',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ padding: '6px', display: 'flex', flexDirection: 'row', height: '30px' }}>
            <Box sx={{ paddingRight: '12px', lineHeight: '100%' }}>Return</Box>
            <Box>
              <ArrowForwardIcon fontSize="inherit" />
            </Box>
          </Box>
        </OpaqueButton>
      </Box>
    </Box>
  );
};

import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Box, Typography, useTheme } from '@mui/material';
import { OpaqueButton } from './OpaqueButton';

export const WalletWarning = () => {
  const theme = useTheme();

  return (
    <OpaqueButton
      palette={theme.palette.warning}
      sx={{
        width: '100%',
        display: 'flex',
        padding: '12px',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingRight: '20px',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
        <InfoOutlinedIcon sx={{ marginRight: '6px' }} />
        <Typography variant="body2">
          No account connected. Please connect your wallet to use Blend.
        </Typography>
      </Box>
      <ArrowForwardIcon fontSize="inherit" />
    </OpaqueButton>
  );
};

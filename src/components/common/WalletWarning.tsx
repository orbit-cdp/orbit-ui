import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Alert, Box, Snackbar, Typography, useTheme } from '@mui/material';
import React from 'react';
import { useWallet } from '../../contexts/wallet';
import { OpaqueButton } from './OpaqueButton';

export const WalletWarning = () => {
  const theme = useTheme();
  const { connect, connected } = useWallet();
  const [openCon, setOpenCon] = React.useState(false);

  const handleSnackClose = () => {
    setOpenCon(false);
  };

  return (
    <>
      {connected ? (
        <Box></Box>
      ) : (
        <OpaqueButton
          onClick={() => {
            connect();
            setOpenCon(true);
          }}
          palette={theme.palette.warning}
          sx={{
            width: '100%',
            display: 'flex',
            margin: '6px',
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
      )}

      <Snackbar
        open={openCon}
        autoHideDuration={4000}
        onClose={handleSnackClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <Alert
          onClose={handleSnackClose}
          severity="success"
          sx={{
            backgroundColor: theme.palette.primary.opaque,
            alignItems: 'center',
            width: '100%',
          }}
        >
          Wallet connected.
        </Alert>
      </Snackbar>
    </>
  );
};

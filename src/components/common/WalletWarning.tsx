import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Alert, Box, Snackbar, Typography, useTheme } from '@mui/material';
import React, { useEffect } from 'react';
import { useWallet } from '../../contexts/wallet';
import { useStore } from '../../store/store';
import { toCompactAddress } from '../../utils/formatter';
import { OpaqueButton } from './OpaqueButton';
import { Row } from './Row';

export const WalletWarning = () => {
  const theme = useTheme();
  const { connect, connected, walletAddress } = useWallet();
  const isFunded = useStore((state) => state.isFunded);
  const loadUserData = useStore((state) => state.loadUserData);

  const [openCon, setOpenCon] = React.useState(false);
  const [openError, setOpenError] = React.useState(false);

  const handleConnectWallet = (successful: boolean) => {
    if (successful) {
      setOpenCon(true);
    } else {
      setOpenError(true);
    }
  };

  const handleSnackClose = () => {
    setOpenCon(false);
    setOpenError(false);
  };

  useEffect(() => {
    if (connected && !isFunded) {
      loadUserData(walletAddress);
      const refreshInterval = setInterval(async () => {
        await loadUserData(walletAddress);
      }, 3 * 1000);
      return () => clearInterval(refreshInterval);
    }
  }, [loadUserData, connected, isFunded, walletAddress]);

  return (
    <>
      {connected ? (
        isFunded === false ? (
          <Row
            sx={{
              background: theme.palette.warning.opaque,
              color: theme.palette.warning.main,
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
              margin: '6px',
              padding: '12px',
              paddingRight: '20px',
              borderRadius: '5px',
            }}
          >
            <InfoOutlinedIcon sx={{ marginRight: '6px' }} />
            <Typography variant="body2">
              The wallet address {toCompactAddress(walletAddress)} does not exist on the network.
              Please fund your account!
            </Typography>
          </Row>
        ) : (
          <></>
        )
      ) : (
        <OpaqueButton
          onClick={() => {
            connect(handleConnectWallet);
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
      <Snackbar
        open={openError}
        autoHideDuration={4000}
        onClose={handleSnackClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <Alert
          onClose={handleSnackClose}
          severity="error"
          sx={{
            backgroundColor: theme.palette.error.opaque,
            alignItems: 'center',
            width: '100%',
          }}
        >
          Unable to connect wallet.
        </Alert>
      </Snackbar>
    </>
  );
};

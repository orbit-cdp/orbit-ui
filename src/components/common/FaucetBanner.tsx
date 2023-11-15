import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import { Alert, Box, Snackbar, Typography, useTheme } from '@mui/material';
import React from 'react';
import { Asset, Transaction, xdr } from 'soroban-client';
import { useWallet } from '../../contexts/wallet';
import { useStore } from '../../store/store';
import { requiresTrustline } from '../../utils/horizon';
import { OpaqueButton } from './OpaqueButton';

interface FaucetBannerParams {
  poolId: string;
}

export const FaucetBanner = ({ poolId }: FaucetBannerParams) => {
  const theme = useTheme();
  const { faucet, connected, walletAddress } = useWallet();
  const [openCon, setOpenCon] = React.useState(false);
  const account = useStore((state) => state.account);
  const network = useStore((state) => state.network);
  const loadPoolData = useStore((state) => state.loadPoolData);

  const handleSnackClose = () => {
    setOpenCon(false);
  };
  const handleFaucet = async () => {
    if (connected) {
      const url = `https://ewqw4hx7oa.execute-api.us-east-1.amazonaws.com/getAssets?userId=${walletAddress}`;
      try {
        const resp = await fetch(url, { method: 'GET' });
        const txEnvelopeXDR = (await resp.json()) as { type: string; data: number[] };
        await faucet(
          new Transaction(
            xdr.TransactionEnvelope.fromXDR(Buffer.from(txEnvelopeXDR.data)),
            network.passphrase
          )
        );
        setOpenCon(true);
        loadPoolData(poolId, walletAddress, true);
      } catch (e) {
        console.error('Faucet Failed', e);
      }
    }
  };

  return (
    <>
      {(connected &&
        requiresTrustline(
          account,
          new Asset('USDC', 'GCDUQQ2LP2M32Q563YOJOG36KXO5T635FKSWG4IQWYFE2FQHMMQKYK3S')
        )) ||
      requiresTrustline(
        account,
        new Asset('BLND', 'GCDUQQ2LP2M32Q563YOJOG36KXO5T635FKSWG4IQWYFE2FQHMMQKYK3S')
      ) ? (
        <OpaqueButton
          onClick={() => {
            handleFaucet();
          }}
          palette={theme.palette.positive}
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
            <WaterDropOutlinedIcon sx={{ marginRight: '6px' }} />
            <Typography variant="body2">
              Tap the faucet to receive assets for the Blend private test network.
            </Typography>
          </Box>
          <ArrowForwardIcon fontSize="inherit" />
        </OpaqueButton>
      ) : (
        <></>
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
          Test network assets added to wallet.
        </Alert>
      </Snackbar>
    </>
  );
};

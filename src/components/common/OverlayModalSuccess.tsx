import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Box, Typography, useTheme } from '@mui/material';
import { TxStatus, useWallet } from '../../contexts/wallet';
import { LinkBox } from './LinkBox';
import { OpaqueButton } from './OpaqueButton';
import { PoolComponentProps } from './PoolComponentProps';

export const OverlayModalSuccess: React.FC<PoolComponentProps> = ({ poolId }) => {
  const theme = useTheme();
  const { txStatus } = useWallet();

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
          marginTop: '25vh',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CheckCircleOutlineIcon sx={{ fontSize: '80px', color: theme.palette.primary.main }} />
        <Typography variant="h2" sx={{ margin: '12px' }}>
          Transaction submitted successfully!
        </Typography>
        <Typography variant="h5">View the transaction details.</Typography>
        <LinkBox to={{ pathname: '/dashboard', query: { poolId: poolId } }} sx={{ margin: '12px' }}>
          <OpaqueButton
            onClick={() => (txStatus = TxStatus.NONE)}
            palette={theme.palette.primary}
            sx={{
              margin: '6px',
              padding: '6px',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box sx={{ padding: '6px', display: 'flex', flexDirection: 'row', height: '30px' }}>
              <Box sx={{ paddingRight: '12px', lineHeight: '100%' }}>Return to dashboard</Box>
              <Box>
                <ArrowForwardIcon fontSize="inherit" />
              </Box>
            </Box>
          </OpaqueButton>
        </LinkBox>
      </Box>
    </Box>
  );
};

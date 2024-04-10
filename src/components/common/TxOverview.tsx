import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Box, BoxProps, Typography } from '@mui/material';
import { SorobanRpc } from '@stellar/stellar-sdk';
import { useWallet } from '../../contexts/wallet';
import theme from '../../theme';
import { OpaqueButton } from './OpaqueButton';
export interface TxOverviewProps extends BoxProps {
  simResponse: SorobanRpc.Api.SimulateTransactionResponse | undefined;
  requiresRestore?: boolean;
}

export const TxOverview: React.FC<TxOverviewProps> = ({
  simResponse,
  children,
  requiresRestore,
}) => {
  const { restore } = useWallet();

  function handleRestore() {
    if (simResponse && SorobanRpc.Api.isSimulationRestore(simResponse)) {
      restore(simResponse);
    }
  }

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.palette.background.paper,
        zIndex: 12,
        borderRadius: '5px',
        '& .MuiAlert-message': {
          width: '100%',
        },
      }}
    >
      {requiresRestore ? (
        <Box
          sx={{
            width: '100%',
            padding: '12px',
            display: 'flex',
            borderRadius: '5px',
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              marginBottom: '12px',
              flexDirection: 'row',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <InfoOutlinedIcon
              sx={{
                color: theme.palette.warning.main,
                marginLeft: '12px',
              }}
            />
            <Typography
              variant="h5"
              sx={{
                paddingRight: '12px',
                paddingLeft: '12px',
                color: theme.palette.warning.main,
              }}
            >
              This transaction ran into expired entries that need to be restored before proceeding.
            </Typography>
          </Box>
          <OpaqueButton
            onClick={handleRestore}
            palette={theme.palette.warning}
            sx={{ width: '100%', marginRight: '12px', padding: '6px' }}
          >
            Restore
          </OpaqueButton>
        </Box>
      ) : (
        <>
          <Typography
            variant="h5"
            sx={{ marginLeft: '24px', marginBottom: '12px', marginTop: '12px' }}
          >
            Transaction Overview
          </Typography>
          {children}
        </>
      )}
    </Box>
  );
};

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Alert, AlertColor, Box, Typography } from '@mui/material';
import { SorobanRpc } from '@stellar/stellar-sdk';
import { useWallet } from '../../contexts/wallet';
import theme from '../../theme';
import { OpaqueButton } from './OpaqueButton';

export interface AnvilAlertProps {
  severity?: AlertColor;
  message?: string;
  extraContent?: React.ReactNode;
  simResponse?: SorobanRpc.Api.SimulateTransactionResponse;
}
export function AnvilAlert({ severity, message, extraContent, simResponse }: AnvilAlertProps) {
  const { restore } = useWallet();
  function handleRestore() {
    if (simResponse && SorobanRpc.Api.isSimulationRestore(simResponse)) {
      restore(simResponse);
    }
  }

  if (simResponse && SorobanRpc.Api.isSimulationRestore(simResponse)) {
    return (
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
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        gap: '1rem',
        flexDirection: 'column',
        '& .MuiAlert-message': {
          width: '100%',
        },
      }}
    >
      <Alert
        severity={severity}
        sx={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: !!extraContent ? 'start' : 'center',
          width: '100%',
        }}
      >
        <Typography variant="body2">{message || 'An error has ocurred'}</Typography>
        {!!extraContent && (
          <Box sx={{ display: 'flex', gap: '1rem', width: '100%', flexDirection: 'column' }}>
            {extraContent}
          </Box>
        )}
      </Alert>
    </Box>
  );
}

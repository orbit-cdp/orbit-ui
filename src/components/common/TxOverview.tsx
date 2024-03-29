import { ContractErrorType, parseError } from '@blend-capital/blend-sdk';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Alert, AlertColor, Box, BoxProps, Typography } from '@mui/material';
import { SorobanRpc } from 'stellar-sdk';
import { useWallet } from '../../contexts/wallet';
import theme from '../../theme';
import { OpaqueButton } from './OpaqueButton';
export interface TxOverviewProps extends BoxProps {
  isDisabled: boolean;
  disabledType: AlertColor | undefined;
  reason: string | undefined;
  simResponse: SorobanRpc.Api.SimulateTransactionResponse | undefined;
}

export interface SubmitError {
  isSubmitDisabled: boolean;
  isMaxDisabled: boolean;
  reason: string | undefined;
  disabledType: AlertColor | undefined;
}

export const TxOverview: React.FC<TxOverviewProps> = ({
  isDisabled,
  disabledType,
  reason,
  simResponse,
  children,
  sx,
  ...props
}) => {
  const { restore } = useWallet();
  const severity = disabledType ?? 'warning';
  const message = reason ?? 'Unable to process your transaction.';

  function handleRestore() {
    if (simResponse && SorobanRpc.Api.isSimulationRestore(simResponse)) {
      restore(simResponse);
    }
  }

  function displayError() {
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
    } else if (simResponse && SorobanRpc.Api.isSimulationError(simResponse)) {
      const error = parseError(simResponse);
      return (
        <Alert
          severity={'warning'}
          sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
        >
          <Typography variant="body2">{ContractErrorType[error.type]}</Typography>
        </Alert>
      );
    } else {
      return (
        <Alert
          severity={severity}
          sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
        >
          <Typography variant="body2">{message}</Typography>
        </Alert>
      );
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
      }}
    >
      {isDisabled ||
      (simResponse &&
        (SorobanRpc.Api.isSimulationError(simResponse) ||
          SorobanRpc.Api.isSimulationRestore(simResponse))) ? (
        displayError()
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

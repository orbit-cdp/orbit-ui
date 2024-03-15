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
  simulation?: SorobanRpc.Api.SimulateTransactionResponse;
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
  simulation,
  children,
  sx,
  ...props
}) => {
  const { restore } = useWallet();
  const severity = disabledType ?? 'warning';
  const message = reason ?? 'Unable to process your transaction.';

  function handleRestore() {
    if (simulation && SorobanRpc.Api.isSimulationRestore(simulation)) restore(simulation);
  }

  function checkError() {
    if (message === 'InvokeHostFunctionEntryArchived') {
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
  if (isDisabled) {
    return checkError();
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
      {isDisabled ? (
        checkError()
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

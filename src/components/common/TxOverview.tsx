import { Alert, AlertColor, Box, BoxProps, Typography } from '@mui/material';
import theme from '../../theme';

export interface TxOverviewProps extends BoxProps {
  isDisabled: boolean;
  disabledType: AlertColor | undefined;
  reason: string | undefined;
}

export const TxOverview: React.FC<TxOverviewProps> = ({
  isDisabled,
  disabledType,
  reason,
  children,
  sx,
  ...props
}) => {
  const severity = disabledType ?? 'warning';
  const message = reason ?? 'Unable to process your transaction.';
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
        <Alert
          severity={severity}
          sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
        >
          <Typography variant="body2">{message}</Typography>
        </Alert>
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

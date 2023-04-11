import { Box, CircularProgress, useTheme } from '@mui/material';
import { Icon } from '../common/Icon';
import { Row } from '../common/Row';
import { StackedText } from '../common/StackedText';

export const PositionOverview = () => {
  const theme = useTheme();

  return (
    <Row>
      <Box
        sx={{
          margin: '12px',
          marginTop: '24px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <StackedText
            title="Net APR"
            titleColor="inherit"
            text="28.888%"
            textColor="inherit"
            type="large"
          />
          <Icon
            src={'/icons/dashboard/net_apr.svg'}
            alt={`backstop size icon`}
            isCircle={false}
            sx={{ marginLeft: '18px' }}
          />
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginLeft: '48px',
          }}
        >
          <StackedText
            title="Borrow Capacity"
            titleColor="inherit"
            text="$88.668"
            textColor="inherit"
            type="large"
          />
          <CircularProgress
            sx={{ color: theme.palette.primary.main, marginLeft: '18px' }}
            size="30px"
            thickness={4.5}
            variant="determinate"
            value={75}
          />
        </Box>
      </Box>
    </Row>
  );
};

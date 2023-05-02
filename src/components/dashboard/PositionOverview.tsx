import { Box, CircularProgress, useTheme } from '@mui/material';
import { useStore } from '../../store/store';
import { toBalance, toPercentage } from '../../utils/formatter';
import { Icon } from '../common/Icon';
import { PoolComponentProps } from '../common/PoolComponentProps';
import { Row } from '../common/Row';
import { StackedText } from '../common/StackedText';

export const PositionOverview: React.FC<PoolComponentProps> = ({ poolId }) => {
  const theme = useTheme();

  const user_estimates = useStore((state) => state.user_est.get(poolId));

  const borrow_capacity = user_estimates
    ? user_estimates.e_collateral_base - user_estimates.e_liabilities_base
    : 0;
  const borrow_capacity_fill = user_estimates
    ? (user_estimates.e_liabilities_base / user_estimates.e_collateral_base) * 100
    : 100;

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
            title="Net APY"
            titleColor="inherit"
            text={toPercentage(user_estimates?.net_apy ?? 0)}
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
            text={`$${toBalance(borrow_capacity)}`}
            textColor="inherit"
            type="large"
          />
          <CircularProgress
            sx={{ color: theme.palette.primary.main, marginLeft: '18px' }}
            size="30px"
            thickness={4.5}
            variant="determinate"
            value={borrow_capacity_fill}
          />
        </Box>
      </Box>
    </Row>
  );
};

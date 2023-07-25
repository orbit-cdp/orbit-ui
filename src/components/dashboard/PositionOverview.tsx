import { Box, CircularProgress, useTheme } from '@mui/material';
import { useStore } from '../../store/store';
import { toBalance, toPercentage } from '../../utils/formatter';
import { Icon } from '../common/Icon';
import { PoolComponentProps } from '../common/PoolComponentProps';
import { Row } from '../common/Row';
import { StackedText } from '../common/StackedText';

export const PositionOverview: React.FC<PoolComponentProps> = ({ poolId }) => {
  const theme = useTheme();

  const poolUserEstimate = useStore((state) => state.pool_user_est.get(poolId));

  const borrow_capacity = poolUserEstimate
    ? poolUserEstimate.e_collateral_base - poolUserEstimate.e_liabilities_base
    : 0;
  const borrow_capacity_fill = poolUserEstimate
    ? (poolUserEstimate.e_liabilities_base / poolUserEstimate.e_collateral_base) * 100
    : 100;
  const net_apy = Number.isFinite(poolUserEstimate?.net_apy) ? poolUserEstimate?.net_apy : 0;

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
            text={toPercentage(net_apy)}
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

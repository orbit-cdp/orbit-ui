import { Box, Typography } from '@mui/material';
import { ViewType, useSettings } from '../../contexts';
import { useStore } from '../../store/store';
import { PoolComponentProps } from '../common/PoolComponentProps';
import { LendPositionCard } from './LendPositionCard';

export const LendPositionList: React.FC<PoolComponentProps> = ({ poolId }) => {
  const { viewType } = useSettings();
  const poolReserveEstimates = useStore((state) => state.pool_est.get(poolId)?.reserve_est);
  const userReserveEstimates = useStore(
    (state) => state.pool_user_est.get(poolId)?.reserve_estimates
  );
  const headerNum = viewType === ViewType.REGULAR ? 5 : 4;
  const headerWidth = `${(100 / headerNum).toFixed(2)}%`;
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        scrollbarColor: 'black grey',
        padding: '6px',
      }}
    >
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '6px',
          type: 'alt',
        }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ width: headerWidth }}>
          Asset
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ width: headerWidth }}
        >
          Balance
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ width: headerWidth }}
        >
          APY
        </Typography>
        <Box sx={{ width: headerWidth }} />
        {headerNum >= 5 && <Box sx={{ width: headerWidth }} />}
      </Box>
      {poolReserveEstimates ? (
        poolReserveEstimates.flatMap((reserve) => {
          let user_bal = userReserveEstimates?.get(reserve.id);
          if (user_bal && user_bal.supplied !== 0) {
            return [
              <LendPositionCard
                key={reserve.id}
                poolId={poolId}
                reserveData={reserve}
                userResData={user_bal}
              />,
            ];
          }
          return [];
        })
      ) : (
        <></>
      )}
    </Box>
  );
};

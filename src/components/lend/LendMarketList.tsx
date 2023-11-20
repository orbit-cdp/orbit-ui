import HelpOutline from '@mui/icons-material/HelpOutline';
import { Box, Tooltip, Typography } from '@mui/material';
import { useSettings, ViewType } from '../../contexts';
import { useStore } from '../../store/store';
import { PoolComponentProps } from '../common/PoolComponentProps';
import { LendMarketCard } from './LendMarketCard';

export const LendMarketList: React.FC<PoolComponentProps> = ({ poolId }) => {
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
          Wallet Balance
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ width: headerWidth }}
        >
          APY
        </Typography>
        {headerNum >= 5 && (
          <Box sx={{ display: 'flex', flexDirection: 'row' }}>
            <Typography variant="body2" color="text.secondary" align="center">
              Collateral Factor
            </Typography>
            <Tooltip
              title="The percent of this asset's value added to your borrow capacity."
              placement="top"
            >
              <HelpOutline
                sx={{
                  color: 'text.secondary',
                  width: '15px',
                  marginTop: '-4px',
                  marginLeft: '4px',
                }}
              />
            </Tooltip>
          </Box>
        )}

        <Box sx={{ width: headerWidth }} />
      </Box>
      {poolReserveEstimates ? (
        poolReserveEstimates.map((reserve) => (
          <LendMarketCard
            key={reserve.id}
            poolId={poolId}
            reserveData={reserve}
            balance={userReserveEstimates?.get(reserve.id)?.asset ?? 0}
          />
        ))
      ) : (
        <></>
      )}
    </Box>
  );
};

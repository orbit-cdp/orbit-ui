import { Box, Typography } from '@mui/material';
import { useSettings, ViewType } from '../../contexts';
import { useStore } from '../../store/store';
import { PoolComponentProps } from '../common/PoolComponentProps';
import { BorrowPositionCard } from './BorrowPositionCard';

export interface BorrowPositionAssetData {
  address: string;
  code: string;
  issuer: string;
  balance: number;
  apr: number;
  collateralFactor: number;
}

const tempBorrowPositionData: BorrowPositionAssetData[] = [
  {
    address: 'GBMOG6BSWQSBSASRMHHGR2NZCKXTCGH7W3CDCBJW5REBSKW5ZX5FERHI',
    code: 'USDC',
    issuer: 'circle.io',
    balance: 888_880,
    apr: 0.2888,
    collateralFactor: 0.85,
  },
  {
    address: 'GDYW2WXGVCHTPPY34D72CJBAUCHJTS4LRDAGERO72Z6MAHWXOZB3ZY47',
    code: 'ETH',
    issuer: 'starbridge.org',
    balance: 888_880,
    apr: 0.2888,
    collateralFactor: 0.75,
  },
];

export const BorrowPositionList: React.FC<PoolComponentProps> = ({ poolId }) => {
  const { viewType } = useSettings();
  const poolReserves = useStore((state) => state.reserve_est.get(poolId));
  const userReserves = useStore((state) => state.user_bal_est.get(poolId));

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
      {poolReserves ? (
        poolReserves.flatMap((reserve) => {
          let user_bal = userReserves?.get(reserve.id);
          if (user_bal && user_bal.borrowed !== 0) {
            return [
              <BorrowPositionCard
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

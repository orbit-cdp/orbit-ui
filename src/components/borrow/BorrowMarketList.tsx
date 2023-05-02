import { Box, Typography } from '@mui/material';
import { useSettings, ViewType } from '../../contexts';
import { useStore } from '../../store/store';
import { PoolComponentProps } from '../common/PoolComponentProps';
import { BorrowMarketCard } from './BorrowMarketCard';

export interface BorrowMarketAssetData {
  address: string;
  code: string;
  issuer: string;
  poolBalance: number;
  apr: number;
  borrowFactor: number;
}

const tempBorrowMarketData: BorrowMarketAssetData[] = [
  {
    address: 'GBMOG6BSWQSBSASRMHHGR2NZCKXTCGH7W3CDCBJW5REBSKW5ZX5FERHI',
    code: 'USDC',
    issuer: 'circle.io',
    poolBalance: 888_880,
    apr: 0.2888,
    borrowFactor: 0.8522,
  },
  {
    address: 'GDYW2WXGVCHTPPY34D72CJBAUCHJTS4LRDAGERO72Z6MAHWXOZB3ZY47',
    code: 'ETH',
    issuer: 'starbridge.org',
    poolBalance: 888_880,
    apr: 0.2888,
    borrowFactor: 0.7588,
  },
  {
    address: 'GCPM3THDWJ27W6SJAZSX6DHN3WKYP2QQ6Y2QVSK764XNPBF6P4FHQKVV',
    code: 'BTC',
    issuer: 'ultrastellar.com',
    poolBalance: 888_880,
    apr: 0.2888,
    borrowFactor: 0.588,
  },
];

export const BorrowMarketList: React.FC<PoolComponentProps> = ({ poolId }) => {
  const { viewType } = useSettings();

  const poolReserves = useStore((state) => state.reserve_est.get(poolId));

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
          Available
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ width: headerWidth }}
        >
          APR
        </Typography>
        {headerNum >= 5 && (
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ width: headerWidth }}
          >
            Liability Factor
          </Typography>
        )}

        <Box sx={{ width: headerWidth }} />
      </Box>
      {poolReserves ? (
        poolReserves.map((reserve) => (
          <BorrowMarketCard key={reserve.id} reserveData={reserve} poolId={poolId} />
        ))
      ) : (
        <></>
      )}
    </Box>
  );
};

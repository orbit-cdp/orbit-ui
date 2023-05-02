import { Box, Typography } from '@mui/material';
import { useSettings, ViewType } from '../../contexts';
import { useStore } from '../../store/store';
import { PoolComponentProps } from '../common/PoolComponentProps';
import { MarketsListItem } from './MarketsListItem';

export interface MarketsAssetData {
  address: string;
  code: string;
  issuer: string;
  lendTotal: number;
  borrowTotal: number;
  collateralFactor: number;
  liabilityFactor: number;
  aprLend: number;
  aprBorrow: number;
}

const tempMarketsData: MarketsAssetData[] = [
  {
    address: 'GBMOG6BSWQSBSASRMHHGR2NZCKXTCGH7W3CDCBJW5REBSKW5ZX5FERHI',
    code: 'USDC',
    issuer: 'circle.io',
    lendTotal: 888_880,
    borrowTotal: 865_886,
    collateralFactor: 0.85,
    liabilityFactor: 0.85,
    aprLend: 0.2888,
    aprBorrow: 0.2686,
  },
  {
    address: 'GDYW2WXGVCHTPPY34D72CJBAUCHJTS4LRDAGERO72Z6MAHWXOZB3ZY47',
    code: 'ETH',
    issuer: 'starbridge.org',
    lendTotal: 800_880,
    borrowTotal: 806_006,
    collateralFactor: 0.86,
    liabilityFactor: 0.66,
    aprLend: 0.2008,
    aprBorrow: 0.2866,
  },
  {
    address: 'GCPM3THDWJ27W6SJAZSX6DHN3WKYP2QQ6Y2QVSK764XNPBF6P4FHQKVV',
    code: 'BTC',
    issuer: 'ultrastellar.com',
    lendTotal: 800_600,
    borrowTotal: 869_006,
    collateralFactor: 0.68,
    liabilityFactor: 0.88,
    aprLend: 0.2008,
    aprBorrow: 0.2606,
  },
];

export const MarketsList: React.FC<PoolComponentProps> = ({ poolId }) => {
  const { viewType } = useSettings();

  const poolReserves = useStore((state) => state.reserve_est.get(poolId));

  const headerNum = viewType == ViewType.REGULAR ? 6 : 3;
  const headerWidth = `${(100 / headerNum).toFixed(2)}%`;
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        scrollbarColor: 'black grey',
        padding: '6px',
        marginTop: '12px',
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
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ width: headerWidth, marginRight: '12px' }}
        >
          Asset
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ width: headerWidth }}
        >
          Total Lent
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ width: headerWidth }}
        >
          Total Borrowed
        </Typography>
        {headerNum >= 6 && (
          <>
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ width: headerWidth }}
            >
              Collateral Factor
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ width: headerWidth }}
            >
              Liability Factor
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ width: headerWidth }}
            >
              APR
            </Typography>
          </>
        )}
      </Box>
      {poolReserves ? (
        poolReserves.map((reserve) => <MarketsListItem key={reserve.id} reserveData={reserve} />)
      ) : (
        <></>
      )}
    </Box>
  );
};

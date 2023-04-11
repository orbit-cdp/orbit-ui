import { Box, Typography } from '@mui/material';
import { useSettings, ViewType } from '../../contexts';
import { MarketsTable } from './MarketsTable';

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

export const MarketsList = () => {
  const { viewType } = useSettings();

  const headerNum = 6;
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
      {viewType === ViewType.REGULAR && (
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
        </Box>
      )}
      {viewType !== ViewType.REGULAR && (
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
          <Typography variant="body2" color="text.secondary" sx={{ width: '33.33%' }}>
            Asset
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ width: 'headerWidth + (headerWidth*(headerNum/2))' }}
          >
            Total Lent
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ width: 'headerWidth + (headerWidth*(headerNum/2))' }}
          >
            Total Borrowed
          </Typography>
        </Box>
      )}
      {tempMarketsData.map((AssetData) => (
        <MarketsTable assetData={AssetData} key={AssetData.address} />
      ))}
    </Box>
  );
};

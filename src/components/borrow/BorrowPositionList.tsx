import { Box, Typography } from '@mui/material';
import { useSettings, ViewType } from '../../contexts';
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

export const BorrowPositionList = () => {
  const { viewType } = useSettings();

  const headerNum = 5;
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
            APR
          </Typography>
          <Box sx={{ width: headerWidth }} />
          <Box sx={{ width: headerWidth }} />
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
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ width: 'headerWidth + (headerWidth/headerNum)' }}
          >
            Asset
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ width: 'headerWidth + (headerWidth/headerNum)' }}
          >
            Balance
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ width: 'headerWidth + (headerWidth/headerNum)' }}
          >
            APR
          </Typography>
          <Box sx={{ width: 'headerWidth + (headerWidth/headerNum)' }} />
        </Box>
      )}
      {tempBorrowPositionData.map((borrowAssetData) => (
        <BorrowPositionCard assetData={borrowAssetData} key={borrowAssetData.address} />
      ))}
    </Box>
  );
};

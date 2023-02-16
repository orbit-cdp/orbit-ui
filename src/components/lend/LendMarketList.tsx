import { Box, Typography } from '@mui/material';
import { useSettings, ViewType } from '../../contexts';
import { LendMarketCard } from './LendMarketCard';

export interface LendMarketAssetData {
  address: string;
  code: string;
  issuer: string;
  balance: number;
  apr: number;
  collateralFactor: number;
}

const tempLendMarketData: LendMarketAssetData[] = [
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
  {
    address: 'GCPM3THDWJ27W6SJAZSX6DHN3WKYP2QQ6Y2QVSK764XNPBF6P4FHQKVV',
    code: 'BTC',
    issuer: 'ultrastellar.com',
    balance: 888_880,
    apr: 0.2888,
    collateralFactor: 0.5,
  },
];

export const LendMarketList = () => {
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
            Wallet Balance
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ width: headerWidth }}
          >
            APR
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ width: headerWidth }}
          >
            Collateral Factor
          </Typography>
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
            Wallet Balance
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
      {tempLendMarketData.map((lendAssetData) => (
        <LendMarketCard assetData={lendAssetData} key={lendAssetData.address} />
      ))}
    </Box>
  );
};

import { Box, Typography } from '@mui/material';
import { useSettings } from '../../contexts';
import { BackstopEarningsRow } from './BackstopEarningsRow';

export interface EarningsAssetData {
  address: string;
  code: string;
  issuer: string;
  amount: number;
}

const tempEarningsData: EarningsAssetData[] = [
  {
    address: 'GBMOG6BSWQSBSASRMHHGR2NZCKXTCGH7W3CDCBJW5REBSKW5ZX5FERHI',
    code: 'USDC',
    issuer: 'circle.io',
    amount: 888_880,
  },
  {
    address: 'GDYW2WXGVCHTPPY34D72CJBAUCHJTS4LRDAGERO72Z6MAHWXOZB3ZY47',
    code: 'ETH',
    issuer: 'starbridge.org',
    amount: 800_880,
  },
  {
    address: 'GCPM3THDWJ27W6SJAZSX6DHN3WKYP2QQ6Y2QVSK764XNPBF6P4FHQKVV',
    code: 'BTC',
    issuer: 'ultrstellar.com',
    amount: 800_600,
  },
];

export const BackstopEarningsList = () => {
  const { viewType } = useSettings();

  const headerNum = 2;
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
          Amount
        </Typography>
      </Box>
      {tempEarningsData.map((AssetData) => (
        <BackstopEarningsRow assetData={AssetData} key={AssetData.address} />
      ))}
    </Box>
  );
};

import { Box, BoxProps, Typography, useTheme } from '@mui/material';
import { useSettings } from '../../contexts';
import * as formatter from '../../utils/formatter';
import { TokenHeader } from '../common/TokenHeader';
import { EarningsAssetData } from './BSEarningsList';

export interface BSEarningsTableProps extends BoxProps {
  assetData: EarningsAssetData;
}

export const BSEarningsTable: React.FC<BSEarningsTableProps> = ({ assetData, sx, ...props }) => {
  const theme = useTheme();
  const { viewType } = useSettings();

  const tableNum = 2;
  const tableWidth = `${(100 / tableNum).toFixed(2)}%`;
  return (
    <Box
      sx={{
        type: 'alt',
        display: 'flex',
        width: '100%',
        padding: '6px',
        marginBottom: '12px',
        borderRadius: '5px',
        justifyContent: 'space-between',
        '&:hover': {
          background: theme.palette.menu.light,
        },
        ...sx,
      }}
      {...props}
    >
      <TokenHeader
        code={assetData.code}
        issuer={assetData.issuer}
        sx={{ width: tableWidth, marginRight: '12px' }}
      />
      <Box
        sx={{
          width: tableWidth,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography variant="body1">{formatter.toBalance(assetData.amount)}</Typography>
      </Box>
    </Box>
  );
};

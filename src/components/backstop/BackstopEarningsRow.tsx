import { Box, BoxProps, Typography, useTheme } from '@mui/material';
import { useSettings } from '../../contexts';
import * as formatter from '../../utils/formatter';
import { TokenHeader } from '../common/TokenHeader';
import { EarningsAssetData } from './BackstopEarningsList';

export interface BackstopEarningsRowProps extends BoxProps {
  assetData: EarningsAssetData;
}

export const BackstopEarningsRow: React.FC<BackstopEarningsRowProps> = ({
  assetData,
  sx,
  ...props
}) => {
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
        ...sx,
      }}
      {...props}
    >
      <TokenHeader id={'temp'} sx={{ width: tableWidth, marginRight: '12px' }} />
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

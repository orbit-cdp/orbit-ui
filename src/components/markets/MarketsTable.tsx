import { Box, BoxProps, Typography, useTheme } from '@mui/material';
import { useSettings } from '../../contexts';
import * as formatter from '../../utils/formatter';
import { TokenHeader } from '../common/TokenHeader';
import { MarketsAssetData } from './MarketsList';
import { StackedApr } from './StackedApr';

export interface MarketsTableProps extends BoxProps {
  assetData: MarketsAssetData;
}

export const MarketsTable: React.FC<MarketsTableProps> = ({ assetData, sx, ...props }) => {
  const theme = useTheme();
  const { viewType } = useSettings();

  const tableNum = 6;
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
        <Typography variant="body1">{formatter.toBalance(assetData.lendTotal)}</Typography>
      </Box>
      <Box
        sx={{
          width: tableWidth,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography variant="body1">{formatter.toBalance(assetData.borrowTotal)}</Typography>
      </Box>
      <Box
        sx={{
          width: tableWidth,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography variant="body1">
          {formatter.toPercentage(assetData.collateralFactor)}
        </Typography>
      </Box>
      <Box
        sx={{
          width: tableWidth,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography variant="body1">{formatter.toPercentage(assetData.liabilityFactor)}</Typography>
      </Box>
      <Box
        sx={{
          width: tableWidth,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <StackedApr
          aprLend={formatter.toPercentage(assetData.aprLend)}
          aprBorrow={formatter.toPercentage(assetData.aprBorrow)}
        ></StackedApr>
      </Box>
    </Box>
  );
};

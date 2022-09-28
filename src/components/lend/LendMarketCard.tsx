import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Box, BoxProps, Typography, useTheme } from '@mui/material';
import { useSettings } from '../../contexts';
import * as formatter from '../../utils/formatter';
import { CustomButton } from '../common/CustomButton';
import { SectionBase } from '../common/SectionBase';
import { TokenHeader } from '../common/TokenHeader';
import { LendMarketAssetData } from './LendMarketList';

export interface LendMarketCardProps extends BoxProps {
  assetData: LendMarketAssetData;
}

export const LendMarketCard: React.FC<LendMarketCardProps> = ({ assetData, sx, ...props }) => {
  const theme = useTheme();
  const { viewType } = useSettings();

  const tableNum = 5;
  const tableWidth = `${(100 / tableNum).toFixed(2)}%`;
  return (
    <SectionBase
      sx={{
        type: 'alt',
        display: 'flex',
        width: '100%',
        padding: '6px',
        marginBottom: '12px',
        ...sx,
      }}
      {...props}
    >
      <CustomButton
        sx={{
          width: '100%',
          '&:hover': {
            color: theme.palette.lend.main,
          },
        }}
      >
        <TokenHeader code={assetData.code} issuer={assetData.issuer} sx={{ width: tableWidth }} />
        <Box
          sx={{
            width: tableWidth,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Typography variant="body1">{formatter.toBalance(assetData.balance)}</Typography>
        </Box>
        <Box
          sx={{
            width: tableWidth,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Typography variant="body1">{formatter.toPercentage(assetData.apr)}</Typography>
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
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          <ArrowForwardIcon fontSize="inherit" />
        </Box>
      </CustomButton>
    </SectionBase>
  );
};

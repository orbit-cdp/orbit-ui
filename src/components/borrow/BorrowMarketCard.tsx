import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Box, BoxProps, Typography, useTheme } from '@mui/material';
import { useSettings, ViewType } from '../../contexts';
import * as formatter from '../../utils/formatter';
import { CustomButton } from '../common/CustomButton';
import { LinkBox } from '../common/LinkBox';
import { SectionBase } from '../common/SectionBase';
import { TokenHeader } from '../common/TokenHeader';
import { BorrowMarketAssetData } from './BorrowMarketList';

export interface BorrowMarketCardProps extends BoxProps {
  assetData: BorrowMarketAssetData;
}

export const BorrowMarketCard: React.FC<BorrowMarketCardProps> = ({ assetData, sx, ...props }) => {
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
      <LinkBox sx={{ width: '100%' }} to={{ pathname: '/borrow', query: { poolId: 'poolId' } }}>
        {viewType === ViewType.REGULAR && (
          <CustomButton
            sx={{
              width: '100%',
              '&:hover': {
                color: theme.palette.borrow.main,
              },
            }}
          >
            <TokenHeader
              code={assetData.code}
              issuer={assetData.issuer}
              sx={{ width: tableWidth }}
            />
            <Box
              sx={{
                width: tableWidth,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Typography variant="body1">{formatter.toBalance(assetData.poolBalance)}</Typography>
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
                {formatter.toPercentage(assetData.borrowFactor)}
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
        )}
        {viewType !== ViewType.REGULAR && (
          <CustomButton
            sx={{
              width: '100%',
              '&:hover': {
                color: theme.palette.borrow.main,
              },
            }}
          >
            <TokenHeader code={assetData.code} issuer="" sx={{ width: '25%' }} />
            <Box
              sx={{
                width: 'tableWidth + (tableWidth/tableNum)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Typography variant="body1">{formatter.toBalance(assetData.poolBalance)}</Typography>
            </Box>
            <Box
              sx={{
                width: 'tableWidth + (tableWidth/tableNum)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Typography variant="body1">{formatter.toPercentage(assetData.apr)}</Typography>
            </Box>
            <Box
              sx={{
                width: 'tableWidth + (tableWidth/tableNum)',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
              }}
            >
              <ArrowForwardIcon fontSize="inherit" />
            </Box>
          </CustomButton>
        )}
      </LinkBox>
    </SectionBase>
  );
};

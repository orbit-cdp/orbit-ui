import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Box, BoxProps, Typography, useTheme } from '@mui/material';
import { useSettings, ViewType } from '../../contexts';
import * as formatter from '../../utils/formatter';
import { CustomButton } from '../common/CustomButton';
import { LinkBox } from '../common/LinkBox';
import { SectionBase } from '../common/SectionBase';
import { TokenHeader } from '../common/TokenHeader';
import { BorrowPositionAssetData } from './BorrowPositionList';

export interface BorrowPositionCardProps extends BoxProps {
  assetData: BorrowPositionAssetData;
}

export const BorrowPositionCard: React.FC<BorrowPositionCardProps> = ({
  assetData,
  sx,
  ...props
}) => {
  const theme = useTheme();
  const { viewType } = useSettings();

  const tableNum = 5;
  const tableWidth = `${(100 / tableNum).toFixed(2)}%`;
  return (
    <SectionBase
      type="alt"
      sx={{
        display: 'flex',
        width: '100%',
        marginBottom: '12px',
        ...sx,
      }}
      {...props}
    >
      <LinkBox sx={{ width: '100%' }} to={{ pathname: '/repay', query: { poolId: 'poolId' } }}>
        {viewType === ViewType.REGULAR && (
          <CustomButton
            sx={{
              width: '100%',
              padding: '12px',
              backgroundColor: theme.palette.background.default,
              '&:hover': {
                color: theme.palette.borrow.main,
              },
            }}
          >
            <TokenHeader code={assetData.code} issuer="" sx={{ width: tableWidth }} />
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
            <Box sx={{ width: tableWidth }} />
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
              padding: '12px',
              '&:hover': {
                color: theme.palette.borrow.main,
              },
            }}
          >
            <TokenHeader code={assetData.code} issuer="" sx={{ width: tableWidth }} />
            <Box
              sx={{
                width: 'tableWidth + (tableWidth/tableNum)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Typography variant="body1">{formatter.toBalance(assetData.balance)}</Typography>
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

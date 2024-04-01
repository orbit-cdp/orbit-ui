import { PoolUser, Reserve } from '@blend-capital/blend-sdk';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Box, Typography, useTheme } from '@mui/material';
import { ViewType, useSettings } from '../../contexts';
import * as formatter from '../../utils/formatter';
import { getEmissionsPerDayPerUnit } from '../../utils/token';
import { FlameIcon } from '../common/FlameIcon';
import { LinkBox } from '../common/LinkBox';
import { OpaqueButton } from '../common/OpaqueButton';
import { PoolComponentProps } from '../common/PoolComponentProps';
import { TokenHeader } from '../common/TokenHeader';

export interface LendPositionCardProps extends PoolComponentProps {
  reserve: Reserve;
  userPoolData: PoolUser;
}

export const LendPositionCard: React.FC<LendPositionCardProps> = ({
  poolId,
  reserve,
  userPoolData,
  sx,
  ...props
}) => {
  const theme = useTheme();
  const { viewType } = useSettings();

  const userSupplyEst = userPoolData.positionEstimates.supply.get(reserve.assetId);
  const userCollatEst = userPoolData.positionEstimates.collateral.get(reserve.assetId);
  const totalSupplyEst = userSupplyEst ?? 0 + (userCollatEst ?? 0);

  const tableNum = viewType === ViewType.REGULAR ? 5 : 4;
  const tableWidth = `${(100 / tableNum).toFixed(2)}%`;
  const buttonWidth = `${((100 / tableNum) * 1.5).toFixed(2)}%`;
  return (
    <Box sx={{ width: '100%', display: 'flex' }}>
      <TokenHeader iconSize="24px" hideDomain id={reserve.assetId} sx={{ width: tableWidth }} />
      <Box
        sx={{
          width: tableWidth,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography variant="body1">{formatter.toBalance(totalSupplyEst)}</Typography>
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
          {formatter.toPercentage(reserve.estimates.supplyApy)}
        </Typography>
        {!!reserve.supplyEmissions && (
          <FlameIcon
            width={22}
            height={22}
            title={formatter.getEmissionTextFromValue(
              getEmissionsPerDayPerUnit(
                reserve.supplyEmissions?.config.eps || BigInt(0),
                reserve.estimates.supplied,
                reserve.config.decimals
              ),
              reserve.tokenMetadata.symbol
            )}
          />
        )}
      </Box>
      {/* {tableNum >= 5 && <Box sx={{ width: tableWidth }} />} */}
      <LinkBox
        to={{ pathname: '/withdraw', query: { poolId: poolId, assetId: reserve.assetId } }}
        sx={{
          display: 'flex',
          justifyContent: 'end',
          marginLeft: 'auto',
          // flexGrow: 1,
          alignItems: 'center',
          width: buttonWidth,
        }}
      >
        <OpaqueButton
          palette={theme.palette.lend}
          sx={{
            width: '100%',
            margin: '6px',
            padding: '6px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          Withdraw
          <ArrowForwardIcon fontSize="inherit" />
        </OpaqueButton>
      </LinkBox>
    </Box>
  );
};

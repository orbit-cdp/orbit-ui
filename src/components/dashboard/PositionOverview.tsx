import { PoolClaimArgs } from '@blend-capital/blend-sdk';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Box, useTheme } from '@mui/material';
import { ViewType, useSettings } from '../../contexts';
import { useWallet } from '../../contexts/wallet';
import { useStore } from '../../store/store';
import { toBalance, toPercentage } from '../../utils/formatter';
import { CustomButton } from '../common/CustomButton';
import { FlameIcon } from '../common/FlameIcon';
import { Icon } from '../common/Icon';
import { LinkBox } from '../common/LinkBox';
import { PoolComponentProps } from '../common/PoolComponentProps';
import { Row } from '../common/Row';
import { StackedText } from '../common/StackedText';
import { BorrowCapRing } from './BorrowCapRing';

export const PositionOverview: React.FC<PoolComponentProps> = ({ poolId }) => {
  const { viewType } = useSettings();
  const theme = useTheme();
  const { connected, walletAddress, poolClaim } = useWallet();

  const userPoolData = useStore((state) => state.userPoolData.get(poolId));
  const loadBlendData = useStore((state) => state.loadBlendData);

  const borrow_capacity = userPoolData?.positionEstimates?.borrowCap;
  const net_apy = Number.isFinite(userPoolData?.positionEstimates?.netApy)
    ? userPoolData?.positionEstimates?.netApy
    : 0;

  const handleSubmitTransaction = async () => {
    if (connected && userPoolData) {
      let reserves_to_claim = Array.from(userPoolData.emissions.entries()).map(
        (emission) => emission[0]
      );
      if (reserves_to_claim.length > 0) {
        let claimArgs: PoolClaimArgs = {
          from: walletAddress,
          reserve_token_ids: reserves_to_claim,
          to: walletAddress,
        };
        await poolClaim(poolId, claimArgs, false);
        await loadBlendData(true, poolId, walletAddress);
      }
    }
  };

  return (
    <>
      {viewType === ViewType.REGULAR && (
        <Row sx={{ padding: '0px 12px' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              width: '50%',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <StackedText
                title="Net APY"
                titleColor="inherit"
                text={toPercentage(net_apy)}
                textColor="inherit"
                type="large"
              />
              <Icon
                src={'/icons/dashboard/net_apr.svg'}
                alt={`backstop size icon`}
                isCircle={false}
                sx={{ marginLeft: '18px' }}
              />
            </Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginLeft: 'auto',
              }}
            >
              <StackedText
                title="Borrow Capacity"
                titleColor="inherit"
                text={`$${toBalance(borrow_capacity)}`}
                textColor="inherit"
                type="large"
              />
              <BorrowCapRing poolId={poolId} />
            </Box>
          </Box>
          <Box sx={{ width: '45%', display: 'flex' }}>
            <CustomButton
              sx={{
                width: '100%',
                padding: '12px',
                color: theme.palette.text.primary,
                backgroundColor: theme.palette.background.paper,
                '&:hover': {
                  color: theme.palette.primary.main,
                },
              }}
              onClick={handleSubmitTransaction}
            >
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                <FlameIcon />
                <StackedText
                  title="Claim Pool Emissions"
                  titleColor="inherit"
                  text={`${toBalance(userPoolData?.emissionEstimates?.totalEmissions ?? 0)} BLND`}
                  textColor="inherit"
                  type="large"
                />
              </Box>
              <ArrowForwardIcon fontSize="inherit" />
            </CustomButton>
          </Box>
        </Row>
      )}
      {viewType !== ViewType.REGULAR && (
        <Row
          sx={{
            display: 'flex',
            flexDirection: 'column',
            padding: '0px 12px',
            gap: '12px',
            alignItems: 'center',
          }}
        >
          <Box
            sx={{
              margin: '12px 0px',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <StackedText
                title="Net APY"
                titleColor="inherit"
                text={toPercentage(net_apy)}
                textColor="inherit"
                type="large"
              />
              <Icon
                src={'/icons/dashboard/net_apr.svg'}
                alt={`backstop size icon`}
                isCircle={false}
              />
            </Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginLeft: 'auto',
              }}
            >
              <StackedText
                title="Borrow Capacity"
                titleColor="inherit"
                text={`$${toBalance(borrow_capacity)}`}
                textColor="inherit"
                type="large"
              />
              <BorrowCapRing poolId={poolId} />
            </Box>
          </Box>
          <LinkBox sx={{ width: '100%' }} to={{ pathname: '/backstop', query: { poolId: poolId } }}>
            <CustomButton
              sx={{
                width: '100%',
                padding: '12px',
                color: theme.palette.text.primary,
                backgroundColor: theme.palette.background.paper,
                '&:hover': {
                  color: theme.palette.primary.main,
                },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                <FlameIcon />

                <StackedText
                  title="Claim Pool Emissions"
                  titleColor="inherit"
                  text={`${toBalance(userPoolData?.emissionEstimates?.totalEmissions ?? 0)} BLND`}
                  textColor="inherit"
                  type="large"
                  onClick={handleSubmitTransaction}
                />
              </Box>
              <ArrowForwardIcon fontSize="inherit" />
            </CustomButton>
          </LinkBox>
        </Row>
      )}
    </>
  );
};

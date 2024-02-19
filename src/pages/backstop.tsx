import { BackstopClaimArgs } from '@blend-capital/blend-sdk';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import HelpOutline from '@mui/icons-material/HelpOutline';
import { Box, Tooltip, Typography } from '@mui/material';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { BackstopBalanceCard } from '../components/backstop/BackstopBalanceCard';
import { BackstopQueueMod } from '../components/backstop/BackstopQueueMod';
import { CustomButton } from '../components/common/CustomButton';
import { Divider } from '../components/common/Divider';
import { FlameIcon } from '../components/common/FlameIcon';
import { Icon } from '../components/common/Icon';
import { Row } from '../components/common/Row';
import { Section, SectionSize } from '../components/common/Section';
import { SectionBase } from '../components/common/SectionBase';
import { StackedText } from '../components/common/StackedText';
import { TokenIcon } from '../components/common/TokenIcon';
import { PoolExploreBar } from '../components/pool/PoolExploreBar';
import { useWallet } from '../contexts/wallet';
import { useStore } from '../store/store';
import theme from '../theme';
import { toBalance, toPercentage } from '../utils/formatter';

const Backstop: NextPage = () => {
  const router = useRouter();
  const { connected, walletAddress, backstopClaim, backstopMintByDepositTokenAmount } = useWallet();
  const loadBlendData = useStore((state) => state.loadBlendData);
  const { poolId } = router.query;
  const safePoolId = typeof poolId == 'string' && /^[0-9A-Z]{56}$/.test(poolId) ? poolId : '';
  const [availableToMint, setAvailableToMint] = useState<string>();
  const [loadingEstimate, setLoadingEstimate] = useState(false);
  const backstopPoolData = useStore((state) => state.backstop?.pools?.get(safePoolId));
  const poolData = useStore((state) => state.pools.get(safePoolId));
  const userPoolData = useStore((state) => state.userPoolData.get(safePoolId));
  const backstopData = useStore((state) => state.backstop);
  const userBackstopData = useStore((state) => state.backstopUserData);
  const userEmissions = userBackstopData?.estimates.get(safePoolId)?.emissions;
  const loadUserData = useStore((state) => state.loadUserData);
  const balancesByAddress = useStore((state) => state.balances);
  const estBackstopApy =
    backstopPoolData && poolData
      ? ((poolData.config.backstopRate / 1e7) *
          poolData.estimates.totalBorrowApy *
          poolData.estimates.totalBorrow) /
        backstopPoolData.estimates.totalSpotValue
      : 0;
  const handleClaimEmissionsClick = async () => {
    if (connected && userBackstopData && userEmissions) {
      let claimArgs: BackstopClaimArgs = {
        from: walletAddress,
        pool_addresses: [safePoolId],
        to: walletAddress,
      };
      await backstopClaim(claimArgs, false);
      await loadBlendData(true, safePoolId, walletAddress);
    }
  };

  useEffect(() => {
    console.log('run');
    if (balancesByAddress.get(backstopData?.config.usdcTkn ?? '') === undefined) {
      loadUserData(walletAddress);
    }
    /** load comet estimate for users full balance */
    const usdcBalance = balancesByAddress.get(backstopData?.config.usdcTkn ?? '') || BigInt(0);
    const blndBalance = balancesByAddress.get(backstopData?.config.blndTkn ?? '') || BigInt(0);
    const usdcAddress = backstopData?.config.usdcTkn || '';
    const blndAddress = backstopData?.config.blndTkn || '';

    setLoadingEstimate(true);
    backstopMintByDepositTokenAmount(
      {
        depositTokenAddress: usdcAddress,
        depositTokenAmount: usdcBalance,
        minLPTokenAmount: BigInt(0),
        user: walletAddress,
      },
      true,
      backstopData?.config.backstopTkn || ''
    )
      .then((usdcEstimate: bigint | undefined) => {
        if (!usdcEstimate) {
          console.error('error getting usdc estimate');
        }
        backstopMintByDepositTokenAmount(
          {
            depositTokenAddress: blndAddress,
            depositTokenAmount: blndBalance,
            minLPTokenAmount: BigInt(0),
            user: walletAddress,
          },
          true,
          backstopData?.config.backstopTkn || ''
        )
          .then((blndEstimate: bigint | undefined) => {
            if (blndEstimate || usdcEstimate) {
              const totalEstimate = (usdcEstimate || BigInt(0)) + (blndEstimate || BigInt(0));
              setAvailableToMint(toBalance(totalEstimate, 7));

              setLoadingEstimate(false);
            } else {
              setLoadingEstimate(false);
              setAvailableToMint('--');
            }
          })
          .catch(() => {
            console.error('error getting blnd estimate');
            setLoadingEstimate(false);
            setAvailableToMint('--');
          });
      })
      .catch(() => {
        console.error('error on claim fn ');
        setLoadingEstimate(false);
        setAvailableToMint('--');
      });
  }, [balancesByAddress]);

  return (
    <>
      <PoolExploreBar poolId={safePoolId} />
      <Row>
        <SectionBase type="alt" sx={{ margin: '6px', padding: '6px' }}>
          Backstop Manager
        </SectionBase>
      </Row>
      <Divider />
      <Row>
        <Section width={SectionSize.THIRD}>
          <Box sx={{ display: 'flex', flexDirection: 'row' }}>
            <StackedText
              title="Backstop APY"
              text={toPercentage(estBackstopApy)}
              sx={{ width: '100%', padding: '6px' }}
            ></StackedText>
            <Tooltip
              title="Estimated APY based on backstop emissions and pool interest sharing."
              placement="top"
            >
              <HelpOutline sx={{ width: '15px', color: 'text.secondary' }} />
            </Tooltip>
          </Box>
        </Section>
        <Section width={SectionSize.THIRD}>
          <Box sx={{ display: 'flex', flexDirection: 'row' }}>
            <StackedText
              title="Q4W"
              text={toPercentage(backstopPoolData?.estimates?.q4wPercentage)}
              sx={{ width: '100%', padding: '6px' }}
            ></StackedText>
            <Tooltip
              title="Percent of capital insuring this pool queued for withdrawal (Q4W). A higher percent indicates potential risks."
              placement="top"
            >
              <HelpOutline sx={{ marginLeft: '-15px', width: '15px', color: 'text.secondary' }} />
            </Tooltip>
          </Box>
        </Section>
        <Section width={SectionSize.THIRD}>
          <StackedText
            title="Total deposited"
            text={`$${toBalance(backstopPoolData?.estimates?.totalSpotValue)}`}
            sx={{ width: '100%', padding: '6px' }}
          ></StackedText>
        </Section>
      </Row>

      {!!userEmissions && (
        <Row>
          <Section
            width={SectionSize.FULL}
            sx={{
              flexDirection: 'column',
              paddingTop: '12px',
            }}
          >
            <Typography variant="body2" sx={{ margin: '6px', color: theme.palette.primary.main }}>
              Emissions to claim
            </Typography>
            <Row>
              <CustomButton
                sx={{
                  width: '100%',
                  margin: '6px',
                  padding: '12px',
                  color: theme.palette.text.primary,
                  backgroundColor: theme.palette.background.default,
                  '&:hover': {
                    color: theme.palette.primary.main,
                  },
                }}
                onClick={handleClaimEmissionsClick}
              >
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                  <FlameIcon />
                  <TokenIcon symbol="blnd" sx={{ marginRight: '12px' }}></TokenIcon>
                  <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                    <Typography variant="h4" sx={{ marginRight: '6px' }}>
                      {userEmissions.toFixed(4)} BLND
                    </Typography>
                    <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                      BLND
                    </Typography>
                  </Box>
                </Box>
                <ArrowForwardIcon fontSize="inherit" />
              </CustomButton>
            </Row>
          </Section>
        </Row>
      )}

      <Row>
        <Section
          width={SectionSize.FULL}
          sx={{
            flexDirection: 'column',
            paddingTop: '12px',
          }}
        >
          <Typography variant="body2" sx={{ margin: '6px', color: theme.palette.backstop.main }}>
            Pool tokens available to mint
          </Typography>
          <Row>
            <CustomButton
              sx={{
                width: '100%',
                margin: '6px',
                padding: '12px',
                color: theme.palette.text.primary,
                backgroundColor: theme.palette.background.default,
                '&:hover': {
                  color: theme.palette.backstop.main,
                },
              }}
              onClick={() => {
                router.push({ pathname: `/backstop-mint`, query: { poolId: poolId } });
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                <Box
                  sx={{
                    backgroundColor: theme.palette.backstop.opaque,
                    color: theme.palette.backstop.main,
                    borderRadius: '50%',
                    padding: '4px',
                    margin: '6px',
                    display: 'flex',
                  }}
                >
                  <Icon width="24px" height="24px" src="/icons/dashboard/mint.svg" alt="mint" />
                </Box>
                <TokenIcon symbol="blndusdclp" sx={{ marginRight: '12px' }}></TokenIcon>
                <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                  <Typography variant="h4" sx={{ marginRight: '6px' }}>
                    {loadingEstimate
                      ? 'loading...'
                      : availableToMint != '--'
                      ? availableToMint
                      : 'Mint '}
                  </Typography>
                  <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                    BLND-USDC LP
                  </Typography>
                </Box>
              </Box>
              <ArrowForwardIcon fontSize="inherit" />
            </CustomButton>
          </Row>
        </Section>
      </Row>

      <Row>
        <BackstopBalanceCard type="deposit" poolId={safePoolId} />
        <BackstopBalanceCard type="wallet" poolId={safePoolId} />
      </Row>
      <BackstopQueueMod poolId={safePoolId} />
    </>
  );
};

export default Backstop;

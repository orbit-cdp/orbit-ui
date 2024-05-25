import { BackstopClaimArgs, parseResult } from '@blend-capital/blend-sdk';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import HelpOutline from '@mui/icons-material/HelpOutline';
import { Box, Tooltip, Typography } from '@mui/material';
import { SorobanRpc, scValToBigInt, xdr } from '@stellar/stellar-sdk';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { BackstopAPY } from '../components/backstop/BackstopAPY';
import { BackstopQueueMod } from '../components/backstop/BackstopQueueMod';
import { CustomButton } from '../components/common/CustomButton';
import { Divider } from '../components/common/Divider';
import { FlameIcon } from '../components/common/FlameIcon';
import { LinkBox } from '../components/common/LinkBox';
import { OpaqueButton } from '../components/common/OpaqueButton';
import { Row } from '../components/common/Row';
import { Section, SectionSize } from '../components/common/Section';
import { SectionBase } from '../components/common/SectionBase';
import { StackedText } from '../components/common/StackedText';
import { TokenIcon } from '../components/common/TokenIcon';
import { PoolExploreBar } from '../components/pool/PoolExploreBar';
import { useSettings } from '../contexts';
import { useWallet } from '../contexts/wallet';
import { useStore } from '../store/store';
import theme from '../theme';
import { toBalance, toPercentage } from '../utils/formatter';

const Backstop: NextPage = () => {
  const router = useRouter();
  const { viewType } = useSettings();
  const { connected, walletAddress, backstopClaim, cometSingleSidedDeposit } = useWallet();
  const loadBlendData = useStore((state) => state.loadBlendData);
  const network = useStore((state) => state.network);
  const rpcServer = useStore((state) => state.rpcServer());
  const { poolId } = router.query;
  const safePoolId = typeof poolId == 'string' && /^[0-9A-Z]{56}$/.test(poolId) ? poolId : '';

  const [lpTokenEmissions, setLpTokenEmissions] = useState<bigint>();

  const backstopPoolData = useStore((state) => state.backstop?.pools?.get(safePoolId));
  const backstopData = useStore((state) => state.backstop);
  const userBackstopData = useStore((state) => state.backstopUserData);
  const userPoolEstimates = userBackstopData?.estimates.get(safePoolId);
  const userPoolBackstopData = userBackstopData?.balances.get(safePoolId);
  const balancesByAddress = useStore((state) => state.balances);

  const handleClaimEmissionsClick = async () => {
    if (connected && userBackstopData && userPoolEstimates?.emissions) {
      let claimArgs: BackstopClaimArgs = {
        from: walletAddress,
        pool_addresses: [safePoolId],
        to: walletAddress,
      };
      setLpTokenEmissions(BigInt(0));
      await backstopClaim(claimArgs, false);
      await loadBlendData(true, safePoolId, walletAddress);
    }
  };

  async function getLPEstimate(amount: bigint, depositTokenAddress: string, source: string) {
    if (connected && backstopData?.config.backstopTkn) {
      let response = await cometSingleSidedDeposit(
        backstopData.config.backstopTkn,
        {
          depositTokenAddress: depositTokenAddress,
          depositTokenAmount: amount,
          minLPTokenAmount: BigInt(0),
          user: source,
        },
        true
      );
      if (response) {
        return SorobanRpc.Api.isSimulationSuccess(response)
          ? parseResult(response, (xdrString: string) => {
              return scValToBigInt(xdr.ScVal.fromXDR(xdrString, 'base64'));
            })
          : BigInt(0);
      }
    }
    return BigInt(0);
  }

  useEffect(() => {
    const update = async () => {
      if (
        backstopData?.config?.blndTkn !== undefined &&
        userPoolEstimates?.emissions !== undefined &&
        userPoolEstimates.emissions > 0
      ) {
        let emissions_as_bigint = BigInt((userPoolEstimates.emissions * 1e7).toFixed(0));
        let lp_tokens_emitted = await getLPEstimate(
          emissions_as_bigint,
          backstopData.config.blndTkn,
          backstopData.id
        );
        setLpTokenEmissions(lp_tokens_emitted);
      }
    };
    update();
  }, [userPoolEstimates?.emissions]);

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
        <Section width={SectionSize.THIRD} sx={{ alignItems: 'center' }}>
          <BackstopAPY poolId={safePoolId} />
        </Section>
        <Section width={SectionSize.THIRD}>
          <Tooltip
            title="Percent of capital insuring this pool queued for withdrawal (Q4W). A higher percent indicates potential risks."
            placement="top"
            enterTouchDelay={0}
            enterDelay={500}
            leaveTouchDelay={3000}
          >
            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
              <StackedText
                title="Q4W"
                text={toPercentage(backstopPoolData?.estimates?.q4wPercentage)}
                sx={{ width: '100%', padding: '6px' }}
              ></StackedText>
              <HelpOutline
                sx={{
                  marginLeft: '-10px',
                  marginTop: '9px',
                  width: '15px',
                  color: 'text.secondary',
                }}
              />
            </Box>
          </Tooltip>
        </Section>
        <Section width={SectionSize.THIRD}>
          <StackedText
            title="Total deposited"
            text={`$${toBalance(backstopPoolData?.estimates?.totalSpotValue)}`}
            sx={{ width: '100%', padding: '6px' }}
          ></StackedText>
        </Section>
      </Row>
      {lpTokenEmissions !== undefined && lpTokenEmissions > BigInt(0) && (
        <Row>
          <Section
            width={SectionSize.FULL}
            sx={{
              flexDirection: 'column',
              paddingTop: '12px',
            }}
          >
            <Typography variant="body2" sx={{ margin: '6px' }}>
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
                  <TokenIcon symbol="blndusdclp" sx={{ marginRight: '12px' }}></TokenIcon>
                  <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                    <Typography variant="h4" sx={{ marginRight: '6px' }}>
                      {toBalance(lpTokenEmissions, 7)}
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
      )}
      <Row>
        <Section
          width={SectionSize.FULL}
          sx={{
            flexDirection: 'column',
            paddingTop: '12px',
          }}
        >
          <Typography variant="body2" sx={{ margin: '6px' }}>
            Your BLND-USDC LP Token Balance
          </Typography>
          <Box
            sx={{
              width: SectionSize.FULL,
              margin: '6px',
              padding: '12px',
              color: theme.palette.text.primary,
              backgroundColor: theme.palette.background.default,
              borderRadius: '5px',
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
            }}
          >
            <TokenIcon symbol="blndusdclp" sx={{ marginRight: '12px' }}></TokenIcon>
            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
              <Typography variant="h4" sx={{ marginRight: '6px' }}>
                {toBalance(userBackstopData?.tokens, 7)}
              </Typography>
              <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                BLND-USDC LP
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              width: SectionSize.FULL,
              margin: '6px',
              borderRadius: '5px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <LinkBox sx={{ width: SectionSize.TILE }} to={{ pathname: '/backstop-token' }}>
              <OpaqueButton palette={theme.palette.primary} sx={{ width: '100%', padding: '6px' }}>
                Manage
              </OpaqueButton>
            </LinkBox>
            <LinkBox
              sx={{ width: SectionSize.TILE }}
              to={{ pathname: '/backstop-deposit', query: { poolId: poolId } }}
            >
              <OpaqueButton palette={theme.palette.backstop} sx={{ width: '100%', padding: '6px' }}>
                Backstop Deposit
              </OpaqueButton>
            </LinkBox>
          </Box>
        </Section>
      </Row>

      <Row sx={{ display: 'flex', flexDirection: 'column' }}>
        <Section
          width={SectionSize.FULL}
          sx={{
            flexDirection: 'column',
            paddingTop: '12px',
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Typography variant="body2" sx={{ margin: '6px' }}>
            Your backstop deposit
          </Typography>
          <Row>
            <Box
              sx={{
                width: '100%',
                margin: '6px',
                padding: '12px',
                color: theme.palette.text.primary,
                backgroundColor: theme.palette.background.default,
                borderRadius: '5px',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                <TokenIcon symbol="blndusdclp" sx={{ marginRight: '12px' }}></TokenIcon>
                <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                  <Typography variant="h4" sx={{ marginRight: '6px' }}>
                    {toBalance(userPoolEstimates?.tokens)}
                  </Typography>
                  <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                    BLND-USDC LP
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Row>
          <LinkBox
            sx={{ width: '100%', paddingRight: '12px' }}
            to={{ pathname: 'backstop-q4w', query: { poolId: poolId } }}
          >
            <OpaqueButton
              palette={theme.palette.positive}
              sx={{ width: '100%', margin: '6px', padding: '6px' }}
            >
              Queue for Withdrawal
            </OpaqueButton>
          </LinkBox>
        </Section>
      </Row>
      <BackstopQueueMod poolId={safePoolId} />
    </>
  );
};

export default Backstop;

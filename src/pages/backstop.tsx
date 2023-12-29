import HelpOutline from '@mui/icons-material/HelpOutline';
import { Box, Tooltip } from '@mui/material';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { BackstopBalanceCard } from '../components/backstop/BackstopBalanceCard';
import { BackstopQueueMod } from '../components/backstop/BackstopQueueMod';
import { Divider } from '../components/common/Divider';
import { Row } from '../components/common/Row';
import { Section, SectionSize } from '../components/common/Section';
import { SectionBase } from '../components/common/SectionBase';
import { StackedText } from '../components/common/StackedText';
import { PoolExploreBar } from '../components/pool/PoolExploreBar';
import { useStore } from '../store/store';
import { toBalance, toPercentage } from '../utils/formatter';

const Backstop: NextPage = () => {
  const router = useRouter();

  const { poolId } = router.query;
  const safePoolId = typeof poolId == 'string' && /^[0-9A-Z]{56}$/.test(poolId) ? poolId : '';

  const backstopPoolData = useStore((state) => state.backstop?.pools?.get(safePoolId));
  const poolData = useStore((state) => state.pools.get(safePoolId));

  const estBackstopApy =
    backstopPoolData && poolData
      ? ((poolData.config.backstopRate / 1e7) *
          poolData.estimates.totalBorrowApy *
          poolData.estimates.totalBorrow) /
        backstopPoolData.estimates.totalSpotValue
      : 0;

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
      {/*
      <Row>
        <Section
          width={SectionSize.FULL}
          sx={{
            flexDirection: 'column',
            paddingTop: '12px',
            backgroundColor: theme.palette.backstop.opaque,
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
                  color: theme.palette.backstop.main,
                },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                <TokenIcon symbol="blnd" sx={{ marginRight: '12px' }}></TokenIcon>
                <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                  <Typography variant="h4" sx={{ marginRight: '6px' }}>
                    688.666k
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
      */}
      <Row>
        <BackstopBalanceCard type="deposit" poolId={safePoolId} />
        <BackstopBalanceCard type="wallet" poolId={safePoolId} />
      </Row>
      <BackstopQueueMod poolId={safePoolId} />
    </>
  );
};

export default Backstop;

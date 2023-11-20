import HelpOutline from '@mui/icons-material/HelpOutline';
import { Box, Tooltip } from '@mui/material';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { BackstopBalanceCard } from '../components/backstop/BackstopBalanceCard';
import { BackstopQueueMod } from '../components/backstop/BackstopQueueMod';
import { Divider } from '../components/common/Divider';
import { OverlayModal } from '../components/common/OverlayModal';
import { Row } from '../components/common/Row';
import { Section, SectionSize } from '../components/common/Section';
import { SectionBase } from '../components/common/SectionBase';
import { StackedText } from '../components/common/StackedText';
import { WalletWarning } from '../components/common/WalletWarning';
import { PoolExploreBar } from '../components/pool/PoolExploreBar';
import { useSettings } from '../contexts';
import { useWallet } from '../contexts/wallet';
import { useStore } from '../store/store';
import { toBalance, toPercentage } from '../utils/formatter';

const Backstop: NextPage = () => {
  const { setLastPool } = useSettings();
  const { connected, walletAddress } = useWallet();

  const router = useRouter();
  const { poolId } = router.query;
  const safePoolId = typeof poolId == 'string' && /^[0-9A-Z]{56}$/.test(poolId) ? poolId : '';

  const loadPoolData = useStore((state) => state.loadPoolData);
  const loadBackstopData = useStore((state) => state.loadBackstopData);
  const backstopEstimates = useStore((state) => state.backstop_pool_est.get(safePoolId));

  useEffect(() => {
    const updateBackstop = async () => {
      if (safePoolId != '') {
        await loadPoolData(safePoolId, connected ? walletAddress : undefined, false);
        await loadBackstopData(safePoolId, connected ? walletAddress : undefined, false);
      }
    };
    setLastPool(safePoolId);
    updateBackstop();
    const refreshInterval = setInterval(() => {
      updateBackstop();
    }, 30 * 1000);
    return () => clearInterval(refreshInterval);
  }, [safePoolId, connected, loadPoolData, walletAddress, loadBackstopData, setLastPool]);

  return (
    <>
      <Row>
        <WalletWarning />
      </Row>
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
              text={toPercentage(backstopEstimates?.backstopApy)}
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
              text={toPercentage(backstopEstimates?.q4wRate)}
              sx={{ width: '100%', padding: '6px' }}
            ></StackedText>
            <Tooltip
              title="Percent of capital insuring this pool queued for withdrawal (Q4W). A higher percent indicates potential risks."
              placement="top"
            >
              <HelpOutline sx={{ marginLeft: '-20px', width: '15px', color: 'text.secondary' }} />
            </Tooltip>
          </Box>
        </Section>
        <Section width={SectionSize.THIRD}>
          <StackedText
            title="Total deposited"
            text={`$${toBalance(backstopEstimates?.backstopSize)}`}
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
      <OverlayModal poolId={safePoolId} type="backstop" />
    </>
  );
};

export default Backstop;

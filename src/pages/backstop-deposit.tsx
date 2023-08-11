import { Box, Typography, useTheme } from '@mui/material';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';
import { BackstopDepositAnvil } from '../components/backstop/BackstopDepositAnvil';
import { BackstopDropdown } from '../components/backstop/BackstopDropdown';
import { GoBackHeader } from '../components/common/GoBackHeader';
import { OverlayModal } from '../components/common/OverlayModal';
import { Row } from '../components/common/Row';
import { Section, SectionSize } from '../components/common/Section';
import { StackedText } from '../components/common/StackedText';
import { WalletWarning } from '../components/common/WalletWarning';
import { useWallet } from '../contexts/wallet';
import { useStore } from '../store/store';
import { toBalance, toPercentage } from '../utils/formatter';

const BackstopDeposit: NextPage = () => {
  const { connected, walletAddress } = useWallet();
  const theme = useTheme();
  const isMounted = useRef(false);

  const router = useRouter();
  const { poolId } = router.query;
  const safePoolId = typeof poolId == 'string' && /^[0-9A-Z]{56}$/.test(poolId) ? poolId : '';

  const loadPoolData = useStore((state) => state.loadPoolData);
  const loadBackstopData = useStore((state) => state.loadBackstopData);
  const backstopEstimates = useStore((state) => state.backstop_pool_est.get(safePoolId));
  const backstopUserEstimate = useStore((state) => state.backstop_user_est.get(safePoolId));

  useEffect(() => {
    const updateBackstop = async () => {
      if (safePoolId != '') {
        await loadPoolData(safePoolId, connected ? walletAddress : undefined, false);
        await loadBackstopData(safePoolId, connected ? walletAddress : undefined, false);
      }
    };
    if (isMounted.current) {
      updateBackstop();
      const refreshInterval = setInterval(async () => {
        await updateBackstop();
      }, 30 * 1000);
      return () => clearInterval(refreshInterval);
    } else {
      isMounted.current = true;
    }
  }, [safePoolId, connected, loadPoolData, walletAddress, loadBackstopData]);

  return (
    <>
      <Row>
        <WalletWarning />
      </Row>
      <Row>
        <GoBackHeader poolId={safePoolId} />
      </Row>
      <Row>
        <Section width={SectionSize.FULL} sx={{ marginTop: '12px', marginBottom: '12px' }}>
          <BackstopDropdown type="deposit" poolId={safePoolId} />
        </Section>
      </Row>
      <Row>
        <Section width={SectionSize.FULL} sx={{ padding: '12px' }}>
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '6px',
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
              <Typography variant="h5" sx={{ marginRight: '6px' }}>
                Available
              </Typography>
              <Typography variant="h4" sx={{ color: theme.palette.backstop.main }}>
                {toBalance(backstopUserEstimate?.walletBalance)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="h5" sx={{ color: theme.palette.text.secondary }}>
                BLND-USDC LP
              </Typography>
            </Box>
          </Box>
        </Section>
      </Row>
      <Row>
        <Section width={SectionSize.THIRD}>
          <StackedText
            title="Backstop APY"
            text={toPercentage(backstopEstimates?.backstopApy)}
            sx={{ width: '100%', padding: '6px' }}
          ></StackedText>
        </Section>
        <Section width={SectionSize.THIRD}>
          <StackedText
            title="Q4W"
            text={toPercentage(backstopEstimates?.q4wRate)}
            sx={{ width: '100%', padding: '6px' }}
          ></StackedText>
        </Section>
        <Section width={SectionSize.THIRD}>
          <StackedText
            title="Total deposited"
            text={`$${toBalance(backstopEstimates?.backstopSize)}`}
            sx={{ width: '100%', padding: '6px' }}
          ></StackedText>
        </Section>
      </Row>
      <BackstopDepositAnvil poolId={safePoolId} />

      <OverlayModal poolId={safePoolId} type="backstop" />
    </>
  );
};

export default BackstopDeposit;

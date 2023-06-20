import { Box, Typography, useTheme } from '@mui/material';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';
import { BackstopDropdown } from '../components/backstop/BackstopDropdown';
import { BackstopQueueAnvil } from '../components/backstop/BackstopQueueAnvil';
import { BackstopQueueMod } from '../components/backstop/BackstopQueueMod';
import { GoBackHeader } from '../components/common/GoBackHeader';
import { OverlayModal } from '../components/common/OverlayModal';
import { Row } from '../components/common/Row';
import { Section, SectionSize } from '../components/common/Section';
import { StackedText } from '../components/common/StackedText';
import { WalletWarning } from '../components/common/WalletWarning';
import { useWallet } from '../contexts/wallet';
import { useStore } from '../store/store';
import { toBalance, toPercentage } from '../utils/formatter';

const BackstopQ4W: NextPage = () => {
  const { connected, walletAddress } = useWallet();
  const theme = useTheme();
  const isMounted = useRef(false);

  const router = useRouter();
  const { poolId } = router.query;
  const safePoolId = typeof poolId == 'string' && /^[0-9A-Z]{56}$/.test(poolId) ? poolId : '';

  const refreshPoolReserveAll = useStore((state) => state.refreshPoolReserveAll);
  const refreshPoolBackstopData = useStore((state) => state.refreshPoolBackstopData);
  const estimateToLatestLedger = useStore((state) => state.estimateToLatestLedger);
  const poolEst = useStore((state) => state.pool_est.get(safePoolId));
  const backstopTokenToBase = useStore((state) => state.backstopTokenPrice);
  const backstopPoolBalance = useStore((state) => state.poolBackstopBalance.get(safePoolId));
  const backstopTokenWalletBalance = useStore((state) => state.backstopTokenBalance);
  const backstopShares = useStore((state) => state.shares.get(safePoolId));
  const backstopQ4W = useStore((state) => state.q4w.get(safePoolId));

  const tokenToBase = Number(backstopTokenToBase) / 1e7;
  const estBackstopSize = backstopPoolBalance
    ? (Number(backstopPoolBalance.tokens) / 1e7) * tokenToBase
    : undefined;
  const estBackstopApy =
    poolEst && estBackstopSize ? poolEst.total_backstop_take_base / estBackstopSize : undefined;
  const poolQ4W = backstopPoolBalance
    ? Number(backstopPoolBalance.q4w) / Number(backstopPoolBalance.shares)
    : undefined;
  const shareRate = backstopPoolBalance
    ? Number(backstopPoolBalance.tokens) / Number(backstopPoolBalance.shares)
    : 1;
  const unqueuedBalance = (Number(backstopShares ?? 0) / 1e7) * shareRate;
  const queuedBalance =
    backstopQ4W?.reduce((total, q4w) => total + Number(q4w.amount) / 1e7, 0) ?? 0;
  const availableToQueue = unqueuedBalance - queuedBalance;

  useEffect(() => {
    const updateBackstop = async () => {
      if (safePoolId != '') {
        await refreshPoolReserveAll(safePoolId, connected ? walletAddress : undefined);
        if (connected) {
          await refreshPoolBackstopData(safePoolId, walletAddress);
        }
        await estimateToLatestLedger(safePoolId, connected ? walletAddress : undefined);
      }
    };
    if (isMounted.current) {
      updateBackstop();
    } else {
      isMounted.current = true;
    }
  }, [safePoolId, connected]);

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
          <BackstopDropdown type="q4w" poolId={safePoolId} />
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
                Available to queue
              </Typography>
              <Typography variant="h4" sx={{ color: theme.palette.backstop.main }}>
                {toBalance(availableToQueue)}
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
            text={toPercentage(estBackstopApy)}
            sx={{ width: '100%', padding: '6px' }}
          ></StackedText>
        </Section>
        <Section width={SectionSize.THIRD}>
          <StackedText
            title="Q4W"
            text={toPercentage(poolQ4W)}
            sx={{ width: '100%', padding: '6px' }}
          ></StackedText>
        </Section>
        <Section width={SectionSize.THIRD}>
          <StackedText
            title="Total deposited"
            text={`$${toBalance(estBackstopSize)}`}
            sx={{ width: '100%', padding: '6px' }}
          ></StackedText>
        </Section>
      </Row>
      <BackstopQueueAnvil poolId={safePoolId} />
      <BackstopQueueMod poolId={safePoolId} />
      <OverlayModal poolId={safePoolId} type="backstop" />
    </>
  );
};

export default BackstopQ4W;

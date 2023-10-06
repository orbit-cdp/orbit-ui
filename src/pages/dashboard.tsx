import { Box, Typography, useTheme } from '@mui/material';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';
import { BackstopPreviewBar } from '../components/backstop/BackstopPreviewBar';
import { BorrowMarketList } from '../components/borrow/BorrowMarketList';
import { BorrowPositions } from '../components/borrow/BorrowPositions';
import { Divider } from '../components/common/Divider';
import { Row } from '../components/common/Row';
import { Section, SectionSize } from '../components/common/Section';
import { ToggleButton } from '../components/common/ToggleButton';
import { WalletWarning } from '../components/common/WalletWarning';
import { PositionOverview } from '../components/dashboard/PositionOverview';
import { LendMarketList } from '../components/lend/LendMarketList';
import { LendPositions } from '../components/lend/LendPositions';
import { PoolExploreBar } from '../components/pool/PoolExploreBar';
import { useSettings } from '../contexts';
import { useWallet } from '../contexts/wallet';
import { useStore } from '../store/store';
import { toBalance } from '../utils/formatter';

const Dashboard: NextPage = () => {
  const { setLastPool, showLend, setShowLend } = useSettings();
  const { connected, walletAddress } = useWallet();

  const isMounted = useRef(false);
  const router = useRouter();
  const { poolId } = router.query;
  const safePoolId = typeof poolId == 'string' && /^[0-9a-f]{64}$/.test(poolId) ? poolId : '';

  const theme = useTheme();
  const refreshPoolReserveAll = useStore((state) => state.refreshPoolReserveAll);
  const estimateToLatestLedger = useStore((state) => state.estimateToLatestLedger);
  const refreshPoolBackstopData = useStore((state) => state.refreshPoolBackstopData);
  const pool_est = useStore((state) => state.pool_est.get(safePoolId));

  useEffect(() => {
    const updateDashboard = async () => {
      if (safePoolId != '') {
        await refreshPoolReserveAll(safePoolId, connected ? walletAddress : undefined);
        if (connected) {
          await refreshPoolBackstopData(safePoolId, walletAddress);
        }
        await estimateToLatestLedger(safePoolId, connected ? walletAddress : undefined);
      }
    };
    if (isMounted.current) {
      setLastPool(safePoolId);
      updateDashboard();
      const refreshInterval = setInterval(() => {
        updateDashboard();
      }, 60 * 1000);
      return () => clearInterval(refreshInterval);
    } else {
      isMounted.current = true;
    }
  }, [safePoolId, connected]);

  const handleLendClick = () => {
    if (!showLend) {
      setShowLend(true);
    }
  };

  const handleBorrowClick = () => {
    if (showLend) {
      setShowLend(false);
    }
  };

  return (
    <>
      <Row>
        <WalletWarning />
      </Row>
      <PoolExploreBar poolId={safePoolId} />
      <BackstopPreviewBar poolId={safePoolId} />
      <PositionOverview poolId={safePoolId} />
      <Row>
        <Section width={SectionSize.FULL} sx={{ padding: '0px' }}>
          <ToggleButton
            active={showLend}
            palette={theme.palette.lend}
            sx={{ width: '50%', padding: '12px' }}
            onClick={handleLendClick}
          >
            Supply
          </ToggleButton>
          <ToggleButton
            active={!showLend}
            palette={theme.palette.borrow}
            sx={{ width: '50%', padding: '12px' }}
            onClick={handleBorrowClick}
          >
            Borrow
          </ToggleButton>
        </Section>
      </Row>
      {showLend ? <LendPositions poolId={safePoolId} /> : <BorrowPositions poolId={safePoolId} />}
      <Row sx={{ padding: '6px', justifyContent: 'space-between' }}>
        <Typography variant="body1" sx={{ margin: '6px' }}>{`Assets to ${
          showLend ? 'supply' : 'borrow'
        }`}</Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'baseline',
            margin: '6px',
          }}
        >
          <Typography variant="body2" mr={1}>
            Market size:
          </Typography>
          <Typography variant="body1">{`$${toBalance(
            pool_est?.total_supply_base ?? 0
          )}`}</Typography>
        </Box>
      </Row>
      <Divider />
      {showLend ? <LendMarketList poolId={safePoolId} /> : <BorrowMarketList poolId={safePoolId} />}
    </>
  );
};

export default Dashboard;

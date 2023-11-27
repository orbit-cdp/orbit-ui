import { Box, Typography, useTheme } from '@mui/material';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { BackstopPreviewBar } from '../components/backstop/BackstopPreviewBar';
import { BorrowMarketList } from '../components/borrow/BorrowMarketList';
import { BorrowPositions } from '../components/borrow/BorrowPositions';
import { Divider } from '../components/common/Divider';
import { FaucetBanner } from '../components/common/FaucetBanner';
import { OverlayModal } from '../components/common/OverlayModal';
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

  // const isMounted = useRef(false);
  const router = useRouter();
  const { poolId } = router.query;
  const safePoolId = typeof poolId == 'string' && /^[0-9A-Z]{56}$/.test(poolId) ? poolId : '';

  const theme = useTheme();
  const loadBackstopData = useStore((state) => state.loadBackstopData);
  const loadPoolData = useStore((state) => state.loadPoolData);
  const pool_est = useStore((state) => state.pool_est.get(safePoolId));

  useEffect(() => {
    const updateDashboard = async () => {
      if (safePoolId != '') {
        await loadPoolData(safePoolId, connected ? walletAddress : undefined, false);
        await loadBackstopData(safePoolId, connected ? walletAddress : undefined, false);
      }
    };
    setLastPool(safePoolId);
    updateDashboard();
    const refreshInterval = setInterval(async () => {
      await updateDashboard();
    }, 30 * 1000);
    return () => clearInterval(refreshInterval);
  }, [safePoolId, connected, loadPoolData, walletAddress, loadBackstopData, setLastPool]);

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
      <Row>
        <FaucetBanner poolId={safePoolId} />
      </Row>
      <PoolExploreBar poolId={safePoolId} />
      <BackstopPreviewBar poolId={safePoolId} />
      <PositionOverview poolId={safePoolId} />
      {showLend ? <LendPositions poolId={safePoolId} /> : <BorrowPositions poolId={safePoolId} />}
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
      <OverlayModal poolId={safePoolId} type="dashboard" />
    </>
  );
};

export default Dashboard;

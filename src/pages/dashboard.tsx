import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Box, Typography, useTheme } from '@mui/material';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';
import { BackstopPreviewBar } from '../components/backstop/BackstopPreviewBar';
import { BorrowMarketList } from '../components/borrow/BorrowMarketList';
import { BorrowPositions } from '../components/borrow/BorrowPositions';
import { CustomButton } from '../components/common/CustomButton';
import { Divider } from '../components/common/Divider';
import { LinkBox } from '../components/common/LinkBox';
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
    if (isMounted.current) {
      setLastPool(safePoolId);
      updateDashboard();
      const refreshInterval = setInterval(async () => {
        await updateDashboard();
      }, 30 * 1000);
      return () => clearInterval(refreshInterval);
    } else {
      isMounted.current = true;
    }
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
      <PoolExploreBar poolId={safePoolId} />
      <PositionOverview poolId={safePoolId} />
      <Row sx={{ padding: '6px' }}>
        <LinkBox
          sx={{ width: '100%' }}
          to={{ pathname: '/backstop', query: { poolId: safePoolId } }}
        >
          <CustomButton
            sx={{
              color: theme.palette.text.primary,
              '&:hover': {
                color: theme.palette.backstop.main,
              },
            }}
          >
            <Typography variant="body1">Backstop Manager</Typography>
            <ArrowForwardIcon fontSize="inherit" sx={{ marginLeft: '6px' }} />
          </CustomButton>
        </LinkBox>
      </Row>
      <BackstopPreviewBar poolId={safePoolId} />
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

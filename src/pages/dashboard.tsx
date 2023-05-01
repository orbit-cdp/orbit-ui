import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Box, Typography, useTheme } from '@mui/material';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
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
import { useStore } from '../store/store';
import { toBalance } from '../utils/formatter';

const Dashboard: NextPage = () => {
  const isMounted = useRef(false);
  const router = useRouter();
  const { poolId } = router.query;
  const safePoolId = typeof poolId == 'string' && /^[0-9a-f]{64}$/.test(poolId) ? poolId : '';

  const theme = useTheme();
  const refreshPoolReserveAll = useStore((state) => state.refreshPoolReserveAll);
  const estimateToLatestLedger = useStore((state) => state.estimateToLatestLedger);
  const refreshPoolBackstopData = useStore((state) => state.refreshPoolBackstopData);
  const reserves = useStore((state) => state.reserves.get(safePoolId));
  const pool_est = useStore((state) => state.pool_est.get(safePoolId));

  const [lend, setLend] = useState<boolean>(true);

  // TODO: Add long timer to refresh ledger data
  useEffect(() => {
    if (isMounted.current && safePoolId != '') {
      refreshPoolReserveAll(safePoolId, 'GA5XD47THVXOJFNSQTOYBIO42EVGY5NF62YUAZJNHOQFWZZ2EEITVI5K');
    } else {
      isMounted.current = true;
    }
  }, [refreshPoolReserveAll, safePoolId]);

  useEffect(() => {
    if (isMounted.current && safePoolId != '') {
      estimateToLatestLedger(
        safePoolId,
        'GA5XD47THVXOJFNSQTOYBIO42EVGY5NF62YUAZJNHOQFWZZ2EEITVI5K'
      );
      const estimationInterval = setInterval(() => {
        estimateToLatestLedger(
          safePoolId,
          'GA5XD47THVXOJFNSQTOYBIO42EVGY5NF62YUAZJNHOQFWZZ2EEITVI5K'
        );
      }, 60 * 1000);

      return () => clearInterval(estimationInterval);
    }
  }, [estimateToLatestLedger, safePoolId, reserves]);

  useEffect(() => {
    if (isMounted.current && safePoolId != '') {
      refreshPoolBackstopData(
        safePoolId,
        'GA5XD47THVXOJFNSQTOYBIO42EVGY5NF62YUAZJNHOQFWZZ2EEITVI5K'
      );
      const backstopInterval = setInterval(() => {
        refreshPoolBackstopData(
          safePoolId,
          'GA5XD47THVXOJFNSQTOYBIO42EVGY5NF62YUAZJNHOQFWZZ2EEITVI5K'
        );
      }, 90 * 1000);

      return () => clearInterval(backstopInterval);
    }
  }, [refreshPoolBackstopData, safePoolId]);

  const handleLendClick = () => {
    if (!lend) {
      setLend(true);
    }
  };

  const handleBorrowClick = () => {
    if (lend) {
      setLend(false);
    }
  };

  return (
    <>
      <Row sx={{ padding: '6px' }}>
        <WalletWarning />
      </Row>
      <PoolExploreBar />
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
            active={lend}
            palette={theme.palette.primary}
            sx={{ width: '50%', padding: '12px' }}
            onClick={handleLendClick}
          >
            Lend
          </ToggleButton>
          <ToggleButton
            active={!lend}
            palette={theme.palette.primary}
            sx={{ width: '50%', padding: '12px' }}
            onClick={handleBorrowClick}
          >
            Borrow
          </ToggleButton>
        </Section>
      </Row>
      {lend ? <LendPositions poolId={safePoolId} /> : <BorrowPositions poolId={safePoolId} />}
      <Row sx={{ padding: '6px', justifyContent: 'space-between' }}>
        <Typography variant="body1" sx={{ margin: '6px' }}>{`Assets to ${
          lend ? 'lend' : 'borrow'
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
      {lend ? <LendMarketList poolId={safePoolId} /> : <BorrowMarketList poolId={safePoolId} />}
    </>
  );
};

export default Dashboard;

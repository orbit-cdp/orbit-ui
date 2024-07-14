import { Box, Typography, useTheme } from '@mui/material';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { BorrowPositions } from '../components/borrow/BorrowPositions';
import { Divider } from '../components/common/Divider';
import { Row } from '../components/common/Row';
import { PositionOverview } from '../components/dashboard/PositionOverview';
import { LendPositions } from '../components/lend/LendPositions';
import { useSettings } from '../contexts';
import { useStore } from '../store/store';

const Dashboard: NextPage = () => {
  const router = useRouter();
  const theme = useTheme();
  const { showLend, setShowLend } = useSettings();

  const { poolId } = router.query;
  const safePoolId = typeof poolId == 'string' && /^[0-9A-Z]{56}$/.test(poolId) ? poolId : '';

  const poolData = useStore((state) => state.pools.get(safePoolId));

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
        <Box sx={{ paddingLeft: '6px' }}>
          <Typography variant="h2" sx={{ padding: '6px' }}>
            Your positions
          </Typography>
        </Box>
      </Row>
      <PositionOverview poolId={safePoolId} />
      <LendPositions poolId={safePoolId} />
      <BorrowPositions poolId={safePoolId} />
      <Divider />
    </>
  );
};

export default Dashboard;

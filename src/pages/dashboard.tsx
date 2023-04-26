import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Box, Typography, useTheme } from '@mui/material';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useState } from 'react';
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

const Dashboard: NextPage = () => {
  const router = useRouter();
  const { poolId } = router.query;

  const theme = useTheme();

  const [lend, setLend] = useState<boolean>(true);

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
      <PositionOverview />
      <Row sx={{ padding: '6px' }}>
        <LinkBox sx={{ width: '100%' }} to={{ pathname: '/backstop', query: { poolId: 'poolId' } }}>
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
      <BackstopPreviewBar />
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
      {lend ? <LendPositions /> : <BorrowPositions />}
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
          <Typography variant="body1">$888.888M</Typography>
        </Box>
      </Row>
      <Divider />
      {lend ? <LendMarketList /> : <BorrowMarketList />}
    </>
  );
};

export default Dashboard;
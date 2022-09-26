import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Typography, useTheme } from '@mui/material';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { BackstopPreviewBar } from '../components/backstop/BackstopPreviewBar';
import { CustomButton } from '../components/common/CustomButton';
import { Row } from '../components/common/Row';
import { WalletWarning } from '../components/common/WalletWarning';
import { PoolExploreBar } from '../components/pool/PoolExploreBar';

const Dashboard: NextPage = () => {
  const router = useRouter();
  const { poolId } = router.query;

  const theme = useTheme();

  return (
    <>
      <Row sx={{ padding: '6px' }}>
        <WalletWarning />
      </Row>
      <PoolExploreBar />
      <Row sx={{ padding: '6px' }}>
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
      </Row>
      <BackstopPreviewBar />
    </>
  );
};

export default Dashboard;

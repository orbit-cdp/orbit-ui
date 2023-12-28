import { Box, Typography, useTheme } from '@mui/material';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { BackstopDropdown } from '../components/backstop/BackstopDropdown';
import { BackstopQueueAnvil } from '../components/backstop/BackstopQueueAnvil';
import { BackstopQueueMod } from '../components/backstop/BackstopQueueMod';
import { GoBackHeader } from '../components/common/GoBackHeader';
import { Row } from '../components/common/Row';
import { Section, SectionSize } from '../components/common/Section';
import { StackedText } from '../components/common/StackedText';
import { useStore } from '../store/store';
import { toBalance, toPercentage } from '../utils/formatter';

const BackstopQ4W: NextPage = () => {
  const theme = useTheme();

  const router = useRouter();
  const { poolId } = router.query;
  const safePoolId = typeof poolId == 'string' && /^[0-9A-Z]{56}$/.test(poolId) ? poolId : '';

  const backstopPoolData = useStore((state) => state.backstop?.pools?.get(safePoolId));
  const poolData = useStore((state) => state.pools.get(safePoolId));
  const userBackstopData = useStore((state) => state.backstopUserData);
  const backstopUserEstimates = userBackstopData?.estimates?.get(safePoolId);

  const estBackstopApy =
    backstopPoolData && poolData
      ? ((poolData.config.backstopRate / 1e7) *
          poolData.estimates.totalBorrowApy *
          poolData.estimates.totalBorrow) /
        backstopPoolData.estimates.totalSpotValue
      : 0;

  return (
    <>
      <Row>
        <GoBackHeader name={poolData?.config.name} />
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
                {toBalance(backstopUserEstimates?.notLockedShares ?? 0, 7)}
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
            text={toPercentage(backstopPoolData?.estimates.q4wPercentage)}
            sx={{ width: '100%', padding: '6px' }}
          ></StackedText>
        </Section>
        <Section width={SectionSize.THIRD}>
          <StackedText
            title="Total deposited"
            text={`$${toBalance(backstopPoolData?.estimates?.totalSpotValue)}`}
            sx={{ width: '100%', padding: '6px' }}
          ></StackedText>
        </Section>
      </Row>
      <BackstopQueueAnvil poolId={safePoolId} />
      <BackstopQueueMod poolId={safePoolId} />
    </>
  );
};

export default BackstopQ4W;

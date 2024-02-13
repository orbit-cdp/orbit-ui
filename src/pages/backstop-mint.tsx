import { Box, Typography, useTheme } from '@mui/material';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { BackstopMintAnvil } from '../components/backstop/BackstopMintAnvil';
import { GoBackHeader } from '../components/common/GoBackHeader';
import { Row } from '../components/common/Row';
import { Section, SectionSize } from '../components/common/Section';
import { TokenIcon } from '../components/common/TokenIcon';
import { useStore } from '../store/store';
import { toBalance } from '../utils/formatter';

const BackstopMint: NextPage = () => {
  const theme = useTheme();

  const router = useRouter();
  const { poolId } = router.query;
  const safePoolId = typeof poolId == 'string' && /^[0-9A-Z]{56}$/.test(poolId) ? poolId : '';

  const backstopPoolData = useStore((state) => state.backstop?.pools?.get(safePoolId));
  const poolData = useStore((state) => state.pools.get(safePoolId));
  const userBackstopData = useStore((state) => state.backstopUserData);

  const estBackstopApy =
    backstopPoolData && poolData
      ? ((poolData.config.backstopRate / 1e7) *
          poolData.estimates.totalBorrowApy *
          poolData.estimates.totalBorrow) /
        backstopPoolData.estimates.totalSpotValue
      : 0;

  return (
    <>
      <Row sx={{ margin: '12px' }}>
        <GoBackHeader name={poolData?.config.name} />
      </Row>
      <Row>
        <Section width={SectionSize.FULL} sx={{ marginTop: '12px', marginBottom: '12px' }}>
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'start',
              gap: '1rem',
              alignItems: 'center',
              padding: '12px',
            }}
          >
            <TokenIcon symbol="blndusdclp" />
            <Typography variant="h4">Mint BLND-USDC LP</Typography>
          </Box>
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
                {toBalance(userBackstopData?.tokens, 7)}
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

      <BackstopMintAnvil poolId={safePoolId} />
    </>
  );
};

export default BackstopMint;

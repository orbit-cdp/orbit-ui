import { Box, Typography, useTheme } from '@mui/material';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';
import { GoBackHeader } from '../components/common/GoBackHeader';
import { ReserveDropdown } from '../components/common/ReserveDropdown';
import { Row } from '../components/common/Row';
import { Section, SectionSize } from '../components/common/Section';
import { StackedText } from '../components/common/StackedText';
import { WalletWarning } from '../components/common/WalletWarning';
import { LendAnvil } from '../components/lend/LendAnvil';
import { useStore } from '../store/store';
import { toBalance, toPercentage } from '../utils/formatter';

const Lend: NextPage = () => {
  const theme = useTheme();
  const isMounted = useRef(false);

  const router = useRouter();
  const { poolId, assetId } = router.query;
  const safePoolId = typeof poolId == 'string' && /^[0-9a-f]{64}$/.test(poolId) ? poolId : '';
  const safeAssetId = typeof assetId == 'string' && /^[0-9a-f]{64}$/.test(assetId) ? assetId : '';

  const refreshPoolReserveAll = useStore((state) => state.refreshPoolReserveAll);
  const estimateToLatestLedger = useStore((state) => state.estimateToLatestLedger);
  const reserve = useStore((state) => state.reserves.get(safePoolId)?.get(safeAssetId));
  const reserve_est = useStore((state) =>
    state.reserve_est.get(safePoolId)?.find((res) => res.id === safeAssetId)
  );
  const user_bal_est = useStore((state) => state.user_bal_est.get(safePoolId)?.get(safeAssetId));

  // load ledger data if the page was loaded directly
  useEffect(() => {
    if (isMounted.current && safePoolId != '' && reserve == undefined) {
      refreshPoolReserveAll(safePoolId, 'GA5XD47THVXOJFNSQTOYBIO42EVGY5NF62YUAZJNHOQFWZZ2EEITVI5K');
    }
  }, [refreshPoolReserveAll, safePoolId, reserve]);

  // always re-estimate values to most recent ledger
  useEffect(() => {
    if (isMounted.current && safePoolId != '' && reserve != undefined) {
      estimateToLatestLedger(
        safePoolId,
        'GA5XD47THVXOJFNSQTOYBIO42EVGY5NF62YUAZJNHOQFWZZ2EEITVI5K'
      );
    } else {
      isMounted.current = true;
    }
  }, [estimateToLatestLedger, safePoolId, reserve]);

  return (
    <>
      <Row sx={{ padding: '6px' }}>
        <WalletWarning />
      </Row>
      <Row>
        <GoBackHeader poolId={safePoolId} />
      </Row>
      <Row>
        <Section width={SectionSize.FULL} sx={{ marginTop: '12px', marginBottom: '12px' }}>
          <ReserveDropdown action="lend" poolId={safePoolId} activeReserveId={safeAssetId} />
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
                Balance
              </Typography>
              <Typography variant="h4" sx={{ color: theme.palette.lend.main }}>
                {toBalance(user_bal_est?.asset ?? 0)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="h5" sx={{ color: theme.palette.text.secondary }}>
                {reserve?.symbol ?? '--'}
              </Typography>
            </Box>
          </Box>
        </Section>
      </Row>
      <Row>
        <Section width={SectionSize.THIRD}>
          <StackedText
            title="Lend APY"
            text={reserve_est ? toPercentage(reserve_est.supply_apy) : ''}
            sx={{ width: '100%', padding: '6px' }}
          ></StackedText>
        </Section>
        <Section width={SectionSize.THIRD}>
          <StackedText
            title="Collateral factor"
            text={reserve_est ? toPercentage(reserve_est.c_factor) : ''}
            sx={{ width: '100%', padding: '6px' }}
          ></StackedText>
        </Section>
        <Section width={SectionSize.THIRD}>
          <StackedText
            title="Total lent"
            text={reserve_est ? toBalance(reserve_est.supplied) : ''}
            sx={{ width: '100%', padding: '6px' }}
          ></StackedText>
        </Section>
      </Row>
      <Row>
        <LendAnvil poolId={safePoolId} assetId={safeAssetId} />
      </Row>
    </>
  );
};

export default Lend;

import { Box, Typography, useTheme } from '@mui/material';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';
import { GoBackHeader } from '../components/common/GoBackHeader';
import { OverlayModal } from '../components/common/OverlayModal';
import { ReserveDropdown } from '../components/common/ReserveDropdown';
import { Row } from '../components/common/Row';
import { Section, SectionSize } from '../components/common/Section';
import { StackedText } from '../components/common/StackedText';
import { WalletWarning } from '../components/common/WalletWarning';
import { LendAnvil } from '../components/lend/LendAnvil';
import { useWallet } from '../contexts/wallet';
import { useStore } from '../store/store';
import { toBalance, toPercentage } from '../utils/formatter';

const Supply: NextPage = () => {
  const theme = useTheme();
  const isMounted = useRef(false);
  const { connected, walletAddress } = useWallet();

  const router = useRouter();
  const { poolId, assetId } = router.query;
  const safePoolId = typeof poolId == 'string' && /^[0-9A-Z]{56}$/.test(poolId) ? poolId : '';
  const safeAssetId = typeof assetId == 'string' && /^[0-9A-Z]{56}$/.test(assetId) ? assetId : '';

  const loadPoolData = useStore((state) => state.loadPoolData);
  const reserve = useStore((state) => state.poolData.get(safePoolId)?.reserves.get(safeAssetId));
  const reserve_est = useStore((state) =>
    state.pool_est.get(safePoolId)?.reserve_est?.find((res) => res.id === safeAssetId)
  );
  const user_bal_est = useStore((state) =>
    state.pool_user_est.get(safePoolId)?.reserve_estimates.get(safeAssetId)
  );

  useEffect(() => {
    const updatePool = async () => {
      if (safePoolId != '') {
        await loadPoolData(safePoolId, connected ? walletAddress : undefined, false);
      }
    };
    if (isMounted.current) {
      updatePool();
      const refreshInterval = setInterval(async () => {
        await updatePool();
      }, 30 * 1000);
      return () => clearInterval(refreshInterval);
    } else {
      isMounted.current = true;
    }
  }, [loadPoolData, safePoolId, reserve, connected, walletAddress]);

  return (
    <>
      <Row>
        <WalletWarning />
      </Row>
      <Row>
        <GoBackHeader poolId={safePoolId} />
      </Row>
      <Row>
        <Section width={SectionSize.FULL} sx={{ marginTop: '12px', marginBottom: '12px' }}>
          <ReserveDropdown action="Supply" poolId={safePoolId} activeReserveId={safeAssetId} />
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
            title="Supply APY"
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
            title="Total supplied"
            text={reserve_est ? toBalance(reserve_est.supplied) : ''}
            sx={{ width: '100%', padding: '6px' }}
          ></StackedText>
        </Section>
      </Row>
      <LendAnvil poolId={safePoolId} assetId={safeAssetId} />

      <OverlayModal poolId={safePoolId} type="dashboard" />
    </>
  );
};

export default Supply;

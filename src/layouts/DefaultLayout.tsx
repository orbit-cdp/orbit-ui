import { Box } from '@mui/material';
import { Networks } from '@stellar/stellar-sdk';
import { useRouter } from 'next/router';
import { ReactNode, useEffect } from 'react';
import { FaucetBanner } from '../components/common/FaucetBanner';
import { OverlayModal } from '../components/common/OverlayModal';
import { OverlayModalTOS } from '../components/common/OverlayModalTOS';
import { Row } from '../components/common/Row';
import { WalletWarning } from '../components/common/WalletWarning';
import { NavBar } from '../components/nav/NavBar';
import { useSettings, ViewType } from '../contexts';
import { useWallet } from '../contexts/wallet';
import { useStore } from '../store/store';

export default function DefaultLayout({ children }: { children: ReactNode }) {
  const { viewType, lastPool, setLastPool } = useSettings();
  const { connected, walletAddress } = useWallet();
  const router = useRouter();
  const { poolId } = router.query;
  const safePoolId =
    typeof poolId == 'string' && /^[0-9A-Z]{56}$/.test(poolId) ? poolId : undefined;

  const loadBlendData = useStore((state) => state.loadBlendData);

  useEffect(() => {
    const update = async () => {
      await loadBlendData(false, "CCG4HM7SML3CUKWO2WOXDR2HCH5EMIIYVNPFB2EMQPWI6KURL46XB54H", connected ? walletAddress : undefined);
    };
    update();
    const refreshInterval = setInterval(async () => {
      await update();
    }, 25 * 1000);
    return () => clearInterval(refreshInterval);
  }, [loadBlendData, connected, walletAddress]);

  if (safePoolId && safePoolId !== lastPool) {
    setLastPool(safePoolId);
  }

  const mainWidth = viewType <= ViewType.COMPACT ? '100%' : '886px';
  const mainMargin = viewType <= ViewType.COMPACT ? '0px' : '62px';
  return (
    <>
      <Box sx={{ height: '30px' }} />
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <Box />
        <Box component="main" sx={{ width: mainWidth, minWidth: '350px' }}>
          <NavBar />
          <Box sx={{ marginLeft: mainMargin, marginRight: mainMargin }}>
            <Row>
              <WalletWarning />
            </Row>
            {children}
            <OverlayModal />
            <OverlayModalTOS />
          </Box>
        </Box>
        <Box />
      </Box>
    </>
  );
}

import { Box } from '@mui/material';
import { ReactNode, useEffect } from 'react';
import { FaucetBanner } from '../components/common/FaucetBanner';
import { OverlayModal } from '../components/common/OverlayModal';
import { Row } from '../components/common/Row';
import { WalletWarning } from '../components/common/WalletWarning';
import { NavBar } from '../components/nav/NavBar';
import { ViewType, useSettings } from '../contexts';
import { useWallet } from '../contexts/wallet';
import { useStore } from '../store/store';

export default function DefaultLayout({ children }: { children: ReactNode }) {
  const { viewType, lastPool } = useSettings();
  const { connected, walletAddress } = useWallet();

  const loadBlendData = useStore((state) => state.loadBlendData);
  const rewardZone = useStore((state) => state.backstop?.config?.rewardZone ?? []);

  useEffect(() => {
    const update = async () => {
      console.log('update');
      await loadBlendData(false, undefined, connected ? walletAddress : undefined);
    };
    update();
    const refreshInterval = setInterval(async () => {
      await update();
    }, 10 * 1000);
    return () => clearInterval(refreshInterval);
  }, [loadBlendData, connected, walletAddress]);

  const faucet_pool = lastPool ? lastPool : rewardZone.length > 0 ? rewardZone[0] : undefined;

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
            {faucet_pool && (
              <Row>
                <FaucetBanner poolId={faucet_pool} />
              </Row>
            )}
            {children}
            <OverlayModal />
          </Box>
        </Box>
        <Box />
      </Box>
    </>
  );
}

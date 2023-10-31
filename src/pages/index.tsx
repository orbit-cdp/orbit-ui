import type { NextPage } from 'next';
import { useEffect } from 'react';
import { Divider } from '../components/common/Divider';
import { Row } from '../components/common/Row';
import { SectionBase } from '../components/common/SectionBase';
import { WalletWarning } from '../components/common/WalletWarning';
import { MarketCard } from '../components/markets/MarketCard';
import { useStore } from '../store/store';

const Markets: NextPage = () => {
  const loadBackstopData = useStore((state) => state.loadBackstopData);
  const loadPoolData = useStore((state) => state.loadPoolData);
  const rewardZone = useStore((state) => state.backstopConfig.rewardZone);
  useEffect(() => {
    const updateMarket = async () => {
      rewardZone.forEach(async (poolId) => {
        await loadPoolData(poolId);
        await loadBackstopData(poolId);
      });
    };
    if (rewardZone.length != 0) {
      updateMarket();
      const refreshInterval = setInterval(async () => {
        await updateMarket();
      }, 30 * 1000);
      return () => clearInterval(refreshInterval);
    }
  }, [loadBackstopData, loadPoolData, rewardZone]);

  return (
    <>
      <Row>
        <WalletWarning />
      </Row>
      <Row>
        <SectionBase type="alt" sx={{ margin: '6px', padding: '6px' }}>
          Markets
        </SectionBase>
      </Row>
      <Divider />
      {rewardZone.map((poolId) => (
        <MarketCard key={poolId} poolId={poolId}></MarketCard>
      ))}
    </>
  );
};

export default Markets;

import type { NextPage } from 'next';
import { useEffect, useRef } from 'react';
import { Divider } from '../components/common/Divider';
import { Row } from '../components/common/Row';
import { SectionBase } from '../components/common/SectionBase';
import { WalletWarning } from '../components/common/WalletWarning';
import { MarketCard } from '../components/markets/MarketCard';
import { useStore } from '../store/store';

const Markets: NextPage = () => {
  const isMounted = useRef(false);
  const refreshBackstopData = useStore((state) => state.refreshBackstopData);
  const refreshPoolReserveAll = useStore((state) => state.refreshPoolReserveAll);
  const estimateToLatestLedger = useStore((state) => state.estimateToLatestLedger);

  const rewardZone = useStore((state) => state.rewardZone);

  useEffect(() => {
    if (isMounted.current && rewardZone.length == 0) {
      refreshBackstopData();
    } else {
      isMounted.current = true;
    }
  }, [refreshBackstopData]);

  useEffect(() => {
    const loadPoolReserveInfo = async (poolId: string) => {
      await refreshPoolReserveAll(poolId);
      await estimateToLatestLedger(poolId);
    };
    if (isMounted.current && rewardZone.length != 0) {
      rewardZone.forEach((poolId) => {
        loadPoolReserveInfo(poolId);
      });
    }
  }, [rewardZone]);

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

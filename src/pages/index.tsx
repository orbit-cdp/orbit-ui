import type { NextPage } from 'next';
import { Divider } from '../components/common/Divider';
import { Row } from '../components/common/Row';
import { SectionBase } from '../components/common/SectionBase';
import { MarketCard } from '../components/markets/MarketCard';
import { useStore } from '../store/store';

const Markets: NextPage = () => {
  const rewardZone = useStore((state) => state.backstop?.config?.rewardZone ?? []);

  return (
    <>
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

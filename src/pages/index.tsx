import type { NextPage } from 'next';
import { Divider } from '../components/common/Divider';
import { Row } from '../components/common/Row';
import { SectionBase } from '../components/common/SectionBase';
import { WalletWarning } from '../components/common/WalletWarning';
import { MarketCard } from '../components/markets/MarketCard';

const Markets: NextPage = () => {
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
      <MarketCard name="Blend"></MarketCard>
      <MarketCard name="Stellar"></MarketCard>
      <MarketCard name="LumenSwap"></MarketCard>
    </>
  );
};

export default Markets;

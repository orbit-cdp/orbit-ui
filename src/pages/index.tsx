import type { NextPage } from 'next';
import { Row } from '../components/common/Row';
import { SectionBase } from '../components/common/SectionBase';
import { PoolCard } from '../components/markets/PoolCard';

const Markets: NextPage = () => {
  return (
    <>
      <Row>
        <SectionBase type="alt" sx={{ margin: '6px', padding: '6px' }}>
          Markets
        </SectionBase>
      </Row>
      <Row
        sx={{
          background: '#212429E5',
          height: '2px',
          width: 'calc(100% - 24px)',
          margin: '12px',
        }}
      ></Row>
      <PoolCard></PoolCard>
    </>
  );
};

export default Markets;

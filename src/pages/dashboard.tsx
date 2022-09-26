import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Row } from '../components/common/Row';
import { SectionSize } from '../components/common/Section';
import { SectionBase } from '../components/common/SectionBase';
import { WalletWarning } from '../components/common/WalletWarning';

const Dashboard: NextPage = () => {
  const router = useRouter();
  const { poolId } = router.query;

  return (
    <Row>
      <SectionBase sx={{ width: SectionSize.FULL, margin: '6px' }}>
        <WalletWarning />
      </SectionBase>
    </Row>
  );
};

export default Dashboard;

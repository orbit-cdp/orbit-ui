import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Row } from '../components/common/Row';
import { Section, SectionSize } from '../components/common/Section';

const ManageBackstop: NextPage = () => {
  const router = useRouter();
  const { poolId, action } = router.query;

  return (
    <>
      <Row>
        <Section width={SectionSize.LARGE}>Backstop? page for:</Section>
        <Section width={SectionSize.SMALL}>{poolId}</Section>
      </Row>
      <Row>
        <Section width={SectionSize.LARGE}>{action ?? 'deposit'}</Section>
      </Row>
    </>
  );
};

export default ManageBackstop;

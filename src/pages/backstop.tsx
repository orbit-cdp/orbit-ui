import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Row } from '../components/common/Row';
import { Section, SectionSize } from '../components/common/Section';

const Backstop: NextPage = () => {
  const router = useRouter();
  const { poolId } = router.query;

  return (
    <Row>
      <Section width={SectionSize.LARGE}>Backstop for:</Section>
      <Section width={SectionSize.SMALL}>{poolId}</Section>
    </Row>
  );
};

export default Backstop;

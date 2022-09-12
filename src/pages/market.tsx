import type { NextPage } from 'next';
import { Row } from '../components/common/Row';
import { Section, SectionSize } from '../components/common/Section';

const Market: NextPage = () => {
  return (
    <Row>
      <Section width={SectionSize.LARGE}>Large Section</Section>
      <Section width={SectionSize.SMALL}>Small Section</Section>
    </Row>
  );
};

export default Market;

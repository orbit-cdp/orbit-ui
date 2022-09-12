import type { NextPage } from 'next';
import { Row } from '../components/common/Row';
import { Section, SectionSize } from '../components/common/Section';

const Test: NextPage = () => {
  return (
    <Row>
      <Section width={SectionSize.TILE}>Half! Section</Section>
      <Section width={SectionSize.TILE}>Half! Section</Section>
    </Row>
  );
};

export default Test;

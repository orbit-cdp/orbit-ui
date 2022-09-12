import type { NextPage } from 'next';
import { Row } from '../components/common/Row';
import { Section, SectionSize } from '../components/common/Section';

const Home: NextPage = () => {
  return (
    <Row>
      <Section width={SectionSize.FULL}>Dashboard</Section>
    </Row>
  );
};

export default Home;

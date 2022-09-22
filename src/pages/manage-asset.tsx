import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Row } from '../components/common/Row';
import { Section, SectionSize } from '../components/common/Section';

const ManageAsset: NextPage = () => {
  const router = useRouter();
  const { poolId, assetId, action } = router.query;

  return (
    <>
      <Row>
        <Section width={SectionSize.LARGE}>Asset? page for:</Section>
        <Section width={SectionSize.SMALL}>{poolId}</Section>
      </Row>
      <Row>
        <Section width={SectionSize.LARGE}>{assetId}</Section>
        <Section width={SectionSize.SMALL}>{action ?? 'lend'}</Section>
      </Row>
    </>
  );
};

export default ManageAsset;

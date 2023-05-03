import { PoolHeader } from '../pool/PoolHeader';
import { GoBackButton } from './GoBackButton';
import { PoolComponentProps } from './PoolComponentProps';
import { Section, SectionSize } from './Section';

export const GoBackHeader: React.FC<PoolComponentProps> = ({ poolId }) => {
  return (
    <Section width={SectionSize.FULL} sx={{ padding: '12px' }}>
      <GoBackButton />
      <PoolHeader poolId={poolId} />
    </Section>
  );
};

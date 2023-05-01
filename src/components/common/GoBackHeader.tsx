import { useStore } from '../../store/store';
import { PoolHeader } from '../pool/PoolHeader';
import { GoBackButton } from './GoBackButton';
import { PoolComponentProps } from './PoolComponentProps';
import { Section, SectionSize } from './Section';

export const GoBackHeader: React.FC<PoolComponentProps> = ({ poolId }) => {
  const pool = useStore((state) => state.pools.get(poolId));
  return (
    <Section width={SectionSize.FULL} sx={{ padding: '12px' }}>
      <GoBackButton />
      <PoolHeader name={pool?.name ?? 'unknown'} />
    </Section>
  );
};

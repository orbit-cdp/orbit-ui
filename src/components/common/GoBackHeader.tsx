import { BoxProps } from '@mui/material';
import { PoolHeader } from '../pool/PoolHeader';
import { GoBackButton } from './GoBackButton';
import { Section, SectionSize } from './Section';

export const GoBackHeader: React.FC<BoxProps> = () => {
  return (
    <Section width={SectionSize.FULL} sx={{ padding: '12px' }}>
      <GoBackButton />
      <PoolHeader name="Blend" />
    </Section>
  );
};

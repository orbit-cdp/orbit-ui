import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Button, useTheme } from '@mui/material';
import { Row } from '../common/Row';
import { Section, SectionSize } from '../common/Section';
import { PoolHeader } from './PoolHeader';

export const PoolNavBar = () => {
  const theme = useTheme();
  return (
    <Row>
      <Section width={SectionSize.FULL} sx={{ alignItems: 'center', justifyContent: 'flex-start' }}>
        <Button
          variant="text"
          color="inherit"
          startIcon={<ArrowBackIcon />}
          sx={{ marginRight: '12px' }}
        >
          Go Back
        </Button>
        <PoolHeader name="YieldBlox" />
      </Section>
    </Row>
  );
};

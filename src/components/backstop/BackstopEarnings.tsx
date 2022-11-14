import { Box, Typography, useTheme } from '@mui/material';
import { OpaqueButton } from '../common/OpaqueButton';
import { Row } from '../common/Row';
import { Section, SectionSize } from '../common/Section';
import { BSEarningsList } from './BSEarningsList';

export const BackstopEarnings = () => {
  const theme = useTheme();

  return (
    <Row>
      <Section width={SectionSize.FULL} sx={{ display: 'flex', flexDirection: 'column' }}>
        <Row>
          <Box
            sx={{
              margin: '6px',
              padding: '6px',
              width: '100%',
              alignItems: 'center',
              backgroundColor: theme.palette.background.default,
              borderRadius: '5px',
            }}
          >
            <Typography sx={{ padding: '6px' }}>Backstop earnings to claim</Typography>
          </Box>
        </Row>
        <Row>
          <OpaqueButton
            palette={theme.palette.primary}
            sx={{ width: '100%', margin: '6px', padding: '6px' }}
          >
            Confirm claim
          </OpaqueButton>
        </Row>
        <BSEarningsList />
      </Section>
    </Row>
  );
};

import { Box, Typography, useTheme } from '@mui/material';
import { LinkBox } from '../common/LinkBox';
import { OpaqueButton } from '../common/OpaqueButton';
import { Row } from '../common/Row';
import { Section, SectionSize } from '../common/Section';
import { TokenIcon } from '../common/TokenIcon';

export const BackstopDepositBalanceCard = () => {
  const theme = useTheme();

  return (
    <Section
      width={SectionSize.FULL}
      sx={{
        flexDirection: 'column',
        paddingTop: '12px',
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <Typography variant="body2" sx={{ margin: '6px' }}>
        Backstop deposit balance
      </Typography>
      <Row>
        <Box
          sx={{
            width: '100%',
            margin: '6px',
            padding: '12px',
            color: theme.palette.text.primary,
            backgroundColor: theme.palette.background.default,
            borderRadius: '5px',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
            <TokenIcon symbol="blndusdclp" sx={{ marginRight: '12px' }}></TokenIcon>
            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
              <Typography variant="h4" sx={{ marginRight: '6px' }}>
                688.666k
              </Typography>
              <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                BLND-USDC LP
              </Typography>
            </Box>
          </Box>
        </Box>
      </Row>
      <LinkBox
        sx={{ width: '100%', paddingRight: '12px' }}
        to={{ pathname: '/backstop-q4w', query: { poolId: 'poolId' } }}
      >
        <OpaqueButton
          palette={theme.palette.primary}
          sx={{ width: '100%', margin: '6px', padding: '6px' }}
        >
          Queue for withdrawal
        </OpaqueButton>
      </LinkBox>
    </Section>
  );
};

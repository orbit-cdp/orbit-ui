import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Box, CircularProgress, Typography, useTheme } from '@mui/material';
import { OpaqueButton } from '../common/OpaqueButton';
import { Row } from '../common/Row';
import { Section, SectionSize } from '../common/Section';
import { TokenIcon } from '../common/TokenIcon';

export const BackstopQueue = () => {
  const theme = useTheme();

  const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000;
  const NOW_IN_MS = new Date().getTime();
  const dateTimeAfterThirtyDays = NOW_IN_MS + THIRTY_DAYS_IN_MS;

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
            <Typography sx={{ padding: '6px' }}>Queued for withdrawal</Typography>
          </Box>
        </Row>
        <Row>
          <OpaqueButton
            palette={theme.palette.primary}
            sx={{ width: '100%', margin: '6px', padding: '6px' }}
          >
            New queue
          </OpaqueButton>
        </Row>
        <Row>
          <Box sx={{ margin: '6px', padding: '6px', display: 'flex', alignItems: 'center' }}>
            <CheckCircleOutlineIcon
              sx={{ color: theme.palette.primary.main, marginRight: '12px', fontSize: '35px' }}
            />
            <TokenIcon symbol="blndusdclp" sx={{ marginRight: '12px' }}></TokenIcon>
            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
              <Typography variant="h4" sx={{ marginRight: '6px' }}>
                668.886k
              </Typography>
              <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                BLND-USDC LP
              </Typography>
            </Box>
          </Box>
        </Row>
        <Row>
          <OpaqueButton
            palette={theme.palette.positive}
            sx={{ width: '100%', margin: '6px', padding: '6px' }}
          >
            Withdraw
          </OpaqueButton>
        </Row>
        <Row>
          <Box sx={{ margin: '6px', padding: '6px', display: 'flex', alignItems: 'center' }}>
            <CircularProgress
              sx={{ color: theme.palette.backstop.main, marginRight: '12px' }}
              variant="determinate"
              value={75}
            />
            <TokenIcon symbol="blnd" sx={{ marginRight: '12px' }}></TokenIcon>
            <Box>
              <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                <Typography variant="h4" sx={{ marginRight: '6px' }}>
                  688.666k
                </Typography>
                <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                  BLND
                </Typography>
              </Box>
              <Typography variant="body2">21d 23h 58m 55s</Typography>
            </Box>
          </Box>
        </Row>
      </Section>
    </Row>
  );
};

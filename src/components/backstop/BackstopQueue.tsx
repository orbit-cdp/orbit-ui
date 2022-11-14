import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Box, CircularProgress, Typography, useTheme } from '@mui/material';
import { NextText } from '../common/NextText';
import { OpaqueButton } from '../common/OpaqueButton';
import { Row } from '../common/Row';
import { Section, SectionSize } from '../common/Section';
import { TokenIcon } from '../common/TokenIcon';

export const BackstopQueue = () => {
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
            <NextText
              title="BLND-USDC LP"
              titleColor="inherit"
              text="668.886k"
              textColor="inherit"
              type="normal"
            />
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
              <NextText
                title="BLND"
                titleColor="inherit"
                text="668.886k"
                textColor="inherit"
                type="normal"
              />
              <Typography variant="body2">21d 23h 58m 55s</Typography>
            </Box>
          </Box>
        </Row>
      </Section>
    </Row>
  );
};

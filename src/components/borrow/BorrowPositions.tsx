import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Box, Typography, useTheme } from '@mui/material';
import { CustomButton } from '../common/CustomButton';
import { LinkBox } from '../common/LinkBox';
import { Row } from '../common/Row';
import { Section, SectionSize } from '../common/Section';
import { StackedText } from '../common/StackedText';
import { TokenIcon } from '../common/TokenIcon';

export const BorrowPositions = () => {
  const theme = useTheme();

  return (
    <Row>
      <Section width={SectionSize.FULL} sx={{ flexDirection: 'column', paddingTop: '12px' }}>
        <Typography variant="body2" sx={{ margin: '6px' }}>
          Your borrowed positions
        </Typography>
        <Row>
          <Section width={SectionSize.TILE} sx={{ background: theme.palette.borrow.opaque }}>
            <StackedText
              title="Balance"
              titleColor={theme.palette.text.primary}
              text="888.668k"
              textColor={theme.palette.borrow.main}
              sx={{ width: '100%', padding: '6px' }}
            ></StackedText>
          </Section>
          <Section width={SectionSize.TILE} sx={{ background: theme.palette.borrow.opaque }}>
            <StackedText
              title="APR"
              titleColor={theme.palette.text.primary}
              text="28.888%"
              textColor={theme.palette.borrow.main}
              sx={{ width: '100%', padding: '6px' }}
            ></StackedText>
          </Section>
        </Row>
        <Row>
          <LinkBox
            sx={{ width: '100%', marginRight: '12px' }}
            to={{ pathname: '/repay', query: { poolId: 'poolId' } }}
          >
            <CustomButton
              sx={{
                width: '100%',
                margin: '6px',
                padding: '12px',
                color: theme.palette.text.primary,
                backgroundColor: theme.palette.background.default,
                '&:hover': {
                  color: theme.palette.borrow.main,
                },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                <TokenIcon symbol="blnd" sx={{ marginRight: '12px' }}></TokenIcon>
                <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                  <Typography variant="h4" sx={{ marginRight: '6px' }}>
                    688.666k
                  </Typography>
                  <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                    BLND
                  </Typography>
                </Box>
              </Box>
              <ArrowForwardIcon fontSize="inherit" />
            </CustomButton>
          </LinkBox>
        </Row>
        <Row>
          <LinkBox
            sx={{ width: '100%', marginRight: '12px' }}
            to={{ pathname: '/repay', query: { poolId: 'poolId' } }}
          >
            <CustomButton
              sx={{
                width: '100%',
                margin: '6px',
                padding: '12px',
                color: theme.palette.text.primary,
                backgroundColor: theme.palette.background.default,
                '&:hover': {
                  color: theme.palette.borrow.main,
                },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
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
              <ArrowForwardIcon fontSize="inherit" />
            </CustomButton>
          </LinkBox>
        </Row>
      </Section>
    </Row>
  );
};

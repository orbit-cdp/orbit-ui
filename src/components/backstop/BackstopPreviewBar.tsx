import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Box, useTheme } from '@mui/material';
import { CustomButton } from '../common/CustomButton';
import { Icon } from '../common/Icon';
import { LinkBox } from '../common/LinkBox';
import { Row } from '../common/Row';
import { Section, SectionSize } from '../common/Section';
import { StackedText } from '../common/StackedText';

export const BackstopPreviewBar = () => {
  const theme = useTheme();

  return (
    <Row>
      <Section width={SectionSize.FULL}>
        <LinkBox
          sx={{ width: '40%' }}
          to={{ pathname: '/backstop-q4w', query: { poolId: 'poolId' } }}
        >
          <CustomButton
            sx={{
              width: '100%',
              margin: '6px',
              padding: '12px',
              color: theme.palette.text.primary,
              backgroundColor: theme.palette.background.default,
              '&:hover': {
                color: theme.palette.backstop.main,
              },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
              <Icon
                src={'/icons/dashboard/emissions_icon.svg'}
                alt={`emissions icon`}
                sx={{ marginRight: '12px' }}
              />
              <StackedText
                title="Claimable earnings"
                titleColor="inherit"
                text="$888.888k"
                textColor="inherit"
                type="large"
              />
            </Box>
            <ArrowForwardIcon fontSize="inherit" />
          </CustomButton>
        </LinkBox>
        <Box
          sx={{
            width: '60%',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <StackedText
              title="Backstop Size"
              titleColor="inherit"
              text="$888.888M"
              textColor="inherit"
              type="large"
            />
            <Icon
              src={'/icons/dashboard/bkstp_size.svg'}
              alt={`backstop size icon`}
              sx={{ marginLeft: '12px' }}
            />
          </Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <StackedText
              title="Backstop Q4W"
              titleColor="inherit"
              text="28.888%"
              textColor="inherit"
              type="large"
            />
            <Icon
              src={'/icons/dashboard/bkstp_queue.svg'}
              alt={`backstop queue icon`}
              isCircle={false}
              sx={{ marginLeft: '12px' }}
            />
          </Box>
        </Box>
      </Section>
    </Row>
  );
};

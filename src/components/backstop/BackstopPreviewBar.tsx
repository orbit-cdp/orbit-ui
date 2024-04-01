import { HelpOutline } from '@mui/icons-material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Box, Skeleton, Tooltip, useTheme } from '@mui/material';
import { ViewType, useSettings } from '../../contexts';
import { useStore } from '../../store/store';
import { toBalance } from '../../utils/formatter';
import { CustomButton } from '../common/CustomButton';
import { Icon } from '../common/Icon';
import { LinkBox } from '../common/LinkBox';
import { PoolComponentProps } from '../common/PoolComponentProps';
import { Row } from '../common/Row';
import { Section, SectionSize } from '../common/Section';
import { StackedText } from '../common/StackedText';
import { PoolStatusBox } from '../pool/PoolStatusBox';

export const BackstopPreviewBar: React.FC<PoolComponentProps> = ({ poolId }) => {
  const { viewType } = useSettings();
  const theme = useTheme();

  const backstopPoolData = useStore((state) => state.backstop?.pools.get(poolId));
  const backstopUserData = useStore((state) => state.backstopUserData?.estimates.get(poolId));

  if (backstopPoolData == undefined) {
    return (
      <Section width={SectionSize.FULL}>
        <Skeleton variant="rectangular" />
      </Section>
    );
  }

  return (
    <Row>
      {viewType === ViewType.REGULAR && (
        <Section
          type="alt"
          width={SectionSize.FULL}
          sx={{ display: 'flex', flexWrap: 'wrap', margin: 'none' }}
        >
          <Box
            sx={{
              width: '50%',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: theme.palette.background.default,
                borderRadius: '5px',
              }}
            >
              <PoolStatusBox
                titleColor="inherit"
                type="large"
                status="Active"
                sx={{ width: '136px' }}
              />
            </Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginLeft: 'auto',
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                <StackedText
                  title="Total Backstop Size"
                  titleColor="inherit"
                  text={`$${toBalance(backstopPoolData.estimates.totalSpotValue)}`}
                  textColor="inherit"
                  type="large"
                />
                <Tooltip title="The amount of capital insuring this pool." placement="top">
                  <HelpOutline sx={{ width: '15px', marginLeft: '4px', marginTop: '-4px' }} />
                </Tooltip>
              </Box>
              <Icon
                src={'/icons/dashboard/bkstp_size.svg'}
                alt={`backstop size icon`}
                sx={{ marginLeft: '12px' }}
              />
            </Box>
          </Box>
          <LinkBox sx={{ width: '50%' }} to={{ pathname: '/backstop', query: { poolId: poolId } }}>
            <CustomButton
              sx={{
                width: '100%',
                margin: '6px',
                padding: '12px',
                color: theme.palette.text.primary,
                backgroundColor: theme.palette.background.paper,
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
                  title="Your Backstop Balance"
                  titleColor="inherit"
                  text={backstopUserData ? `$${toBalance(backstopUserData.totalSpotValue)}` : '--'}
                  textColor="inherit"
                  type="large"
                />
              </Box>
              <ArrowForwardIcon fontSize="inherit" />
            </CustomButton>
          </LinkBox>
        </Section>
      )}
      {viewType !== ViewType.REGULAR && (
        <Section
          type="alt"
          width={SectionSize.FULL}
          sx={{ display: 'flex', flexWrap: 'wrap', margin: 'none' }}
        >
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-around',
              alignItems: 'center',
              marginTop: '12px',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                <StackedText
                  title="Total Backstop Size"
                  titleColor="inherit"
                  text={`$${toBalance(backstopPoolData.estimates.totalSpotValue)}`}
                  textColor="inherit"
                  type="large"
                />
                <Tooltip title="The amount of capital insuring this pool." placement="top">
                  <HelpOutline sx={{ width: '15px', marginLeft: '4px', marginTop: '-4px' }} />
                </Tooltip>
              </Box>
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
                backgroundColor: theme.palette.background.default,
                padding: '12px',
                borderRadius: '5px',
                marginRight: '-30px',
              }}
            >
              <PoolStatusBox
                titleColor="inherit"
                type="large"
                status="Active"
                sx={{ width: '136px' }}
              />
            </Box>
          </Box>
          <LinkBox
            sx={{ width: '100%', margin: '6px' }}
            to={{ pathname: '/backstop-q4w', query: { poolId: 'poolId' } }}
          >
            <CustomButton
              sx={{
                width: '100%',
                padding: '12px',
                color: theme.palette.text.primary,
                backgroundColor: theme.palette.background.paper,
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
                  title="Your Backstop Balance"
                  titleColor="inherit"
                  text={backstopUserData ? `$${toBalance(backstopUserData.totalSpotValue)}` : '--'}
                  textColor="inherit"
                  type="large"
                />
              </Box>
              <ArrowForwardIcon fontSize="inherit" />
            </CustomButton>
          </LinkBox>
        </Section>
      )}
    </Row>
  );
};

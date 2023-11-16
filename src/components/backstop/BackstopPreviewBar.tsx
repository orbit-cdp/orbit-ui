import { HelpOutline } from '@mui/icons-material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Box, Tooltip, useTheme } from '@mui/material';
import { useSettings, ViewType } from '../../contexts';
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

  const backstopPoolEstimate = useStore((state) => state.backstop_pool_est.get(poolId));
  const backstopUserEstimate = useStore((state) => state.backstop_user_est.get(poolId));
  const backstopTokenToBase = useStore((state) => state.backstopData.backstopTokenPrice);
  const tokenToBase = Number(backstopTokenToBase) / 1e7;
  const userBalance = backstopUserEstimate
    ? Number(backstopUserEstimate.depositBalance) * tokenToBase
    : undefined;

  return (
    <Row>
      {viewType === ViewType.REGULAR && (
        <Section width={SectionSize.FULL} sx={{ display: 'flex', flexWrap: 'wrap' }}>
          <LinkBox sx={{ width: '40%' }} to={{ pathname: '/backstop', query: { poolId: poolId } }}>
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
                  title="Your Backstop Balance"
                  titleColor="inherit"
                  text={userBalance ? `$${toBalance(userBalance)}` : '--'}
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
              <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                <StackedText
                  title="Total Backstop Size"
                  titleColor="inherit"
                  text={`$${toBalance(backstopPoolEstimate?.backstopSize)}`}
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
        </Section>
      )}
      {viewType !== ViewType.REGULAR && (
        <Section width={SectionSize.FULL} sx={{ display: 'flex', flexWrap: 'wrap' }}>
          <LinkBox
            sx={{ width: '100%', margin: '6px' }}
            to={{ pathname: '/backstop-q4w', query: { poolId: 'poolId' } }}
          >
            <CustomButton
              sx={{
                width: '100%',
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
                  title="Your Backstop Balance"
                  titleColor="inherit"
                  text={userBalance ? `$${toBalance(userBalance)}` : '--'}
                  textColor="inherit"
                  type="large"
                />
              </Box>
              <ArrowForwardIcon fontSize="inherit" />
            </CustomButton>
          </LinkBox>
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
              <StackedText
                title="Total Backstop Size"
                titleColor="inherit"
                text={`$${toBalance(backstopPoolEstimate?.backstopSize)}`}
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
        </Section>
      )}
    </Row>
  );
};

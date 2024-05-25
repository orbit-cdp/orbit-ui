import { BackstopPool, Pool } from '@blend-capital/blend-sdk';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Box, BoxProps, Typography, useTheme } from '@mui/material';
import { ViewType, useSettings } from '../../contexts';
import { toCompactAddress, toPercentage } from '../../utils/formatter';
import { Icon } from '../common/Icon';
import { LinkBox } from '../common/LinkBox';
import { OpaqueButton } from '../common/OpaqueButton';
import { Row } from '../common/Row';
import { SectionSize } from '../common/Section';
import { StackedTextBox } from '../common/StackedTextBox';
import { PoolIcon } from '../pool/PoolIcon';
import { MarketsList } from './MarketsList';

export interface MarketCardCollapseProps extends BoxProps {
  poolData: Pool;
  backstopPoolData: BackstopPool;
}

export const MarketCardCollapse: React.FC<MarketCardCollapseProps> = ({
  poolData,
  backstopPoolData,
  sx,
  ...props
}) => {
  const theme = useTheme();
  const { viewType } = useSettings();

  const estBackstopApy =
    ((poolData.config.backstopRate / 1e7) *
      poolData.estimates.totalBorrowApy *
      poolData.estimates.totalBorrow) /
    backstopPoolData.estimates.totalSpotValue;
  return (
    <Box
      sx={{
        flexWrap: 'wrap',
        ...sx,
      }}
      {...props}
    >
      <Row>
        <OpaqueButton
          palette={theme.palette.accent}
          sx={{
            width: SectionSize.FULL,
            margin: '6px',
            padding: '6px',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: theme.palette.text.secondary,
            cursor: 'default',
          }}
          onClick={() =>
            window.open(
              `${process.env.NEXT_PUBLIC_STELLAR_EXPERT_URL}/contract/${poolData.id}`,
              '_blank'
            )
          }
        >
          <PoolIcon
            name={poolData.config.name}
            sx={{ margin: '6px', height: '30px', width: '30px' }}
          />
          <Box sx={{ padding: '6px', display: 'flex', flexDirection: 'row', height: '30px' }}>
            <Box sx={{ paddingRight: '12px', lineHeight: '100%' }}>{`Pool ${toCompactAddress(
              poolData.id
            )}`}</Box>
            <Box>
              <OpenInNewIcon fontSize="inherit" />
            </Box>
          </Box>
        </OpaqueButton>
      </Row>
      <Row
        sx={{
          flex: 'flex',
          flexDirection: viewType === ViewType.REGULAR ? 'row' : 'column',
        }}
      >
        <OpaqueButton
          palette={theme.palette.accent}
          sx={{
            width: SectionSize.FULL,
            margin: '6px',
            padding: '6px',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: theme.palette.text.secondary,
            cursor: 'default',
          }}
          onClick={() =>
            window.open(
              `${process.env.NEXT_PUBLIC_STELLAR_EXPERT_URL}/contract/${poolData.config.oracle}`,
              '_blank'
            )
          }
        >
          <Box sx={{ margin: '6px', height: '30px' }}>
            <Icon src={'/icons/pageicons/oracle_icon.svg'} alt="oracle-icon" isCircle={false} />
          </Box>
          <Box sx={{ padding: '6px', display: 'flex', flexDirection: 'row', height: '30px' }}>
            <Box sx={{ paddingRight: '12px', lineHeight: '100%' }}>{`Oracle ${toCompactAddress(
              poolData.config.oracle
            )}`}</Box>
            <Box>
              <OpenInNewIcon fontSize="inherit" />
            </Box>
          </Box>
        </OpaqueButton>
        <OpaqueButton
          palette={theme.palette.accent}
          sx={{
            width: SectionSize.FULL,
            margin: '6px',
            padding: '6px',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: theme.palette.text.secondary,
            cursor: 'default',
          }}
          onClick={() => {
            if (poolData.config.admin.charAt(0) === 'G') {
              window.open(
                `${process.env.NEXT_PUBLIC_STELLAR_EXPERT_URL}/account/${poolData.config.admin}`,
                '_blank'
              );
            } else {
              window.open(
                `${process.env.NEXT_PUBLIC_STELLAR_EXPERT_URL}/contract/${poolData.config.admin}`,
                '_blank'
              );
            }
          }}
        >
          <Box sx={{ margin: '6px', height: '30px', width: '30px' }}>
            <AdminPanelSettingsIcon sx={{ fontSize: 30 }} />
          </Box>
          <Box sx={{ padding: '6px', display: 'flex', flexDirection: 'row', height: '30px' }}>
            <Box sx={{ paddingRight: '12px', lineHeight: '100%' }}>{`Admin ${toCompactAddress(
              poolData.config.admin
            )}`}</Box>
            <Box>
              <OpenInNewIcon fontSize="inherit" />
            </Box>
          </Box>
        </OpaqueButton>
      </Row>
      <Row>
        <LinkBox
          sx={{ width: '100%', marginRight: '12px' }}
          to={{ pathname: '/backstop', query: { poolId: poolData.id } }}
        >
          <OpaqueButton
            palette={theme.palette.backstop}
            sx={{
              width: '100%',
              margin: '6px',
              padding: '6px',
              alignItems: 'center',
              color: theme.palette.backstop.main,
            }}
          >
            <Box
              sx={{
                flexWrap: 'flex',
                width: '100%',
                borderRadius: '5px',
                '&:hover': {
                  background: theme.palette.backstop.opaque,
                },
              }}
            >
              <Row sx={{ alignItems: 'center' }}>
                <Box
                  sx={{
                    margin: '6px',
                    padding: '6px',
                    width: '100%',
                    color: theme.palette.text.primary,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ float: 'left' }}
                  >{`${name} Pool Backstop`}</Typography>
                </Box>
                <Box
                  sx={{
                    padding: '6px',
                    display: 'flex',
                    flexDirection: 'row',
                    height: '30px',
                    color: theme.palette.text.primary,
                  }}
                >
                  <ArrowForwardIcon fontSize="inherit" />
                </Box>
              </Row>
              <Row>
                <StackedTextBox
                  name="APY"
                  text={toPercentage(estBackstopApy)}
                  sx={{ width: '50%' }}
                />
                <StackedTextBox
                  name="Q4W"
                  text={toPercentage(backstopPoolData.estimates.q4wPercentage)}
                  sx={{ width: '50%', color: theme.palette.backstop.main }}
                />
                <StackedTextBox
                  name="Take Rate"
                  text={toPercentage(poolData.config.backstopRate / 1e7)}
                  sx={{ width: '50%', color: theme.palette.backstop.main }}
                />
              </Row>
            </Box>
          </OpaqueButton>
        </LinkBox>
      </Row>
      <MarketsList poolData={poolData} />
    </Box>
  );
};

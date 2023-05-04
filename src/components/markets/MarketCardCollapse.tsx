import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Box, Typography, useTheme } from '@mui/material';
import { useStore } from '../../store/store';
import { toCompactAddress, toPercentage } from '../../utils/formatter';
import { Icon } from '../common/Icon';
import { LinkBox } from '../common/LinkBox';
import { OpaqueButton } from '../common/OpaqueButton';
import { PoolComponentProps } from '../common/PoolComponentProps';
import { Row } from '../common/Row';
import { StackedTextBox } from '../common/StackedTextBox';
import { MarketsList } from './MarketsList';

export const MarketCardCollapse: React.FC<PoolComponentProps> = ({ poolId, sx, ...props }) => {
  const theme = useTheme();

  const pool = useStore((state) => state.pools.get(poolId));
  const poolEst = useStore((state) => state.pool_est.get(poolId));
  const backstopTokenToBase = useStore((state) => state.backstopTokenPrice);
  const backstopPoolBalance = useStore((state) => state.poolBackstopBalance.get(poolId));

  const tokenToBase = Number(backstopTokenToBase) / 1e7;
  const estBackstopSize = backstopPoolBalance
    ? (Number(backstopPoolBalance.tokens) / 1e7) * tokenToBase
    : undefined;
  const estBackstopApy =
    poolEst && estBackstopSize ? poolEst.total_backstop_take_base / estBackstopSize : undefined;
  const poolQ4W = backstopPoolBalance
    ? Number(backstopPoolBalance.q4w) / Number(backstopPoolBalance.shares)
    : undefined;

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
            width: '100%',
            margin: '6px',
            padding: '6px',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: theme.palette.text.secondary,
          }}
        >
          <Box sx={{ margin: '6px', height: '30px' }}>
            <Icon src={'/icons/pageicons/oracle_icon.svg'} alt="oracle-icon" isCircle={false} />
          </Box>
          <Box sx={{ padding: '6px', display: 'flex', flexDirection: 'row', height: '30px' }}>
            <Box sx={{ paddingRight: '12px', lineHeight: '100%' }}>{`Oracle ${toCompactAddress(
              pool?.config.oracle
            )}`}</Box>
            <Box>
              <ArrowForwardIcon fontSize="inherit" />
            </Box>
          </Box>
        </OpaqueButton>
      </Row>
      <Row>
        <LinkBox
          sx={{ width: '100%', marginRight: '12px' }}
          to={{ pathname: '/backstop', query: { poolId: poolId } }}
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
                  name="Backstop APR"
                  text={toPercentage(estBackstopApy)}
                  sx={{ width: '50%' }}
                />
                <StackedTextBox
                  name="Q4W"
                  text={toPercentage(poolQ4W)}
                  sx={{ width: '50%', color: theme.palette.backstop.main }}
                />
              </Row>
            </Box>
          </OpaqueButton>
        </LinkBox>
      </Row>
      <MarketsList poolId={poolId} />
    </Box>
  );
};

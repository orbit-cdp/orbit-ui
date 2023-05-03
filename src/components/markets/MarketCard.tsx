import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Box, Collapse, useTheme } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useStore } from '../../store/store';
import { toBalance } from '../../utils/formatter';
import { TOKEN_META } from '../../utils/token_display';
import { LinkBox } from '../common/LinkBox';
import { OpaqueButton } from '../common/OpaqueButton';
import { PoolComponentProps } from '../common/PoolComponentProps';
import { Row } from '../common/Row';
import { Section, SectionSize } from '../common/Section';
import { StackedTextHLBox } from '../common/StackedTextHLBox';
import { TokenIcon } from '../common/TokenIcon';
import { PoolHeader } from '../pool/PoolHeader';
import { MarketCardCollapse } from './MarketCardCollapse';

export const MarketCard: React.FC<PoolComponentProps> = ({ poolId, sx }) => {
  const theme = useTheme();
  const isMounted = useRef(false);

  const [expand, setExpand] = useState(false);

  const refreshPoolReserveAll = useStore((state) => state.refreshPoolReserveAll);
  const refreshPrices = useStore((state) => state.refreshPrices);
  const estimateToLatestLedger = useStore((state) => state.estimateToLatestLedger);
  const pool = useStore((state) => state.pools.get(poolId));
  const poolEst = useStore((state) => state.pool_est.get(poolId));
  const backstopTokenToBase = useStore((state) => state.backstopTokenPrice);
  const backstopPoolBalance = useStore((state) => state.poolBackstopBalance.get(poolId));

  const tokenToBase = Number(backstopTokenToBase) / 1e7;
  const estBackstopSize = backstopPoolBalance
    ? (Number(backstopPoolBalance.tokens) / 1e7) * tokenToBase
    : undefined;

  const [rotateArrow, setRotateArrow] = useState(false);
  const rotate = rotateArrow ? 'rotate(180deg)' : 'rotate(0)';

  useEffect(() => {
    const refreshAndEstimate = async () => {
      if (poolEst == undefined) {
        await refreshPoolReserveAll(poolId);
        await refreshPrices(poolId);
        await estimateToLatestLedger(poolId);
      }
    };

    if (isMounted.current) {
      refreshAndEstimate();
    } else {
      isMounted.current = true;
    }
  }, [poolEst]);

  return (
    <Section width={SectionSize.FULL} sx={{ flexDirection: 'column', marginBottom: '12px', ...sx }}>
      <Box
        onClick={() => {
          setExpand(!expand);
          setRotateArrow(!rotateArrow);
        }}
        sx={{
          width: '100%',
          '&:hover': {
            cursor: 'pointer',
            filter: 'brightness(110%)',
          },
        }}
      >
        <Row>
          <PoolHeader poolId={poolId} sx={{ margin: '6px', padding: '6px' }} />
          <Box
            sx={{
              margin: '6px',
              padding: '6px',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Box
              sx={{ color: theme.palette.text.secondary, paddingRight: '12px', lineHeight: '100%' }}
            >
              Details
            </Box>
            <ArrowDropDownIcon
              sx={{
                color: theme.palette.text.secondary,
                transform: rotate,
                transition: 'all 0.2s linear',
              }}
            />
          </Box>
        </Row>
        <Row>
          <StackedTextHLBox
            name="Lent"
            text={poolEst ? `$${toBalance(poolEst.total_supply_base)}` : '--'}
            palette={theme.palette.lend}
            sx={{ width: '33.33%' }}
          ></StackedTextHLBox>
          <StackedTextHLBox
            name="Borrowed"
            text={poolEst ? `$${toBalance(poolEst.total_liabilities_base)}` : '--'}
            palette={theme.palette.borrow}
            sx={{ width: '33.33%' }}
          ></StackedTextHLBox>
          <StackedTextHLBox
            name="Backstop"
            text={`$${toBalance(estBackstopSize)}`}
            palette={theme.palette.backstop}
            sx={{ width: '33.33%' }}
          ></StackedTextHLBox>
        </Row>
      </Box>
      <Row>
        <LinkBox
          sx={{ width: '100%', marginRight: '12px' }}
          to={{ pathname: '/dashboard', query: { poolId: poolId } }}
        >
          <OpaqueButton
            palette={theme.palette.primary}
            sx={{
              width: '100%',
              margin: '6px',
              padding: '6px',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box sx={{ margin: '6px', height: '30px' }}>
              {pool ? (
                pool.reserves.map((reserveId) => {
                  const code = TOKEN_META[reserveId as keyof typeof TOKEN_META]?.code ?? 'unknown';
                  return <TokenIcon key={reserveId} symbol={code} sx={{ marginRight: '6px' }} />;
                })
              ) : (
                <></>
              )}
            </Box>
            <Box sx={{ padding: '6px', display: 'flex', flexDirection: 'row', height: '30px' }}>
              <Box sx={{ paddingRight: '12px', lineHeight: '100%' }}>Dashboard</Box>
              <Box>
                <ArrowForwardIcon fontSize="inherit" />
              </Box>
            </Box>
          </OpaqueButton>
        </LinkBox>
      </Row>
      <Collapse in={expand} sx={{ width: '100%' }}>
        <MarketCardCollapse poolId={poolId}></MarketCardCollapse>
      </Collapse>
    </Section>
  );
};

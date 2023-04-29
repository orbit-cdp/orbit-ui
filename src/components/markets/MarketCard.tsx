import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Box, BoxProps, Collapse, useTheme } from '@mui/material';
import { useState } from 'react';
import { useStore } from '../../store/store';
import { LinkBox } from '../common/LinkBox';
import { OpaqueButton } from '../common/OpaqueButton';
import { Row } from '../common/Row';
import { Section, SectionSize } from '../common/Section';
import { StackedTextHLBox } from '../common/StackedTextHLBox';
import { TokenIcon } from '../common/TokenIcon';
import { PoolHeader } from '../pool/PoolHeader';
import { MarketCardCollapse } from './MarketCardCollapse';

export interface MarketCardProps extends BoxProps {
  poolId: string;
}

export const MarketCard: React.FC<MarketCardProps> = ({ poolId, sx }) => {
  const theme = useTheme();
  const [expand, setExpand] = useState(false);

  const pool = useStore((state) => state.pools.get(poolId));

  const [rotateArrow, setRotateArrow] = useState(false);
  const rotate = rotateArrow ? 'rotate(180deg)' : 'rotate(0)';

  return (
    <Section width={SectionSize.FULL} sx={{ flexDirection: 'column', marginBottom: '12px' }}>
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
          <PoolHeader name={pool?.name ?? 'blend'} sx={{ margin: '6px', padding: '6px' }} />
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
            palette={theme.palette.lend}
            sx={{ width: '33.33%' }}
          ></StackedTextHLBox>
          <StackedTextHLBox
            name="Borrowed"
            palette={theme.palette.borrow}
            sx={{ width: '33.33%' }}
          ></StackedTextHLBox>
          <StackedTextHLBox
            name="Backstop"
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
              <TokenIcon symbol="blnd" sx={{ marginRight: '6px' }}></TokenIcon>
              <TokenIcon symbol="usdc" sx={{ marginRight: '6px' }}></TokenIcon>
              <TokenIcon symbol="eth" sx={{ marginRight: '6px' }}></TokenIcon>
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
        <MarketCardCollapse name={pool?.name ?? 'blend'}></MarketCardCollapse>
      </Collapse>
    </Section>
  );
};

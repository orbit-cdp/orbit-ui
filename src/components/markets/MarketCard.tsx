import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Box, BoxProps, Collapse, useTheme } from '@mui/material';
import { useState } from 'react';
import { OpaqueButton } from '../common/OpaqueButton';
import { Row } from '../common/Row';
import { Section, SectionSize } from '../common/Section';
import { StackedTextHLBox } from '../common/StackedTextHLBox';
import { TokenIcon } from '../common/TokenIcon';
import { PoolHeader } from '../pool/PoolHeader';
import { MarketCardCollapse } from './MarketCardCollapse';

export interface MarketCardProps extends BoxProps {
  name: string;
}

export const MarketCard: React.FC<MarketCardProps> = ({ name, sx }) => {
  const theme = useTheme();
  const [expand, setExpand] = useState(false);

  return (
    <Section width={SectionSize.FULL} sx={{ flexDirection: 'column', marginBottom: '12px' }}>
      <Box
        onClick={() => setExpand(!expand)}
        sx={{
          width: '100%',
          '&:hover': {
            cursor: 'pointer',
          },
        }}
      >
        <Row>
          <PoolHeader name={name} sx={{ margin: '6px', padding: '6px' }} />
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
            <ArrowDropDownIcon sx={{ color: theme.palette.text.secondary }} />
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
      </Row>
      <Collapse in={expand} sx={{ width: '100%' }}>
        <MarketCardCollapse name={name}></MarketCardCollapse>
      </Collapse>
    </Section>
  );
};

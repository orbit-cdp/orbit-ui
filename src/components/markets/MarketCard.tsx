import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Box } from '@mui/material';
import theme from '../../theme';
import { OpaqueButton } from '../common/OpaqueButton';
import { Row } from '../common/Row';
import { Section, SectionProps } from '../common/Section';
import { StackedTextHLBox } from '../common/StackedTextHLBox';
import { TokenIcon } from '../common/TokenIcon';
import { PoolHeader } from '../pool/PoolHeader';

export interface MarketCardProps extends SectionProps {
  name: string;
}

export const MarketCard: React.FC<MarketCardProps> = ({ name, sx, ...props }) => {
  return (
    <Section
      sx={{
        margin: '6px',
        display: 'flex',
        padding: '6px',
        flexWrap: 'wrap',
        ...sx,
      }}
      {...props}
    >
      <Row sx={{ justifyContent: 'space-between' }}>
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
        <StackedTextHLBox name="Lent" palette={theme.palette.lend}></StackedTextHLBox>
        <StackedTextHLBox name="Borrowed" palette={theme.palette.borrow}></StackedTextHLBox>
        <StackedTextHLBox name="Backstop" palette={theme.palette.backstop}></StackedTextHLBox>
      </Row>
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
    </Section>
  );
};

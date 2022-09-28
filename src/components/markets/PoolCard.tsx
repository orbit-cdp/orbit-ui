import { Box } from '@mui/material';
import theme from '../../theme';
import { OpaqueButton } from '../common/OpaqueButton';
import { Row } from '../common/Row';
import { Section, SectionProps } from '../common/Section';
import { StackedText } from '../common/StackedText';
import { TokenIcon } from '../common/TokenIcon';

export interface PoolCardProps extends SectionProps {}

export const PoolCard: React.FC<PoolCardProps> = ({ sx, ...props }) => {
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
      <Row>
        <Box
          sx={{
            background: '#191B1F',
            padding: '6px',
            margin: '6px',
            width: '33.33%',
            borderRadius: '5px',
            display: 'flex',
            flexDirection: 'row',
          }}
        >
          <StackedText
            title="Lent"
            text="888.888M"
            sx={{ width: '100%', padding: '6px' }}
          ></StackedText>
          <Box
            sx={{
              position: 'relative',
              right: '-4px',
              width: '8px',
              borderRadius: '0 5px 5px 0',
              background: '#00C4EF26',
              margin: '-6px',
            }}
          ></Box>
        </Box>
        <Box
          sx={{
            background: '#191B1F',
            padding: '6px',
            margin: '6px',
            width: '33.33%',
            borderRadius: '5px',
            display: 'flex',
            flexDirection: 'row',
          }}
        >
          <StackedText
            title="Borrowed"
            text="888.888M"
            sx={{ width: '100%', padding: '6px' }}
          ></StackedText>
          <Box
            sx={{
              position: 'relative',
              right: '-4px',
              width: '8px',
              borderRadius: '0 5px 5px 0',
              background: '#FF8A0026',
              margin: '-6px',
            }}
          ></Box>
        </Box>
        <Box
          sx={{
            background: '#191B1F',
            padding: '6px',
            margin: '6px',
            width: '33.33%',
            borderRadius: '5px',
            display: 'flex',
            flexDirection: 'row',
          }}
        >
          <StackedText
            title="Backstop"
            text="888.888M"
            sx={{ width: '100%', padding: '6px' }}
          ></StackedText>
          <Box
            sx={{
              position: 'relative',
              right: '-4px',
              width: '8px',
              borderRadius: '0 5px 5px 0',
              background: '#E16BFF26',
              margin: '-6px',
            }}
          ></Box>
        </Box>
      </Row>
      <Row>
        <OpaqueButton
          palette={theme.palette.primary}
          sx={{
            width: '100%',
            margin: '6px',
            padding: '6px',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ margin: '6px' }}>
            <TokenIcon symbol="blnd" sx={{ marginRight: '6px' }}></TokenIcon>
            <TokenIcon symbol="usdc" sx={{ marginRight: '6px' }}></TokenIcon>
            <TokenIcon symbol="eth" sx={{ marginRight: '6px' }}></TokenIcon>
          </Box>
          <Box sx={{ padding: '6px' }}>Dashboard</Box>
        </OpaqueButton>
      </Row>
    </Section>
  );
};

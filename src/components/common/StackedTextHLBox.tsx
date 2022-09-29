import { Box } from '@mui/material';
import theme from '../../theme';
import { SectionProps } from '../common/Section';
import { StackedText } from '../common/StackedText';

export interface StackedTextHLBoxProps extends SectionProps {
  name: string;
  palette: PaletteColor;
}

export const StackedTextHLBox: React.FC<StackedTextHLBoxProps> = ({
  name,
  palette,
  sx,
  ...props
}) => {
  return (
    <Box
      sx={{
        background: theme.palette.background.default,
        padding: '6px',
        margin: '6px',
        width: '33.33%',
        borderRadius: '5px',
        display: 'flex',
        flexDirection: 'row',
      }}
    >
      <StackedText
        title={`${name}`}
        text="888.888M"
        sx={{ width: '100%', padding: '6px' }}
      ></StackedText>
      <Box
        sx={{
          position: 'relative',
          right: '-4px',
          width: '8px',
          borderRadius: '0 5px 5px 0',
          background: palette.opaque,
          margin: '-6px',
        }}
      ></Box>
    </Box>
  );
};

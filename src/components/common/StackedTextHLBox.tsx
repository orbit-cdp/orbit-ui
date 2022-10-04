import { Box } from '@mui/material';
import theme from '../../theme';
import { SectionProps } from '../common/Section';
import { StackedText } from '../common/StackedText';

export interface StackedTextHLBoxProps extends SectionProps {
  name: string;
  width: string;
}

export const StackedTextHLBox: React.FC<StackedTextHLBoxProps> = ({
  name,
  palette,
  width,
  sx,
  ...props
}) => {
  return (
    <Box
      sx={{
        padding: '6px',
        margin: '6px',
        borderRadius: '5px',
        display: 'flex',
        flexDirection: 'row',
        background: theme.palette.background.default,
        ...sx,
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

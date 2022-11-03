import { Box, BoxProps } from '@mui/material';
import theme from '../../theme';
import { StackedText } from '../common/StackedText';

export interface StackedTextBoxProps extends BoxProps {
  name: string;
}

export const StackedTextBox: React.FC<StackedTextBoxProps> = ({ name, sx, ...props }) => {
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
      {...props}
    >
      <StackedText
        title={`${name}`}
        text="888.888M"
        sx={{ width: '100%', padding: '6px' }}
      ></StackedText>
    </Box>
  );
};

import { Box } from '@mui/material';
import theme from '../../theme';

export const Divider: React.FC<DividerProps> = ({ sx, ...props }) => {
  return (
    <Box
      sx={{
        background: theme.palette.background.paper,
        height: '2px',
        width: 'calc(100% - 24px)',
        margin: '12px',
      }}
    ></Box>
  );
};

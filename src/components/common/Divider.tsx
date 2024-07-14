import { Box } from '@mui/material';
import theme from '../../theme';

export const Divider: React.FC = () => {
  return (
    <Box
      sx={{
        background: theme.palette.primary.main,
        opacity: 0.3,
        height: '1px',
        width: '100%',
        marginTop: '12px',
        marginBottom: '12px',
      }}
    ></Box>
  );
};

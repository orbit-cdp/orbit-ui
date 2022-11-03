import { Box, Typography } from '@mui/material';
import theme from '../../theme';
import { SectionProps } from '../common/Section';

export interface StackedAprProps extends SectionProps {
  aprLend: string;
  aprBorrow: string;
}

export const StackedApr: React.FC<StackedAprProps> = ({
  aprLend,
  aprBorrow,
  palette,
  sx,
  ...props
}) => {
  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        ...sx,
      }}
    >
      <Box
        sx={{
          padding: '4px',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          color: theme.palette.lend.main,
          background: theme.palette.lend.opaque,
          borderRadius: '5px',
        }}
      >
        <Typography variant="body2">{`${aprLend}`}</Typography>
        <Typography variant="body2">L</Typography>
      </Box>
      <Box
        sx={{
          marginTop: '6px',
          padding: '4px',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          color: theme.palette.borrow.main,
          background: theme.palette.borrow.opaque,
          borderRadius: '5px',
        }}
      >
        <Typography variant="body2">{`${aprBorrow}`}</Typography>
        <Typography variant="body2">B</Typography>
      </Box>
    </Box>
  );
};

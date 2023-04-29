import { Box, BoxProps, Typography } from '@mui/material';
import { PoolIcon } from './PoolIcon';

export interface PoolHeaderProps extends BoxProps {
  name: string;
}

export const PoolHeader: React.FC<PoolHeaderProps> = ({ name, sx, ...props }) => {
  const res_name = name.length > 12 ? name.substring(0, 9) + '...' : name;
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        borderRadius: '5px',
        ...sx,
      }}
      {...props}
    >
      <PoolIcon name={res_name} sx={{ height: '30px', width: '30px' }} />
      <Typography variant="h3" sx={{ marginLeft: '6px' }}>
        {`${res_name} Pool`}
      </Typography>
    </Box>
  );
};

import { Box, Typography } from '@mui/material';
import { useStore } from '../../store/store';
import { PoolComponentProps } from '../common/PoolComponentProps';
import { PoolIcon } from './PoolIcon';

export const PoolHeader: React.FC<PoolComponentProps> = ({ poolId, sx, ...props }) => {
  const pool = useStore((state) => state.pools.get(poolId));

  const res_name = pool ? pool.name : 'Unknown';
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

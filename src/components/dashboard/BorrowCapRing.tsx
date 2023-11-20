import AcUnitIcon from '@mui/icons-material/AcUnit';
import CheckIcon from '@mui/icons-material/Check';
import { Box, BoxProps, CircularProgress, useTheme } from '@mui/material';
import React from 'react';
import { useStore } from '../../store/store';

export interface BorrowCapRingProps extends BoxProps {
  status?: 'Active' | 'On Ice' | 'Frozen' | undefined;
  poolId: string;
}

export const BorrowCapRing: React.FC<BorrowCapRingProps> = ({ status, poolId, ...props }) => {
  const poolUserEstimate = useStore((state) => state.pool_user_est.get(poolId));

  const borrow_capacity_fill = poolUserEstimate
    ? (poolUserEstimate.e_liabilities_base / poolUserEstimate.e_collateral_base) * 100
    : 100;

  const poolStatus = status ? status : 'Active';
  const statusTextColor = poolStatus == 'Active' ? 'primary.main' : 'secondary.main';
  const statusBackColor = poolStatus == 'Active' ? 'primary.opaque' : 'secondary.opaque';
  const statusIcon = poolStatus == 'Active' ? <CheckIcon /> : <AcUnitIcon />;
  const theme = useTheme();
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', width: '66px' }}>
      <CircularProgress
        sx={{ color: theme.palette.primary.main, marginLeft: '18px' }}
        size="30px"
        thickness={4.5}
        variant="determinate"
        value={borrow_capacity_fill}
      />
    </Box>
  );
};

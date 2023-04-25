import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Menu, MenuItem, useTheme } from '@mui/material';
import React from 'react';
import { useStore } from '../../store/store';
import { CustomButton } from '../common/CustomButton';
import { PoolHeader } from './PoolHeader';

export const PoolMenu = () => {
  const theme = useTheme();

  const rewardZone = useStore((state) => state.rewardZone);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <CustomButton
        id="pool-dropdown-button"
        onClick={handleClick}
        sx={{ width: '100%', '&:hover': { backgroundColor: theme.palette.background.default } }}
      >
        <PoolHeader name="Blend" />
        <ArrowDropDownIcon sx={{ color: theme.palette.text.secondary }} />
      </CustomButton>
      <Menu
        id="pool-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'pool-dropdown-button',
          sx: { width: '100%' },
        }}
      >
        <MenuItem onClick={handleClose}>
          <PoolHeader name="Stellar" />
        </MenuItem>
        {rewardZone.map((pool_id) => (
          <MenuItem onClick={handleClose} key={pool_id}>
            <PoolHeader name={pool_id} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

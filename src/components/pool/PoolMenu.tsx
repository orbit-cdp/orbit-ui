import { Menu, MenuItem } from '@mui/material';
import React from 'react';
import { DropdownButton } from '../common/DropdownButton';
import { PoolHeader } from './PoolHeader';

export const PoolMenu = () => {
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
      <DropdownButton id="pool-dropdown-button" onClick={handleClick}>
        <PoolHeader name="Blend" />
      </DropdownButton>
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
        <MenuItem onClick={handleClose}>
          <PoolHeader name="LumenSwap" />
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <PoolHeader name="Blend" />
        </MenuItem>
      </Menu>
    </>
  );
};

import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import { IconButton, Menu, MenuItem, useTheme } from '@mui/material';
import React from 'react';

export const NavMenu = () => {
  const theme = useTheme();
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
      <IconButton
        id="nav-dropdown-button"
        onClick={handleClick}
        sx={{ width: '100%', height: '100%', color: theme.palette.text.secondary }}
      >
        <MoreHorizRoundedIcon />
      </IconButton>
      <Menu
        id="nav-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'pool-dropdown-button',
        }}
        PaperProps={{
          // @ts-ignore - TODO: Figure out why typing is broken
          backgroundColor: theme.palette.menu.main,
        }}
      >
        <MenuItem onClick={handleClose}>Docs</MenuItem>
        <MenuItem onClick={handleClose}>User agreement</MenuItem>
        <MenuItem onClick={handleClose}>Privacy policy</MenuItem>
      </Menu>
    </>
  );
};

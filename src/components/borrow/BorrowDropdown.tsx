import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Menu, MenuItem, useTheme } from '@mui/material';
import React from 'react';
import { CustomButton } from '../common/CustomButton';
import { BorrowHeader } from './BorrowHeader';

export const BorrowDropdown = () => {
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
      <CustomButton
        id="borrow-dropdown-button"
        onClick={handleClick}
        sx={{ width: '100%', '&:hover': { backgroundColor: theme.palette.background.default } }}
      >
        <BorrowHeader name="USDC" />
        <ArrowDropDownIcon sx={{ color: theme.palette.text.secondary }} />
      </CustomButton>
      <Menu
        id="borrow-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'borrow-dropdown-button',
          sx: { width: '100%' },
        }}
      >
        <MenuItem onClick={handleClose}>
          <BorrowHeader name="BLND" />
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <BorrowHeader name="ETH" />
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <BorrowHeader name="USDC" />
        </MenuItem>
      </Menu>
    </>
  );
};

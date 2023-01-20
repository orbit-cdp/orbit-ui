import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Menu, MenuItem, useTheme } from '@mui/material';
import React from 'react';
import { CustomButton } from '../common/CustomButton';
import { WithdrawHeader } from './WithdrawHeader';

export const WithdrawDropdown = () => {
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
        id="withdraw-dropdown-button"
        onClick={handleClick}
        sx={{ width: '100%', '&:hover': { backgroundColor: theme.palette.background.default } }}
      >
        <WithdrawHeader name="USDC" />
        <ArrowDropDownIcon sx={{ color: theme.palette.text.secondary }} />
      </CustomButton>
      <Menu
        id="withdraw-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'withdraw-dropdown-button',
          sx: { width: '100%' },
        }}
      >
        <MenuItem onClick={handleClose}>
          <WithdrawHeader name="BLND" />
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <WithdrawHeader name="ETH" />
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <WithdrawHeader name="USDC" />
        </MenuItem>
      </Menu>
    </>
  );
};

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Menu, MenuItem, useTheme } from '@mui/material';
import React from 'react';
import { CustomButton } from '../common/CustomButton';
import { RepayHeader } from './RepayHeader';

export const RepayDropdown = () => {
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
        id="repay-dropdown-button"
        onClick={handleClick}
        sx={{ width: '100%', '&:hover': { backgroundColor: theme.palette.background.default } }}
      >
        <RepayHeader name="USDC" />
        <ArrowDropDownIcon sx={{ color: theme.palette.text.secondary }} />
      </CustomButton>
      <Menu
        id="repay-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'repay-dropdown-button',
          sx: { width: '100%' },
        }}
      >
        <MenuItem onClick={handleClose}>
          <RepayHeader name="BLND" />
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <RepayHeader name="ETH" />
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <RepayHeader name="USDC" />
        </MenuItem>
      </Menu>
    </>
  );
};

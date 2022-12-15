import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Menu, MenuItem, useTheme } from '@mui/material';
import React from 'react';
import { CustomButton } from '../common/CustomButton';
import { BackstopDepositHeader } from './BackstopDepositHeader';

export const BackstopDepositDropdown = () => {
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
        id="backstopd-dropdown-button"
        onClick={handleClick}
        sx={{ width: '100%', '&:hover': { backgroundColor: theme.palette.background.default } }}
      >
        <BackstopDepositHeader name="BLND" />
        <ArrowDropDownIcon sx={{ color: theme.palette.text.secondary }} />
      </CustomButton>
      <Menu
        id="backstopd-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'backstopd-dropdown-button',
          sx: { width: '100%' },
        }}
      >
        <MenuItem onClick={handleClose}>
          <BackstopDepositHeader name="BLND" />
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <BackstopDepositHeader name="ETH" />
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <BackstopDepositHeader name="USDC" />
        </MenuItem>
      </Menu>
    </>
  );
};

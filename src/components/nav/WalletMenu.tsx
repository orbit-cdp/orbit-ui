import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Button, Menu, MenuItem, Typography, useTheme } from '@mui/material';
import React from 'react';
import * as formatter from '../../utils/formatter';
import { CustomButton } from '../common/CustomButton';
import { WalletIcon } from '../common/WalletIcon';

export const WalletMenu = () => {
  const theme = useTheme();

  // TODO: Fetch from some context
  const isConnected = false;
  const address = 'GCFEEFCTEA4XD43ZYF2PXQ23NF4HF55SIEOTB53YEN5F6XYIUNTJA3NJ';

  const [anchorElDropdown, setAnchorElDropdown] = React.useState<null | HTMLElement>(null);
  const openDropdown = Boolean(anchorElDropdown);

  const [anchorElConnect, setAnchorElConnect] = React.useState<null | HTMLElement>(null);
  const openConnect = Boolean(anchorElConnect);

  const handleClickDropdown = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElDropdown(event.currentTarget);
  };

  const handleClickConnect = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElConnect(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorElDropdown(null);
    setAnchorElConnect(null);
  };

  return (
    <>
      {isConnected ? (
        <CustomButton
          id="wallet-dropdown-button"
          onClick={handleClickDropdown}
          sx={{ width: '100%', height: '100%', color: theme.palette.text.secondary }}
        >
          <WalletIcon name={'Freighter'} />
          <Typography variant="body1" color={theme.palette.text.primary}>
            {formatter.toCompactAddress(address)}
          </Typography>
          <ArrowDropDownIcon sx={{ color: theme.palette.text.secondary }} />
        </CustomButton>
      ) : (
        <Button
          id="connect-wallet-dropdown-button"
          variant="contained"
          color="primary"
          endIcon={<ArrowDropDownIcon />}
          onClick={handleClickConnect}
          sx={{ width: '100%' }}
        >
          Connect Wallet
        </Button>
      )}
      <Menu
        id="wallet-dropdown-menu"
        anchorEl={anchorElDropdown}
        open={openDropdown}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'wallet-dropdown-button',
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
      <Menu
        id="connect-wallet-menu"
        anchorEl={anchorElConnect}
        open={openConnect}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'connect-wallet-dropdown-button',
        }}
        PaperProps={{
          // @ts-ignore - TODO: Figure out why typing is broken
          backgroundColor: theme.palette.menu.main,
        }}
      >
        <MenuItem onClick={handleClose}>
          <WalletIcon name={'Freighter'} />
          <Typography variant="h3" color={theme.palette.text.primary} sx={{ marginLeft: '6px' }}>
            Freighter
          </Typography>
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <WalletIcon name={'Albedo'} />
          <Typography variant="h3" color={theme.palette.text.primary} sx={{ marginLeft: '6px' }}>
            Albedo
          </Typography>
        </MenuItem>
      </Menu>
    </>
  );
};

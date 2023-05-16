import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LogoutIcon from '@mui/icons-material/Logout';
import {
  Alert,
  Button,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Snackbar,
  Typography,
  useTheme,
} from '@mui/material';
import copy from 'copy-to-clipboard';
import React from 'react';
import { useWallet } from '../../contexts/wallet';
import * as formatter from '../../utils/formatter';
import { CustomButton } from '../common/CustomButton';
import { WalletIcon } from '../common/WalletIcon';

export const WalletMenu = () => {
  const theme = useTheme();
  const { connect, disconnect, connected, walletAddress } = useWallet();

  //snackbars
  const [openCon, setOpenCon] = React.useState(false);
  const [openDis, setOpenDis] = React.useState(false);
  const [openCopy, setOpenCopy] = React.useState(false);

  const handleDisconnectWallet = () => {
    disconnect();
    setOpenDis(true);
  };

  const handleCopyAddress = () => {
    copy(walletAddress || '');
    setOpenCopy(true);
  };

  const handleSnackClose = () => {
    setOpenCon(false);
    setOpenDis(false);
    setOpenCopy(false);
  };

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
      {connected ? (
        <CustomButton
          id="wallet-dropdown-button"
          onClick={handleClickDropdown}
          sx={{ width: '100%', height: '100%', color: theme.palette.text.secondary }}
        >
          <WalletIcon name={'Freighter'} />
          <Typography variant="body1" color={theme.palette.text.primary}>
            {formatter.toCompactAddress(walletAddress)}
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
          sx: { width: anchorElDropdown && anchorElDropdown.offsetWidth },
        }}
        PaperProps={{
          // @ts-ignore - TODO: Figure out why typing is broken
          backgroundColor: theme.palette.menu.main,
        }}
      >
        <MenuItem
          onClick={() => {
            handleClose();
            handleCopyAddress();
          }}
        >
          <ListItemText>Copy address</ListItemText>
          <ListItemIcon>
            <ContentCopyIcon />
          </ListItemIcon>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            handleDisconnectWallet();
          }}
          sx={{ color: '#E7424C' }}
        >
          <ListItemText>Disconnect</ListItemText>
          <ListItemIcon>
            <LogoutIcon sx={{ color: '#E7424C' }} />
          </ListItemIcon>
        </MenuItem>
      </Menu>
      <Menu
        id="connect-wallet-menu"
        anchorEl={anchorElConnect}
        open={openConnect}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'connect-wallet-dropdown-button',
          sx: { width: anchorElConnect && anchorElConnect.offsetWidth },
        }}
        PaperProps={{
          // @ts-ignore - TODO: Figure out why typing is broken
          backgroundColor: theme.palette.menu.main,
        }}
      >
        <MenuItem
          onClick={() => {
            handleClose();
            connect();
            setOpenCon(true);
          }}
        >
          <ListItemIcon>
            <WalletIcon name={'Freighter'} />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="h3" color={theme.palette.text.primary} sx={{ marginLeft: '6px' }}>
              Freighter
            </Typography>
          </ListItemText>
        </MenuItem>
      </Menu>

      <Snackbar
        open={openCon}
        autoHideDuration={4000}
        onClose={handleSnackClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <Alert
          onClose={handleClose}
          severity="success"
          sx={{
            backgroundColor: theme.palette.primary.opaque,
            alignItems: 'center',
            width: '100%',
          }}
        >
          Wallet connected.
        </Alert>
      </Snackbar>
      <Snackbar
        open={openDis}
        autoHideDuration={4000}
        onClose={handleSnackClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <Alert
          onClose={handleClose}
          severity="success"
          sx={{
            backgroundColor: theme.palette.primary.opaque,
            alignItems: 'center',
            width: '100%',
          }}
        >
          Wallet disconnected.
        </Alert>
      </Snackbar>
      <Snackbar
        open={openCopy}
        autoHideDuration={4000}
        onClose={handleSnackClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <Alert
          onClose={handleClose}
          severity="success"
          sx={{
            backgroundColor: theme.palette.primary.opaque,
            alignItems: 'center',
            width: '100%',
          }}
        >
          Wallet address copied to clipboard.
        </Alert>
      </Snackbar>
    </>
  );
};

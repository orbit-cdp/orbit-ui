import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import { Alert, IconButton, Menu, MenuItem, Snackbar, useTheme } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Asset, Transaction, xdr } from 'soroban-client';
import { ViewType, useSettings } from '../../contexts';
import { useWallet } from '../../contexts/wallet';
import { useStore } from '../../store/store';
import { requiresTrustline } from '../../utils/horizon';
import { NavItem } from './NavItem';

export const NavMenu = () => {
  const theme = useTheme();
  const { viewType, lastPool } = useSettings();
  const { connected, faucet, walletAddress } = useWallet();

  const network = useStore((state) => state.network);
  const account = useStore((state) => state.account);
  const rewardZone = useStore((state) => state.backstopConfig.rewardZone);
  const loadPoolData = useStore((state) => state.loadPoolData);

  const [poolId, setPoolId] = useState<string>(lastPool ?? '');
  const [openCon, setOpenCon] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSnackClose = () => {
    setOpenCon(false);
  };

  useEffect(() => {
    if (lastPool) {
      setPoolId(lastPool);
    } else {
      setPoolId(rewardZone.length != 0 ? rewardZone[0] : '');
    }
  }, [rewardZone, lastPool]);

  const handleFaucet = async () => {
    if (connected) {
      const url = `https://ewqw4hx7oa.execute-api.us-east-1.amazonaws.com/getAssets?userId=${walletAddress}`;
      try {
        if (
          requiresTrustline(
            account,
            new Asset('USDC', 'GCDUQQ2LP2M32Q563YOJOG36KXO5T635FKSWG4IQWYFE2FQHMMQKYK3S')
          ) ||
          requiresTrustline(
            account,
            new Asset('BLND', 'GCDUQQ2LP2M32Q563YOJOG36KXO5T635FKSWG4IQWYFE2FQHMMQKYK3S')
          )
        ) {
          const resp = await fetch(url, { method: 'GET' });
          const txEnvelopeXDR = (await resp.json()) as { type: string; data: number[] };
          await faucet(
            new Transaction(
              xdr.TransactionEnvelope.fromXDR(Buffer.from(txEnvelopeXDR.data)),
              network.passphrase
            )
          );
          loadPoolData(poolId, walletAddress, true);
        } else {
          setOpenCon(true);
        }
      } catch (e) {
        console.error('Faucet Failed', e);
      }
    }
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
      {viewType === ViewType.REGULAR && (
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
          <MenuItem onClick={handleFaucet}>Faucet</MenuItem>
        </Menu>
      )}
      {viewType !== ViewType.REGULAR && (
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
          <NavItem
            onClick={handleClose}
            to={{ pathname: '/dashboard', query: { poolId: poolId } }}
            title="Dashboard"
            sx={{ width: '90%', justifyContent: 'left', marginBottom: '6px' }}
          />
          <NavItem
            onClick={handleClose}
            to={{ pathname: '/', query: { poolId: poolId } }}
            title="Markets"
            sx={{ width: '90%', justifyContent: 'left', marginBottom: '6px' }}
          />
          <NavItem
            onClick={handleClose}
            to={{ pathname: '/backstop', query: { poolId: poolId } }}
            title="Backstop"
            sx={{ width: '90%', justifyContent: 'left', marginBottom: '6px' }}
          />
          <MenuItem onClick={handleClose}>Docs</MenuItem>
          <MenuItem onClick={handleClose}>User agreement</MenuItem>
          <MenuItem onClick={handleClose}>Privacy policy</MenuItem>
          <MenuItem onClick={handleFaucet}>Faucet</MenuItem>
        </Menu>
      )}

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
          severity="info"
          sx={{
            backgroundColor: theme.palette.info.opaque,
            alignItems: 'center',
            width: '100%',
          }}
        >
          Wallet already received funds.
        </Alert>
      </Snackbar>
    </>
  );
};

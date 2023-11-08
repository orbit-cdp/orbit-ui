import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import { IconButton, Menu, MenuItem, useTheme } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Asset, Transaction, xdr } from 'soroban-client';
import { ViewType, useSettings } from '../../contexts';
import { useWallet } from '../../contexts/wallet';
import { useStore } from '../../store/store';
import { NavItem } from './NavItem';

export const NavMenu = () => {
  const theme = useTheme();
  const network = useStore((state) => state.network);
  let account = useStore((state) => state.account);
  const hasTrustline = useStore((state) => state.hasTrustline);
  const loadAccount = useStore((state) => state.loadAccount);
  const loadPoolData = useStore((state) => state.loadPoolData);
  const { viewType, lastPool } = useSettings();
  const rewardZone = useStore((state) => state.backstopConfig.rewardZone);
  const [poolId, setPoolId] = useState<string>(lastPool ?? '');
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { connected, faucet, walletAddress } = useWallet();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
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
      if (account == undefined) {
        account = await loadAccount(walletAddress);
      }
      try {
        if (
          !hasTrustline(
            new Asset('USDC', 'GCDUQQ2LP2M32Q563YOJOG36KXO5T635FKSWG4IQWYFE2FQHMMQKYK3S'),
            account
          ) ||
          !hasTrustline(
            new Asset('BLND', 'GCDUQQ2LP2M32Q563YOJOG36KXO5T635FKSWG4IQWYFE2FQHMMQKYK3S'),
            account
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
          await loadPoolData(poolId, walletAddress, true);
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
        </Menu>
      )}
    </>
  );
};

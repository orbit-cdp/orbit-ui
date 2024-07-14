import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Box, Button, Icon, Menu, MenuItem, TextField, useTheme } from '@mui/material';
import Image from 'next/image';
import React, { useEffect } from 'react';

interface CoinSelectMenuProps {
  coins: string[];
  selectedCoin: string;
  onSelectCoin: (coin: string) => void;
  amount: string;
  onAmountChange: (amount: string) => void;
}

const coinIconPaths: { [key: string]: string } = {
  XLM: '/icons/tokens/xlm.svg', // Sample path for XLM
  USDC: '/icons/tokens/usdc.svg', // Sample path for USDC
  // Add other coins and their respective paths here
};

const CoinSelectMenu: React.FC<CoinSelectMenuProps> = ({
  coins,
  selectedCoin,
  onSelectCoin,
  amount,
  onAmountChange,
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClickDropdown = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelectCoin = (coin: string) => {
    onSelectCoin(coin);
    handleClose();
  };

  useEffect(() => {
    if (!coins.includes(selectedCoin)) {
      onSelectCoin(coins[0]);
    }
  }, [coins, selectedCoin, onSelectCoin]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%', alignItems: 'center' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', width: '20%' }}>
        <Button
          onClick={handleClickDropdown}
          sx={{ '&:hover': { backgroundColor: theme.palette.background.default } }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <Icon sx={{ borderRadius: '50%' }}>
              <Image
                src={coinIconPaths[selectedCoin]}
                alt={`${selectedCoin}`}
                width="100%"
                height="100%"
              />
            </Icon>
            <Box sx={{ marginLeft: '8px' }}>{selectedCoin}</Box>
            <ArrowDropDownIcon sx={{ color: theme.palette.text.secondary }} />
          </Box>
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'coin-dropdown-button',
            sx: { width: '100%' },
          }}
        >
          {coins.map((coin) => (
            <MenuItem onClick={() => handleSelectCoin(coin)} key={coin}>
              <Icon sx={{ borderRadius: '50%' }}>
                <Image
                  src={coinIconPaths[coin]}
                  alt={`${selectedCoin}`}
                  width="100%"
                  height="100%"
                />
              </Icon>
              <Box sx={{ marginLeft: '8px' }}>{coin}</Box>
            </MenuItem>
          ))}
        </Menu>
      </Box>
      <TextField
        type="number"
        value={amount}
        onChange={(e) => onAmountChange(e.target.value)}
        placeholder={'Amount'}
        fullWidth
        sx={{
          marginTop: '8px',
          width: '80%',
          '& .MuiInputBase-input': {
            textAlign: 'right',
            paddingRight: '10px', // Adjust this value as needed
          },
        }}
      />
    </Box>
  );
};

export default CoinSelectMenu;

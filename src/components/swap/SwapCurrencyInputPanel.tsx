import { Box, InputBase, MenuItem, Select, Typography } from '@mui/material';
import { TokenIcon } from '../common/TokenIcon';

interface SwapCurrencyInputPanelProps {
  label: React.ReactNode;
  value: string;
  onUserInput: (value: string) => void;
  onCurrencySelect: (currency: string) => void;
  currency: string;
  coins: string[];
}

const SwapCurrencyInputPanel: React.FC<SwapCurrencyInputPanelProps> = ({
  label,
  value,
  onUserInput,
  onCurrencySelect,
  currency,
  coins,
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', padding: '12px' }}>
      <Typography variant="body2" sx={{ marginBottom: '6px' }}>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <InputBase
          value={value}
          onChange={(e) => onUserInput(e.target.value)}
          sx={{
            flexGrow: 1,
            marginRight: '12px',
            padding: '6px',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        />
        <Select value={currency} onChange={(e) => onCurrencySelect(e.target.value as string)}>
          {coins.map((coin) => (
            <MenuItem key={coin} value={coin}>
              <TokenIcon symbol={coin} sx={{ marginRight: '6px' }} />
              {coin}
            </MenuItem>
          ))}
        </Select>
      </Box>
    </Box>
  );
};

export default SwapCurrencyInputPanel;

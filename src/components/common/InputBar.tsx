import { Box, BoxProps, Input, PaletteColor, Typography, useTheme } from '@mui/material';
import { CustomButton } from './CustomButton';

export interface InputBarProps extends BoxProps {
  symbol: string;
  value: string | undefined;
  onValueChange: (new_value: string) => void;
  onSetMax: () => void;
  palette: PaletteColor;
  isMaxDisabled?: boolean;
  type?: 'number' | 'text';
}

export const InputBar: React.FC<InputBarProps> = ({
  symbol,
  value,
  onValueChange,
  onSetMax,
  palette,
  sx,
  type = 'number',
  isMaxDisabled,
  ...props
}) => {
  const theme = useTheme();
  /**
   * sanitize input if type is number
   */
  function handleChange(newValue: string) {
    console.log({ newValue });
    if (type === 'number' && newValue !== '') {
      const sanitizedValue = newValue.replace(/[^0-9.\.]/g, '');
      console.log({ sanitizedValue });
      onValueChange(sanitizedValue);
    } else {
      onValueChange(newValue);
    }
  }
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: '3px',
        borderRadius: '5px',
        backgroundColor: theme.palette.accent.main,
        ...sx,
      }}
      {...props}
    >
      <Input
        value={value}
        onChange={(event) => handleChange(event.target.value)}
        placeholder="0"
        disableUnderline={true}
        sx={{ marginLeft: '12px', width: '100%' }}
      />
      <Box sx={{ marginLeft: '12px' }}>
        <Typography variant="h5" sx={{ width: '113px', color: theme.palette.text.secondary }}>
          {symbol}
        </Typography>
      </Box>
      <CustomButton
        onClick={onSetMax}
        disabled={isMaxDisabled}
        sx={{
          color: palette.main,
          backgroundColor: palette.opaque,
          width: '60px',
          marginRight: '2px',
          marginLeft: '12px',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        MAX
      </CustomButton>
    </Box>
  );
};

import { Box, BoxProps, Input, PaletteColor, Typography, useTheme } from '@mui/material';
import { CustomButton } from './CustomButton';

export interface InputBarProps extends BoxProps {
  palette: PaletteColor;
}

export const InputBar: React.FC<InputBarProps> = ({ palette, sx, ...props }) => {
  const theme = useTheme();

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
      <Input placeholder="0" disableUnderline={true} sx={{ marginLeft: '12px', width: '100%' }} />
      <Box sx={{ marginLeft: '12px' }}>
        <Typography variant="h5" sx={{ color: theme.palette.text.secondary }}>
          USDC
        </Typography>
      </Box>
      <CustomButton
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

import { Button, ButtonProps, PaletteColor } from '@mui/material';

export interface OpaqueButtonProps extends ButtonProps {
  palette: PaletteColor;
}

export const OpaqueButton: React.FC<OpaqueButtonProps> = ({ children, palette, sx, ...props }) => {
  return (
    <Button
      variant="contained"
      sx={{
        background: palette.opaque,
        color: palette.main,
        '&:hover': { background: palette.opaque, color: 'white' },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Button>
  );
};

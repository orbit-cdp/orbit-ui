import { Button, ButtonBaseProps, PaletteColor, useTheme } from '@mui/material';
import React from 'react';
import { OpaqueButton } from './OpaqueButton';

export interface ToggleButtonProps extends ButtonBaseProps {
  active: boolean;
  palette: PaletteColor;
}

export const ToggleButton: React.FC<ToggleButtonProps> = ({
  active,
  palette,
  sx,
  children,
  color,
  ...props
}) => {
  const theme = useTheme();
  return (
    <>
      {active ? (
        <OpaqueButton palette={palette} sx={{ ...sx }} {...props}>
          {children}
        </OpaqueButton>
      ) : (
        <Button
          variant="text"
          color="primary"
          sx={{ color: theme.palette.common.white, ...sx }}
          {...props}
        >
          {children}
        </Button>
      )}
    </>
  );
};

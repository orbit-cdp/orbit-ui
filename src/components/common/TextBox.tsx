import { Box, BoxProps, Typography } from '@mui/material';
import React from 'react';

export interface TextBoxProps extends BoxProps {
  text: string;
  align?: 'right' | 'left' | 'inherit' | 'center' | 'justify' | undefined;
  subtext?: string;
}

export const TextBox: React.FC<TextBoxProps> = ({ text, align, subtext, ...props }) => {
  const typographyAlign = align ? align : 'inherit';
  return (
    <Box sx={{ flexDirection: 'column', justifyContent: 'center', ...props.sx }}>
      <Typography
        variant="body1"
        align={typographyAlign}
        sx={{ lineHeight: '105%', alignItems: 'flex-end' }}
      >
        {text}
      </Typography>
      {subtext != undefined && (
        <Typography
          variant="subtitle1"
          color="text.secondary"
          align={typographyAlign}
          sx={{ lineHeight: '105%', alignItems: 'flex-start' }}
        >
          {subtext}
        </Typography>
      )}
    </Box>
  );
};

import { Box, BoxProps, Typography } from '@mui/material';
import React from 'react';

export interface StackedTextProps extends BoxProps {
  title: string;
  text: string;
  type?: 'normal' | 'large' | undefined;
  titleColor?: string | undefined;
  textColor?: string | undefined;
}

export const StackedText: React.FC<StackedTextProps> = ({
  title,
  text,
  type,
  titleColor,
  textColor,
  ...props
}) => {
  const textType = type ? type : 'normal';
  const textVariant = textType == 'large' ? 'h2' : 'h4';
  const muiTitleColor = titleColor ? titleColor : 'text.secondary';
  const muiTextColor = textColor ? textColor : 'text.primary';
  return (
    <Box sx={{ flexDirection: 'column', justifyContent: 'center', ...props.sx }}>
      <Typography variant="body2" color={muiTitleColor} sx={{ alignItems: 'flex-end' }}>
        {title}
      </Typography>
      <Typography variant={textVariant} color={muiTextColor} sx={{ alignItems: 'flex-start' }}>
        {text}
      </Typography>
    </Box>
  );
};

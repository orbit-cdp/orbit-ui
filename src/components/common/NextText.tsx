import { Box, BoxProps, Typography } from '@mui/material';
import React from 'react';

export interface NextTextProps extends BoxProps {
  title: string;
  text: string;
  type?: 'normal' | 'large' | undefined;
  titleColor?: string | undefined;
  textColor?: string | undefined;
}

export const NextText: React.FC<NextTextProps> = ({
  title,
  text,
  type,
  titleColor,
  textColor,
  ...props
}) => {
  const textType = type ? type : 'normal';
  const textVariant = textType == 'large' ? 'h2' : 'h4';
  const muiTitleColor = 'text.secondary';
  const muiTextColor = textColor ? textColor : 'text.primary';
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-start',
        ...props.sx,
      }}
    >
      <Typography variant={textVariant} color={muiTextColor} sx={{ marginRight: '6px' }}>
        {text}
      </Typography>
      <Typography variant="body1" color={muiTitleColor}>
        {title}
      </Typography>
    </Box>
  );
};

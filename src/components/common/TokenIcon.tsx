import { Icon, IconProps } from '@mui/material';
import Image from 'next/image';
import React from 'react';

export interface TokenIconProps extends IconProps {
  symbol: string;
}

export const TokenIcon: React.FC<TokenIconProps> = ({ symbol, ...props }) => {
  return (
    <Icon sx={{ borderRadius: '50%', ...props.sx }} {...props}>
      <Image
        src={`/icons/tokens/${symbol.toLowerCase()}.svg`}
        alt={`${symbol}`}
        width="100%"
        height="100%"
      />
    </Icon>
  );
};

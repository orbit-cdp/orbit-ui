import { IconProps as MuiIconProps } from '@mui/material';
import React from 'react';
import { Icon } from './Icon';

export interface TokenIconProps extends MuiIconProps {
  symbol: string;
}

export const TokenIcon: React.FC<TokenIconProps> = ({ symbol, ...props }) => {
  return <Icon src={`/icons/tokens/${symbol.toLowerCase()}.svg`} alt={`${symbol}`} {...props} />;
};

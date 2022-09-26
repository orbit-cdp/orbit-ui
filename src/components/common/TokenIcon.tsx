import React from 'react';
import { Icon } from './Icon';

export interface TokenIconProps {
  symbol: string;
}

export const TokenIcon: React.FC<TokenIconProps> = ({ symbol, ...props }) => {
  return <Icon src={`/icons/tokens/${symbol.toLowerCase()}.svg`} alt={`${symbol}`} {...props} />;
};

import { IconProps as MuiIconProps } from '@mui/material';
import React from 'react';

import { useStore } from '../../store/store';
import { Icon } from './Icon';

export interface TokenIconProps extends MuiIconProps {
  symbol: string;
  assetId?: string;
}
export const TokenIcon: React.FC<TokenIconProps> = ({ symbol, assetId, ...props }) => {
  const assetStellarMetadata = useStore((state) => state.assetStellarMetadata);
  if (assetId) {
    const tokenMetadata = assetStellarMetadata.get(assetId);
    console.log({ assetStellarMetadata, tokenMetadata, assetId, symbol });
    if (tokenMetadata) {
      return <Icon src={tokenMetadata.image} alt={`${tokenMetadata.code}`} {...props} />;
    }
  }
  return <Icon src={`/icons/tokens/${symbol.toLowerCase()}.svg`} alt={`${symbol}`} {...props} />;
};

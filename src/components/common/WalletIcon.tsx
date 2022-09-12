import { Icon, IconProps } from '@mui/material';
import Image from 'next/image';
import React from 'react';

export interface WalletIconProps extends IconProps {
  name: string;
}

export const WalletIcon: React.FC<WalletIconProps> = ({ name, ...props }) => {
  return (
    <Icon sx={{ borderRadius: '50%', ...props.sx }} {...props}>
      <Image
        src={`/icons/wallets/${name.toLowerCase()}.svg`}
        alt={`${name}`}
        width="100%"
        height="100%"
      />
    </Icon>
  );
};

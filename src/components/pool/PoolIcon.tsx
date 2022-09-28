import { Icon, IconProps } from '@mui/material';
import Image from 'next/image';
import React from 'react';

export interface PoolIconProps extends IconProps {
  name: string;
}

export const PoolIcon: React.FC<PoolIconProps> = ({ name, ...props }) => {
  return (
    <Icon sx={{ borderRadius: '50%', ...props.sx }} {...props}>
      <Image
        src={`/icons/pools/${name.toLowerCase()}.svg`}
        alt={`${name}`}
        width="100%"
        height="100%"
      />
    </Icon>
  );
};

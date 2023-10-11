import AcUnitIcon from '@mui/icons-material/AcUnit';
import CheckIcon from '@mui/icons-material/Check';
import { Box, BoxProps, Typography, useTheme } from '@mui/material';
import React from 'react';

export interface PoolStatusBoxProps extends BoxProps {
  type?: 'normal' | 'large' | undefined;
  titleColor?: string | undefined;
  status?: 'Active' | 'On Ice' | 'Frozen' | undefined;
}

export const PoolStatusBox: React.FC<PoolStatusBoxProps> = ({
  type,
  titleColor,
  status,
  ...props
}) => {
  const textType = type ? type : 'normal';
  const textVariant = textType == 'large' ? 'h2' : 'h4';
  const muiTitleColor = titleColor ? titleColor : 'text.secondary';
  const poolStatus = status ? status : 'Active';
  const statusTextColor = poolStatus == 'Active' ? 'primary.main' : 'secondary.main';
  const statusBackColor = poolStatus == 'Active' ? 'primary.opaque' : 'secondary.opaque';
  const statusIcon = poolStatus == 'Active' ? <CheckIcon /> : <AcUnitIcon />;
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        ...props.sx,
      }}
    >
      <Typography variant="body2" color={muiTitleColor}>
        Pool Status
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        <Box
          sx={{
            backgroundColor: statusBackColor,
            paddingTop: '2px',
            paddingBottom: '2px',
            paddingLeft: '8px',
            paddingRight: '8px',
            marginRight: '6px',
            borderRadius: '5px',
          }}
        >
          <Typography variant={textVariant} color={statusTextColor}>
            {poolStatus}
          </Typography>
        </Box>
        <Box
          sx={{
            backgroundColor: statusBackColor,
            color: statusTextColor,
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            padding: '3px',
          }}
        >
          {statusIcon}
        </Box>
      </Box>
    </Box>
  );
};

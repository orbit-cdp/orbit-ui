import { Box, BoxProps, Typography } from '@mui/material';
import { TokenIcon } from './TokenIcon';

/// @dev TODO: Consider consolidation of icons / headers

export interface TokenHeaderProps extends BoxProps {
  code: string;
  issuer: string;
}

export const TokenHeader: React.FC<TokenHeaderProps> = ({ code, issuer, sx, ...props }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        borderRadius: '5px',
        ...sx,
      }}
      {...props}
    >
      <TokenIcon symbol={code} sx={{ width: '32px', height: '32px', marginRight: '6px' }} />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
      >
        <Typography variant="body1">{code}</Typography>
        <Typography variant="body2" color="text.secondary">
          {issuer}
        </Typography>
      </Box>
    </Box>
  );
};

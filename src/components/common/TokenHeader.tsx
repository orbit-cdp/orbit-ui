import { Box, BoxProps, Typography } from '@mui/material';
import { TOKEN_META } from '../../utils/token_display';
import { TokenIcon } from './TokenIcon';

/// @dev TODO: Consider consolidation of icons / headers

export interface TokenHeaderProps extends BoxProps {
  id: string;
}

export const TokenHeader: React.FC<TokenHeaderProps> = ({ id, sx, ...props }) => {
  // TODO: Find a better way to do this
  const code = TOKEN_META[id as keyof typeof TOKEN_META]?.code ?? 'unkown';
  const issuer = TOKEN_META[id as keyof typeof TOKEN_META]?.issuer ?? '';
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
      <TokenIcon
        assetId={id}
        symbol={code}
        sx={{ width: '32px', height: '32px', marginRight: '6px' }}
      />
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

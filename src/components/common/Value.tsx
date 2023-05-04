import { Box, BoxProps, Typography, useTheme } from '@mui/material';

export interface ValueProps extends BoxProps {
  title: string;
  value: string;
}

export const Value: React.FC<ValueProps> = ({ title, value, sx, ...props }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        marginLeft: '24px',
        marginBottom: '12px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        ...sx,
      }}
      {...props}
    >
      <Typography variant="h5" sx={{ color: theme.palette.text.secondary, marginRight: '6px' }}>
        {title}
      </Typography>
      <Typography variant="h5" sx={{ color: theme.palette.text.primary, marginRight: '6px' }}>
        {value}
      </Typography>
    </Box>
  );
};

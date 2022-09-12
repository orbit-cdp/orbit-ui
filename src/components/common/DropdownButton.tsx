import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { ButtonBase, ButtonBaseProps } from '@mui/material';
import theme from '../../theme';

export const DropdownButton: React.FC<ButtonBaseProps> = ({ children, sx, ...props }) => {
  return (
    <ButtonBase
      sx={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '6px',
        borderRadius: '5px',
        transition: 'all 0.2s',
        '&:hover': {
          backgroundColor: theme.palette.background.default,
        },
        ...sx,
      }}
      {...props}
    >
      {children}
      <ArrowDropDownIcon sx={{ color: theme.palette.text.secondary }} />
    </ButtonBase>
  );
};

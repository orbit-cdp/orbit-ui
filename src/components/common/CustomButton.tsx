import { ButtonBase, ButtonBaseProps } from '@mui/material';

export const CustomButton: React.FC<ButtonBaseProps> = ({ children, sx, ...props }) => {
  return (
    <ButtonBase
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '6px',
        borderRadius: '5px',
        transition: 'all 0.2s',
        ...sx,
      }}
      {...props}
    >
      {children}
    </ButtonBase>
  );
};

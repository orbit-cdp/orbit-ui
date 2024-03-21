import { Icon as MuiIcon, IconProps as MuiIconProps } from '@mui/material';

export interface LetterIconProps extends MuiIconProps {
  height?: string;
  width?: string;
  isCircle?: boolean;
  text: string;
}

export const LetterIcon: React.FC<LetterIconProps> = ({
  height,
  width,
  isCircle,
  text,
  sx,
  ...props
}) => {
  const resolvedHeight = height != undefined ? height : '30px';
  const resolvedWidth = width != undefined ? width : '30px';
  const resolvedIsCircle = isCircle == undefined ? true : isCircle;
  return (
    <MuiIcon
      sx={{
        borderRadius: resolvedIsCircle ? '50%' : '5px',
        height: resolvedHeight,
        width: resolvedWidth,
        background: 'white',
        color: 'black',
        ...sx,
      }}
      {...props}
    >
      {text}
    </MuiIcon>
  );
};

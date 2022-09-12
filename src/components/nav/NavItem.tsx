import { Button, ButtonProps, useTheme } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { OpaqueButton } from '../common/OpaqueButton';

export interface INavItemProps extends ButtonProps {
  to: string;
  title: string;
}

export const NavItem = ({ to, title, sx, ...props }: INavItemProps) => {
  const theme = useTheme();
  const router = useRouter();
  const active = to == router.route;

  return (
    <Link href={to}>
      {active ? (
        <OpaqueButton
          palette={theme.palette.primary}
          sx={{ margin: '0px 6px 0px', ...sx }}
          {...props}
        >
          {title}
        </OpaqueButton>
      ) : (
        <Button
          variant="text"
          color="primary"
          sx={{ color: theme.palette.common.white, margin: '0px 6px 0px', ...sx }}
          {...props}
        >
          {title}
        </Button>
      )}
    </Link>
  );
};

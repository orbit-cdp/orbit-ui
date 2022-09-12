import { Box } from '@mui/material';
import { ReactNode } from 'react';
import { NavBar } from '../components/nav/NavBar';
import { useSettings, ViewType } from '../contexts';

export default function DefaultLayout({ children }: { children: ReactNode }) {
  const { viewType } = useSettings();

  const mainWidth = viewType <= ViewType.COMPACT ? '100%' : '886px';
  const mainMargin = viewType <= ViewType.COMPACT ? '0px' : '62px';
  return (
    <>
      <Box sx={{ height: '30px' }} />
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <Box />
        <Box component="main" sx={{ width: mainWidth, minWidth: '350px' }}>
          <NavBar />
          <Box sx={{ marginLeft: mainMargin, marginRight: mainMargin }}>{children}</Box>
        </Box>
        <Box />
      </Box>
    </>
  );
}

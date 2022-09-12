import { Box, IconButton } from '@mui/material';
import Image from 'next/image';
import { useSettings, ViewType } from '../../contexts';
import { Row } from '../common/Row';
import { Section, SectionSize } from '../common/Section';
import { SectionBase } from '../common/SectionBase';
import { NavItem } from './NavItem';
import { NavMenu } from './NavMenu';
import { WalletMenu } from './WalletMenu';

export const NavBar = () => {
  const { viewType } = useSettings();
  return (
    <Row sx={{ height: '62px' }}>
      <SectionBase sx={{ width: '50px', margin: '6px' }}>
        <a href="https://script3.com" target="_blank" rel="noreferrer">
          <IconButton sx={{ width: '100%', height: '100%' }}>
            <Image src="/icons/blend_logo.svg" layout="fill" alt="Blend Logo" />
          </IconButton>
        </a>
      </SectionBase>
      {viewType === ViewType.REGULAR && (
        <Box
          sx={{
            width: '762px',
            height: '100%',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <Section width={SectionSize.LARGE}>
            <NavItem to="/" title="Dashboard" sx={{ width: '33%' }} />
            <NavItem to="/market" title="Market" sx={{ width: '33%' }} />
            <NavItem to="/test" title="Test" sx={{ width: '33%' }} />
          </Section>
          <Section width={SectionSize.SMALL}>
            <WalletMenu />
          </Section>
        </Box>
      )}
      {viewType !== ViewType.REGULAR && (
        <SectionBase sx={{ width: 'calc(100% - 124px)', padding: '6px', margin: '6px' }}>
          <WalletMenu />
        </SectionBase>
      )}

      <SectionBase sx={{ width: '50px', margin: '6px' }}>
        <NavMenu />
      </SectionBase>
    </Row>
  );
};
